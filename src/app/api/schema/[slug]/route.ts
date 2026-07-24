import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { action, tableName, columns, template } = body;

    const rpcUrl = `https://db.orfa.dev/p/${slug}/rpc/exec_sql`;

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

      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Project-ID": slug },
        body: JSON.stringify({ query: sql }),
      });

      return NextResponse.json({ success: true, message: `Table '${tableName}' created successfully.`, sql });
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
          ('4K Ultra HD Monitor', 399.00, 45);

          INSERT INTO public.orders (customer_email, total_amount, status) VALUES
          ('ahmet@example.com', 2049.98, 'completed'),
          ('zeynep@example.com', 49.99, 'shipped');
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
            email text UNIQUE NOT NULL,
            full_name text,
            role text DEFAULT 'member'
          );

          INSERT INTO public.organizations (name, plan) VALUES
          ('Acme Corp', 'enterprise'),
          ('Startup Labs', 'pro');

          INSERT INTO public.profiles (email, full_name, role) VALUES
          ('admin@acme.com', 'Caner Yılmaz', 'admin'),
          ('dev@startuplabs.com', 'Elif Kaya', 'developer');
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
          ('PostgreSQL pgvector extension guide', '[0.4, 0.5, 0.6]');
        `;
      }

      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Project-ID": slug },
        body: JSON.stringify({ query: templateSql }),
      });

      return NextResponse.json({ success: true, message: `Template '${template}' loaded successfully.` });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
