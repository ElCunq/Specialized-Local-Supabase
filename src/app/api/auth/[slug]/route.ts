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

    // Ensure profiles / users table exists
    const initSql = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        email text UNIQUE NOT NULL,
        full_name text,
        role text DEFAULT 'user',
        status font_status DEFAULT 'active',
        created_at timestamp with time zone DEFAULT now()
      );
    `;
    await executeSqlInTenantDb(slug, initSql).catch(() => {});

    const querySql = `
      SELECT json_agg(u) FROM (
        SELECT id, email, full_name, role, created_at FROM public.profiles ORDER BY created_at DESC
      ) u;
    `;

    const rawOutput = await executeSqlInTenantDb(slug, querySql);
    let users: any[] = [];
    try {
      const jsonStart = rawOutput.indexOf("[");
      const jsonEnd = rawOutput.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        users = JSON.parse(rawOutput.substring(jsonStart, jsonEnd + 1));
      }
    } catch {
      users = [];
    }

    return NextResponse.json({ success: true, tenant: slug, users });
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
    const { email, fullName, role } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const insertSql = `
      INSERT INTO public.profiles (email, full_name, role)
      VALUES ('${email}', '${fullName || ""}', '${role || "user"}')
      RETURNING id, email, full_name, role, created_at;
    `;

    await executeSqlInTenantDb(slug, insertSql);

    return NextResponse.json({ success: true, message: `User '${email}' created successfully.` }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const deleteSql = `DELETE FROM public.profiles WHERE id = '${userId}';`;
    await executeSqlInTenantDb(slug, deleteSql);

    return NextResponse.json({ success: true, message: `User ${userId} deleted.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
