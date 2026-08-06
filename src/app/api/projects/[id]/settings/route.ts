import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { autoPauseInterval } = body;

    if (typeof autoPauseInterval !== "number") {
      return NextResponse.json({ success: false, error: "Invalid autoPauseInterval specified" }, { status: 400 });
    }

    // 1. Get Tenant
    const tenantRows = await db.select().from(tenants).where(eq(tenants.id, id));
    const tenant = tenantRows[0];

    if (!tenant) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // 2. Update SQLite DB
    await db.update(tenants).set({ autoPauseInterval }).where(eq(tenants.id, id));

    return NextResponse.json({ success: true, message: `Auto-pause interval updated.` });

  } catch (error: any) {
    console.error("Settings API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
