import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const sqliteDbPath = process.env.DATABASE_URL || "file:master_control_plane.db";
const client = createClient({
  url: sqliteDbPath,
});

export const db = drizzle(client, { schema });
