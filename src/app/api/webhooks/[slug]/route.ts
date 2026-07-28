import { NextRequest, NextResponse } from "next/server";
import { docker } from "@/lib/docker/client";

async function executeSqlInTenantDb(slug: string, sql: string): Promise<string> {
  const containerName = `project_${slug}_db`;
  const container = docker.getContainer(containerName);

  const exec = await container.exec({
    Cmd: ["psql", "-U", "postgres", "-d", "postgres", "-t", "-A", "-c", sql],
    AttachStdout: true,
    AttachStderr: true,
  });

  return new Promise((resolve, reject) => {
    exec.start({}, (err, stream) => {
      if (err) return reject(err);
      let output = "";
      stream?.on("data", (chunk) => (output += chunk.toString("utf8")));
      stream?.on("end", () => resolve(output));
    });
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Ensure _webhooks table exists in tenant DB
    const initSql = `
      CREATE TABLE IF NOT EXISTS public._webhooks (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL,
        target_table text NOT NULL,
        target_url text NOT NULL,
        events text DEFAULT 'INSERT',
        status text DEFAULT 'active',
        created_at timestamp with time zone DEFAULT now()
      );
    `;
    await executeSqlInTenantDb(slug, initSql).catch(() => {});

    const querySql = `
      SELECT json_agg(w) FROM (
        SELECT id, name, target_table as table, target_url as "targetUrl", status, created_at as "createdAt"
        FROM public._webhooks ORDER BY created_at DESC
      ) w;
    `;

    const rawOutput = await executeSqlInTenantDb(slug, querySql);
    let webhooks: any[] = [];
    try {
      const jsonStart = rawOutput.indexOf("[");
      const jsonEnd = rawOutput.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        webhooks = JSON.parse(rawOutput.substring(jsonStart, jsonEnd + 1));
      }
    } catch {
      webhooks = [];
    }

    return NextResponse.json({ success: true, tenant: slug, webhooks });
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
    const body = await req.json();
    const { name, table, targetUrl, events } = body;

    if (!name || !table || !targetUrl) {
      return NextResponse.json({ success: false, error: "Missing required webhook fields" }, { status: 400 });
    }

    const insertSql = `
      INSERT INTO public._webhooks (name, target_table, target_url, events)
      VALUES ('${name}', '${table}', '${targetUrl}', '${Array.isArray(events) ? events.join(",") : "INSERT"}')
      RETURNING id, name, target_table as table, target_url as "targetUrl", status, created_at as "createdAt";
    `;

    await executeSqlInTenantDb(slug, insertSql);

    return NextResponse.json({ success: true, message: `Webhook '${name}' created successfully.` }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
