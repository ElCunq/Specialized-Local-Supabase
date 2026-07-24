import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteTenantPod, getTenantMetrics } from "@/lib/docker/orchestrator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [project] = await db.select().from(tenants).where(eq(tenants.id, params.id));

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    let dockerStats = null;
    try {
      dockerStats = await getTenantMetrics(project.slug);
    } catch {}

    return NextResponse.json({
      success: true,
      project,
      dockerStats,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [project] = await db.select().from(tenants).where(eq(tenants.id, params.id));

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // 1. Teardown Docker Pod
    await deleteTenantPod(project.slug, true);

    // 2. Remove DB Record
    await db.delete(tenants).where(eq(tenants.id, params.id));

    return NextResponse.json({ success: true, message: `Project ${project.name} deleted.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
