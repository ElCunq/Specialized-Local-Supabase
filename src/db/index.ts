import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const sqliteDbPath = process.env.DATABASE_URL || "file:data/master_control_plane.db";

// Ensure data directory exists if file path contains subdirectories
if (sqliteDbPath.startsWith("file:")) {
  const filePath = sqliteDbPath.replace("file:", "");
  const dir = path.dirname(filePath);
  
  if (dir && dir !== "." && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Auto-migrate old database if it exists in root
  const oldPath = path.join(process.cwd(), "master_control_plane.db");
  const newPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    console.log(`[DB] Moving existing database from root to ${newPath}`);
    fs.copyFileSync(oldPath, newPath);
    // Don't delete old path immediately just in case, but new path takes precedence
  }
}

const client = createClient({
  url: sqliteDbPath,
});

let isMigrated = false;
let migrationPromise: Promise<void> | null = null;

async function runMigrations() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'provisioning',
        jwt_secret TEXT NOT NULL,
        db_password TEXT NOT NULL,
        anon_key TEXT,
        service_key TEXT,
        db_port INTEGER,
        rest_port INTEGER,
        addon_redis INTEGER NOT NULL DEFAULT 0,
        addon_edge_functions INTEGER NOT NULL DEFAULT 0,
        auto_pause_interval INTEGER NOT NULL DEFAULT 1440,
        last_active_at INTEGER NOT NULL DEFAULT (unixepoch()),
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        cpu_usage REAL NOT NULL DEFAULT 0,
        ram_usage_mb REAL NOT NULL DEFAULT 0,
        last_ping INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
  } catch (err) {
    // Ignore lock errors if another worker migrated
  }

  // Schema updates (migrations)
  try {
    await client.execute(`ALTER TABLE tenants ADD COLUMN addon_redis INTEGER NOT NULL DEFAULT 0;`);
  } catch (e) {}
  try {
    await client.execute(`ALTER TABLE tenants ADD COLUMN addon_edge_functions INTEGER NOT NULL DEFAULT 0;`);
  } catch (e) {}
  try {
    await client.execute(`ALTER TABLE tenants ADD COLUMN auto_pause_interval INTEGER NOT NULL DEFAULT 1440;`);
  } catch (e) {}
  try {
    await client.execute(`ALTER TABLE tenants ADD COLUMN last_active_at INTEGER NOT NULL DEFAULT (unixepoch());`);
  } catch (e) {}

  isMigrated = true;
}

/**
 * Ensures master database tables (tenants, metrics, api_keys) exist prior to queries
 */
export async function ensureDbMigrated() {
  if (isMigrated) return;
  if (!migrationPromise) {
    migrationPromise = runMigrations();
  }
  return migrationPromise;
}

import { startCron } from "@/lib/docker/cron";

// ... ensureDbMigrated code ...
ensureDbMigrated().then(() => {
  // Start the scale-to-zero background worker after DB is ready
  // Skip during build phase
  if (process.env.npm_lifecycle_event !== "build" && process.env.NEXT_PHASE !== "phase-production-build") {
    startCron();
  }
});

export const db = drizzle(client, { schema });
