import { NextResponse } from "next/server";
import Docker from "dockerode";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock" });

export const dynamic = "force-dynamic";

async function executeSqlInTenantDb(slug: string, sql: string, returnJson = true): Promise<any> {
  const dbContainerName = `project_${slug}_db`;
  const container = docker.getContainer(dbContainerName);

  try {
    await container.inspect();
  } catch (err) {
    throw new Error(`Database container not found or not running for project: ${slug}`);
  }

  const formatArgs = returnJson 
    ? ["-t", "-A", "-c", `SELECT json_agg(t) FROM (${sql}) t;`]
    : ["-c", sql];

  const exec = await container.exec({
    Cmd: ["psql", "-U", "postgres", "-d", "postgres", ...formatArgs],
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({});
  let output = "";
  let errorOutput = "";

  return new Promise((resolve, reject) => {
    docker.modem.demuxStream(
      stream,
      {
        write: (chunk: Buffer) => {
          output += chunk.toString("utf8");
          return true;
        },
      } as any,
      {
        write: (chunk: Buffer) => {
          errorOutput += chunk.toString("utf8");
          return true;
        },
      } as any
    );

    stream.on("end", () => {
      if (errorOutput && errorOutput.includes("ERROR:")) {
        return reject(new Error(errorOutput.trim()));
      }
      if (returnJson) {
        try {
          // psql sometimes returns blank lines at the end, or a single row containing the JSON
          const cleaned = output.trim();
          if (!cleaned || cleaned === "") return resolve([]);
          return resolve(JSON.parse(cleaned));
        } catch (parseError) {
          // If the query didn't return tabular JSON (e.g., CREATE TABLE), we just return the raw string
          return resolve({ raw: output.trim() });
        }
      }
      resolve({ raw: output.trim() });
    });
  });
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: "SQL query is required" }, { status: 400 });
    }

    const project = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Identify if the query is a SELECT or returning data to format it as JSON
    const isSelect = query.trim().toUpperCase().startsWith("SELECT") || query.trim().toUpperCase().startsWith("WITH") || query.trim().toUpperCase().startsWith("EXPLAIN");
    
    let result;
    if (isSelect) {
      result = await executeSqlInTenantDb(slug, query, true);
    } else {
      result = await executeSqlInTenantDb(slug, query, false);
      // For mutations, we might want to just return success and the raw output
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
