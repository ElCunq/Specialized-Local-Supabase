import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const sqliteDbPath = process.env.DATABASE_URL || "file:master_control_plane.db";

// Ensure data directory exists if file path contains subdirectories
if (sqliteDbPath.startsWith("file:")) {
  const filePath = sqliteDbPath.replace("file:", "");
  const dir = path.dirname(filePath);
  if (dir && dir !== "." && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const client = createClient({
  url: sqliteDbPath,
});

let isMigrated = false;

/**
 * Ensures master database tables (tenants, metrics, api_keys) exist prior to queries
 */
export async function ensureDbMigrated() {
  if (isMigrated) return;
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
    isMigrated = true;
  } catch (err) {
    // Ignore lock errors if another worker migrated
    isMigrated = true;
  }
}

ensureDbMigrated();

export const db = drizzle(client, { schema });
