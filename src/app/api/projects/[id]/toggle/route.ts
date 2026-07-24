import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toggleTenantStatus } from "@/lib/docker/orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action } = body; // 'pause' | 'resume'

    if (!action || (action !== "pause" && action !== "resume")) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'pause' or 'resume'." },
        { status: 400 }
      );
    }

    const [project] = await db.select().from(tenants).where(eq(tenants.id, params.id));

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Toggle Docker Containers
    await toggleTenantStatus(project.slug, action);

    // Update Status in Master DB
    const newStatus = action === "pause" ? "paused" : "active";
    await db.update(tenants).set({ status: newStatus }).where(eq(tenants.id, params.id));

    return NextResponse.json({
      success: true,
      message: `Project ${project.slug} is now ${newStatus}.`,
      status: newStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
