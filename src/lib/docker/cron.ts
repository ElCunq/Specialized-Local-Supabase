import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { toggleTenantStatus } from "./orchestrator";
import { docker } from "./client";

let isRunning = false;
let previousStats: Record<string, number> = {};

// Checks activity of all active tenants
export async function runScaleToZeroCheck() {
  if (isRunning) return;
  isRunning = true;
  
  try {
    // 1. Get all active tenants
    const activeTenants = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.status, "active"), ne(tenants.autoPauseInterval, 0)));
      
    for (const tenant of activeTenants) {
      try {
        const containerName = `project_${tenant.slug}_db`;
        const container = docker.getContainer(containerName);
        
        // Execute SQL to get total user requests
        const exec = await container.exec({
          Cmd: ["psql", "-U", "postgres", "-d", "postgres", "-t", "-A", "-c", "SELECT COALESCE(SUM(seq_scan + idx_scan + n_tup_ins + n_tup_upd + n_tup_del), 0) FROM pg_stat_user_tables;"],
          AttachStdout: true,
          AttachStderr: true,
        });

        const output = await new Promise<string>((resolve, reject) => {
          exec.start({}, (err, stream) => {
            if (err) return reject(err);
            let out = "";
            stream?.on("data", (chunk) => (out += chunk.toString("utf8")));
            stream?.on("end", () => resolve(out));
          });
        });

        const currentRequests = parseInt(output.trim()) || 0;
        const prevRequests = previousStats[tenant.id] || 0;
        
        const now = new Date();
        const lastActive = new Date(tenant.lastActiveAt);
        const minutesIdle = (now.getTime() - lastActive.getTime()) / 1000 / 60;

        if (currentRequests > prevRequests) {
          // Project is active! Update last_active_at
          await db.update(tenants).set({ lastActiveAt: now }).where(eq(tenants.id, tenant.id));
          previousStats[tenant.id] = currentRequests;
        } else {
          // Project is idle
          if (tenant.autoPauseInterval > 0 && minutesIdle >= tenant.autoPauseInterval) {
            console.log(`[Scale-to-Zero] Pausing project ${tenant.slug} due to ${minutesIdle.toFixed(1)} mins of inactivity.`);
            await toggleTenantStatus(tenant.slug, "pause");
            await db.update(tenants).set({ status: "paused" }).where(eq(tenants.id, tenant.id));
          }
        }
      } catch (err) {
        console.error(`[Scale-to-Zero] Error checking tenant ${tenant.slug}:`, err);
      }
    }
  } catch (e) {
    console.error("[Scale-to-Zero] Global error:", e);
  } finally {
    isRunning = false;
  }
}

// Start interval if not already started
let intervalStarted = false;
export function startCron() {
  if (intervalStarted) return;
  intervalStarted = true;
  
  // Run every 5 minutes
  setInterval(runScaleToZeroCheck, 5 * 60 * 1000);
  console.log("[Cron] Scale-to-Zero monitor started.");
}
