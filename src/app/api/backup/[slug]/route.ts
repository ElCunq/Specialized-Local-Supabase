import { NextRequest, NextResponse } from "next/server";
import { docker } from "@/lib/docker/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const containerName = `project_${slug}_db`;
    const container = docker.getContainer(containerName);

    // Run pg_dump to produce full database dump SQL
    const exec = await container.exec({
      Cmd: ["pg_dump", "-U", "postgres", "-d", "postgres", "--clean", "--if-exists"],
      AttachStdout: true,
      AttachStderr: true,
    });

    const sqlDump: string = await new Promise((resolve, reject) => {
      exec.start({}, (err, stream) => {
        if (err) return reject(err);
        let output = "";
        stream?.on("data", (chunk) => (output += chunk.toString("utf8")));
        stream?.on("end", () => resolve(output));
      });
    });

    return new Response(sqlDump, {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${slug}_backup_${Date.now()}.sql"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { sqlDump } = await req.json();

    if (!sqlDump) {
      return NextResponse.json({ success: false, error: "No SQL dump provided" }, { status: 400 });
    }

    const containerName = `project_${slug}_db`;
    const container = docker.getContainer(containerName);

    const exec = await container.exec({
      Cmd: ["psql", "-U", "postgres", "-d", "postgres", "-c", sqlDump],
      AttachStdout: true,
      AttachStderr: true,
    });

    await new Promise((resolve, reject) => {
      exec.start({}, (err, stream) => {
        if (err) return reject(err);
        stream?.on("end", resolve);
      });
    });

    return NextResponse.json({ success: true, message: "Database restored successfully from SQL dump." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
