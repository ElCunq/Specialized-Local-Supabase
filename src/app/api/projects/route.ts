import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateRandomSecret, generateProjectJwtTokens } from "@/lib/security/crypto";
import { createTenantPod } from "@/lib/docker/orchestrator";

export async function GET() {
  try {
    const allProjects = await db.select().from(tenants);
    return NextResponse.json({ success: true, projects: allProjects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug: rawSlug } = body;

    if (!name || !rawSlug) {
      return NextResponse.json(
        { success: false, error: "Name and Slug are required." },
        { status: 400 }
      );
    }

    const slug = rawSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    // Check if slug already exists
    const existing = await db.select().from(tenants).where(eq(tenants.slug, slug));
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Project slug '${slug}' already exists.` },
        { status: 400 }
      );
    }

    const id = `prj_${Date.now()}`;
    const jwtSecret = generateRandomSecret(32);
    const dbPassword = generateRandomSecret(16);
    const { anonKey, serviceKey } = generateProjectJwtTokens(jwtSecret, slug);

    // Insert into DB as provisioning
    await db.insert(tenants).values({
      id,
      name,
      slug,
      status: "provisioning",
      jwtSecret,
      dbPassword,
      anonKey,
      serviceKey,
    });

    // Save API keys
    await db.insert(apiKeys).values([
      {
        id: `key_anon_${Date.now()}`,
        tenantId: id,
        name: "Anon Key",
        role: "anon",
        token: anonKey,
      },
      {
        id: `key_service_${Date.now()}`,
        tenantId: id,
        name: "Service Role Key",
        role: "service_role",
        token: serviceKey,
      },
    ]);

    // Asynchronously or synchronously spin up Docker Tenant Pod
    try {
      await createTenantPod({
        id,
        name,
        slug,
        jwtSecret,
        dbPassword,
      });

      // Update status to active
      await db.update(tenants).set({ status: "active" }).where(eq(tenants.id, id));
    } catch (dockerError: any) {
      console.error("[Orchestrator Error]", dockerError);
      await db.update(tenants).set({ status: "failed" }).where(eq(tenants.id, id));
      return NextResponse.json(
        {
          success: false,
          error: `Project DB record created, but Docker Pod failed: ${dockerError.message}`,
        },
        { status: 500 }
      );
    }

    const [createdProject] = await db.select().from(tenants).where(eq(tenants.id, id));

    return NextResponse.json(
      {
        success: true,
        project: createdProject,
        apiKeys: { anonKey, serviceKey },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
