import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const sqliteDbPath = process.env.DATABASE_URL || "file:master_control_plane.db";

// Ensure directory exists if SQLite file path is nested (e.g. /app/data/master_control_plane.db)
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

export const db = drizzle(client, { schema });
