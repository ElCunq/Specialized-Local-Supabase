import { NextRequest, NextResponse } from "next/server";
import { db, ensureDbMigrated } from "@/db";
import { tenants, apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateRandomSecret, generateProjectJwtTokens } from "@/lib/security/crypto";
import { createTenantPod } from "@/lib/docker/orchestrator";
import { docker } from "@/lib/docker/client";

/**
 * Fetches real-time RAM and CPU metrics for a tenant's PostgreSQL container
 */
async function getContainerMetrics(slug: string, status: string) {
  if (status !== "active") {
    return { ramUsage: "0 MB", cpuUsage: "0 %" };
  }

  try {
    const container = docker.getContainer(`project_${slug}_db`);
    const stats: any = await container.stats({ stream: false });

    // Calculate RAM usage (usage minus cache for accurate resident memory)
    const memUsageBytes = stats.memory_stats?.usage || 0;
    const cacheBytes = stats.memory_stats?.stats?.cache || 0;
    const netMemBytes = Math.max(0, memUsageBytes - cacheBytes);
    const ramMb = (netMemBytes / (1024 * 1024)).toFixed(1);

    // Calculate CPU usage percentage
    const cpuDelta = (stats.cpu_stats?.cpu_usage?.total_usage || 0) - (stats.precpu_stats?.cpu_usage?.total_usage || 0);
    const systemCpuDelta = (stats.cpu_stats?.system_cpu_usage || 0) - (stats.precpu_stats?.system_cpu_usage || 0);
    const numberCpus = stats.cpu_stats?.online_cpus || 1;
    let cpuPercent = "0.1";
    if (systemCpuDelta > 0 && cpuDelta > 0) {
      cpuPercent = ((cpuDelta / systemCpuDelta) * numberCpus * 100).toFixed(1);
    }

    return {
      ramUsage: `${ramMb} MB`,
      cpuUsage: `${cpuPercent} %`,
    };
  } catch (e) {
    return { ramUsage: "0 MB", cpuUsage: "0 %" };
  }
}

export async function GET() {
  try {
    await ensureDbMigrated();
    const allProjects = await db.select().from(tenants);

    // Query live Docker stats in parallel for all projects
    const projectsWithMetrics = await Promise.all(
      allProjects.map(async (project) => {
        const metrics = await getContainerMetrics(project.slug, project.status);
        return {
          ...project,
          ramUsage: metrics.ramUsage,
          cpuUsage: metrics.cpuUsage,
        };
      })
    );

    return NextResponse.json({ success: true, projects: projectsWithMetrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbMigrated();
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

    // Spin up Docker Tenant Pod
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
