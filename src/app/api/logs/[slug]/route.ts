import { NextResponse } from "next/server";
import Docker from "dockerode";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock" });

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const url = new URL(req.url);
    const service = url.searchParams.get("service") || "db"; // db, rest, meta, auth

    const project = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const validServices = ["db", "rest", "meta", "auth"];
    if (!validServices.includes(service)) {
      return NextResponse.json({ success: false, error: "Invalid service" }, { status: 400 });
    }

    const containerName = `project_${slug}_${service}`;
    const container = docker.getContainer(containerName);

    try {
      await container.inspect();
    } catch (err) {
      return NextResponse.json({ success: false, error: `Container ${containerName} not found or not running` }, { status: 404 });
    }

    // Fetch the last 1000 lines of logs
    const logBuffer = await container.logs({
      stdout: true,
      stderr: true,
      tail: 1000,
      timestamps: true,
    });

    // Clean up Docker log stream multiplexing headers (8 byte header per log line)
    // For simplicity in a basic API, we can just convert buffer to string, but it will have binary chars.
    // Let's manually demux it or use dockerode's demux stream if we want it perfect.
    // For an API returning JSON, it's easier to just parse the buffer here.
    
    let logs = "";
    let offset = 0;
    while (offset < logBuffer.length) {
      const header = logBuffer.subarray(offset, offset + 8);
      if (header.length < 8) break;
      const type = header.readUInt8(0);
      const length = header.readUInt32BE(4);
      const payload = logBuffer.subarray(offset + 8, offset + 8 + length);
      logs += payload.toString("utf8");
      offset += 8 + length;
    }

    // Split into array of lines
    const lines = logs.split("\n").filter(line => line.trim().length > 0);

    return NextResponse.json({ success: true, data: lines });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
