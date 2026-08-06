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
      stream?.on("end", () => {
        if (output.includes("ERROR:")) {
          reject(new Error(output.trim()));
        } else {
          resolve(output);
        }
      });
    });
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Ensure profiles / users table exists with correct column types
    const initSql = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        email text UNIQUE NOT NULL,
        full_name text,
        role text DEFAULT 'authenticated',
        status text DEFAULT 'active',
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        last_sign_in_at timestamp with time zone DEFAULT now(),
        phone text DEFAULT '-',
        provider text DEFAULT 'Email'
      );
    `;
    await executeSqlInTenantDb(slug, initSql).catch((err) => {
      console.error("Init profiles table error:", err);
    });

    const querySql = `
      SELECT json_agg(u) FROM (
        SELECT 
          id, 
          email, 
          full_name, 
          role, 
          status, 
          created_at, 
          updated_at, 
          last_sign_in_at, 
          phone, 
          provider 
        FROM public.profiles 
        ORDER BY created_at DESC
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

    return NextResponse.json({ success: true, tenant: slug, users: users || [] });
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
    const { email, fullName, role, phone, password } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Escape single quotes for SQL safety
    const cleanEmail = email.replace(/'/g, "''");
    const cleanName = (fullName || "").replace(/'/g, "''");
    const cleanRole = (role || "authenticated").replace(/'/g, "''");
    const cleanPhone = (phone || "-").replace(/'/g, "''");

    const insertSql = `
      INSERT INTO public.profiles (email, full_name, role, phone, provider, status)
      VALUES ('${cleanEmail}', '${cleanName}', '${cleanRole}', '${cleanPhone}', 'Email', 'active')
      ON CONFLICT (email) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = now()
      RETURNING id, email, full_name, role, status, created_at, phone, provider;
    `;

    const resultOutput = await executeSqlInTenantDb(slug, insertSql);

    return NextResponse.json({ 
      success: true, 
      message: `User '${email}' saved successfully.`,
      result: resultOutput 
    }, { status: 201 });
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
