import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toggleAddon } from "@/lib/docker/orchestrator";

// Force Node.js runtime since dockerode doesn't run on Edge
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { addon, enabled } = body; // addon: 'redis' | 'edge_functions'

    if (!addon || !['redis', 'edge_functions'].includes(addon)) {
      return NextResponse.json({ success: false, error: "Invalid addon specified" }, { status: 400 });
    }

    // 1. Get Tenant
    const tenantRows = await db.select().from(tenants).where(eq(tenants.id, id));
    const tenant = tenantRows[0];

    if (!tenant) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // 2. Toggle Docker Container
    await toggleAddon(tenant.slug, addon as 'redis' | 'edge_functions', enabled);

    // 3. Update SQLite DB
    if (addon === 'redis') {
      await db.update(tenants).set({ addonRedis: enabled ? 1 : 0 }).where(eq(tenants.id, id));
    } else if (addon === 'edge_functions') {
      await db.update(tenants).set({ addonEdgeFunctions: enabled ? 1 : 0 }).where(eq(tenants.id, id));
    }

    return NextResponse.json({ success: true, message: `Addon ${addon} ${enabled ? 'enabled' : 'disabled'} successfully.` });

  } catch (error: any) {
    console.error("Addons API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
