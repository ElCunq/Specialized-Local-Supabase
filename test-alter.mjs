import { createClient } from "@libsql/client";
const client = createClient({ url: "file:data/master_control_plane.db" });
async function run() {
  try {
    await client.execute("ALTER TABLE tenants ADD COLUMN last_active_at INTEGER NOT NULL DEFAULT (unixepoch());");
    console.log("SUCCESS");
  } catch(e) {
    console.log("ERROR:", e.message);
  }
}
run();
