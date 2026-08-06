import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { apiKeys, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { docker } from "@/lib/docker/client";

async function executeSqlInTenantDb(slug: string, sql: string): Promise<string> {
  const containerName = `project_${slug}_db`;
  const container = docker.getContainer(containerName);

  // Grant schema privileges automatically
  const fullSql = `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
      END IF;
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
      END IF;
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
      END IF;
    END $$;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    ${sql}
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  `;

  const exec = await container.exec({
    Cmd: ["psql", "-U", "postgres", "-d", "postgres", "-t", "-A", "-c", fullSql],
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

// Force Node.js runtime since dockerode doesn't run on Edge
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the agent via Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    
    // 2. Validate token and get tenant
    const apiKeyInfo = await db
      .select({
        tenant_id: apiKeys.tenantId,
        slug: tenants.slug,
        role: apiKeys.role
      })
      .from(apiKeys)
      .innerJoin(tenants, eq(apiKeys.tenantId, tenants.id))
      .where(eq(apiKeys.token, token))
      .then(res => res[0]);

    if (!apiKeyInfo) {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 });
    }

    // 3. Ensure role is service_role for SQL execution (anon shouldn't execute arbitrary SQL)
    if (apiKeyInfo.role !== "service_role") {
      return NextResponse.json({ success: false, error: "Only service_role keys can execute raw SQL" }, { status: 403 });
    }

    // 4. Parse request body
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ success: false, error: "Missing 'query' field in request body" }, { status: 400 });
    }

    // 5. Execute SQL
    // executeSqlInTenantDb expects the project slug and the SQL query
    const resultJson = await executeSqlInTenantDb(apiKeyInfo.slug, query);
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(resultJson);
    } catch {
      // If it doesn't return valid JSON (e.g., INSERT with no returning, or error), just return the raw string
      parsedResult = resultJson;
    }

    return NextResponse.json({ success: true, result: parsedResult });

  } catch (error: any) {
    console.error("Agent SQL API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
