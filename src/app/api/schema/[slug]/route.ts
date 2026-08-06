import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { docker } from "@/lib/docker/client";

/**
 * Executes raw SQL directly inside the tenant's PostgreSQL Docker container
 */
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

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    // Live User Activity Stats from pg_stat_user_tables
    // This measures real application requests to user tables without inflating on page refreshes
    if (mode === "stats") {
      const statsSql = `
        SELECT COALESCE(SUM(seq_scan + idx_scan + n_tup_ins + n_tup_upd + n_tup_del), 0) AS total_user_requests
        FROM pg_stat_user_tables;
      `;
      const rawUserReqs = await executeSqlInTenantDb(slug, statsSql).catch(() => "0");
      const userRequests = parseInt(rawUserReqs.trim()) || 0;

      // Count profiles
      const countUsersSql = `SELECT count(*) FROM public.profiles;`;
      const rawUserCount = await executeSqlInTenantDb(slug, countUsersSql).catch(() => "0");
      const userCount = parseInt(rawUserCount.trim()) || 0;

      // Count webhooks
      const countWhSql = `SELECT count(*) FROM public._webhooks;`;
      const rawWhCount = await executeSqlInTenantDb(slug, countWhSql).catch(() => "0");
      const webhookCount = parseInt(rawWhCount.trim()) || 0;

      return NextResponse.json({
        success: true,
        stats: {
          totalRequests: userRequests,
          postgresRequests: userRequests,
          authUsersCount: userCount,
          webhooksCount: webhookCount,
          successRate: 100.0,
        },
      });
    }

    // Discover public tables via direct SQL query
    const listTablesSql = `
      SELECT json_agg(t) FROM (
        SELECT 
          table_name as name,
          (
            SELECT json_agg(c) FROM (
              SELECT 
                column_name as name,
                data_type as type,
                (is_nullable = 'YES') as is_nullable
              FROM information_schema.columns 
              WHERE table_schema = 'public' AND table_name = t.table_name
            ) c
          ) as columns
        FROM information_schema.tables t
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ) t;
    `;

    const rawOutput = await executeSqlInTenantDb(slug, listTablesSql);
    let tables: any[] = [];
    try {
      const jsonStart = rawOutput.indexOf("[");
      const jsonEnd = rawOutput.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        tables = JSON.parse(rawOutput.substring(jsonStart, jsonEnd + 1));
      }
    } catch {
      tables = [];
    }

    return NextResponse.json({ success: true, tenant: slug, tables });
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
    const { action, tableName, columns, template, sql: customSql } = body;

    if (action === "create_table") {
      if (!tableName || !columns || !Array.isArray(columns)) {
        return NextResponse.json({ success: false, error: "Invalid table definition" }, { status: 400 });
      }

      const colDefs = columns
        .map((col: any) => {
          let def = `"${col.name}" ${col.type}`;
          if (col.isPrimaryKey) def += " PRIMARY KEY";
          if (col.isNullable === false) def += " NOT NULL";
          if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
          return def;
        })
        .join(", ");

      const sql = `CREATE TABLE IF NOT EXISTS public."${tableName}" (${colDefs});`;

      await executeSqlInTenantDb(slug, sql);

      // Notify PostgREST to reload schema cache
      try {
        await executeSqlInTenantDb(slug, "NOTIFY pgrst, 'reload schema';");
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Table '${tableName}' created successfully in PostgreSQL.`,
        sql,
      });
    }

    if (action === "load_template") {
      let templateSql = "";

      if (template === "ecommerce") {
        templateSql = `
          CREATE TABLE IF NOT EXISTS public.products (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL,
            price numeric NOT NULL,
            stock integer DEFAULT 100,
            created_at timestamp with time zone DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS public.orders (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            customer_email text NOT NULL,
            total_amount numeric NOT NULL,
            status text DEFAULT 'pending',
            created_at timestamp with time zone DEFAULT now()
          );

          INSERT INTO public.products (name, price, stock) VALUES
          ('MacBook Pro M3', 1999.99, 15),
          ('Wireless Gaming Mouse', 49.99, 150),
          ('4K Ultra HD Monitor', 399.00, 45)
          ON CONFLICT DO NOTHING;

          INSERT INTO public.orders (customer_email, total_amount, status) VALUES
          ('ahmet@example.com', 2049.98, 'completed'),
          ('zeynep@example.com', 49.99, 'shipped')
          ON CONFLICT DO NOTHING;
        `;
      } else if (template === "saas") {
        templateSql = `
          CREATE TABLE IF NOT EXISTS public.organizations (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL,
            plan text DEFAULT 'free',
            created_at timestamp with time zone DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS public.profiles (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            email text NOT NULL,
            full_name text,
            role text DEFAULT 'member'
          );

          INSERT INTO public.organizations (name, plan) VALUES
          ('Acme Corp', 'enterprise'),
          ('Startup Labs', 'pro')
          ON CONFLICT DO NOTHING;

          INSERT INTO public.profiles (email, full_name, role) VALUES
          ('admin@acme.com', 'Caner Yılmaz', 'admin'),
          ('dev@startuplabs.com', 'Elif Kaya', 'developer')
          ON CONFLICT DO NOTHING;
        `;
      } else if (template === "ai_vector") {
        templateSql = `
          CREATE EXTENSION IF NOT EXISTS vector;

          CREATE TABLE IF NOT EXISTS public.documents (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            content text NOT NULL,
            embedding vector(3),
            created_at timestamp with time zone DEFAULT now()
          );

          INSERT INTO public.documents (content, embedding) VALUES
          ('Supabase vector search documentation', '[0.1, 0.2, 0.3]'),
          ('PostgreSQL pgvector extension guide', '[0.4, 0.5, 0.6]')
          ON CONFLICT DO NOTHING;
        `;
      }

      await executeSqlInTenantDb(slug, templateSql);

      // Notify PostgREST to reload schema
      try {
        await executeSqlInTenantDb(slug, "NOTIFY pgrst, 'reload schema';");
      } catch {}

      return NextResponse.json({ success: true, message: `Template '${template}' loaded successfully.` });
    }

    if (action === "exec_sql" && customSql) {
      const result = await executeSqlInTenantDb(slug, customSql);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
