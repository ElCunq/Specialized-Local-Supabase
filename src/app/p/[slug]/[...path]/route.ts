import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

async function proxyToPostgrestSubpath(
  req: NextRequest,
  slug: string,
  pathArr: string[]
) {
  try {
    const subpath = "/" + pathArr.join("/");

    // Find tenant by slug
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    if (!tenant) {
      return NextResponse.json(
        { error: `Tenant project '${slug}' not found in database.` },
        { status: 404 }
      );
    }

    // Correct container names matching orchestrator.ts (project_${slug}_rest)
    const targetHosts = [
      `http://project_${slug}_rest:3000`,
      `http://db_tenant_${slug}_rest:3000`,
      tenant.restPort ? `http://127.0.0.1:${tenant.restPort}` : null,
    ].filter(Boolean) as string[];

    const reqHeaders: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      if (key.toLowerCase() !== "host") {
        reqHeaders[key] = val;
      }
    });

    if (!reqHeaders["apikey"] && tenant.anonKey) {
      reqHeaders["apikey"] = tenant.anonKey;
    }
    if (!reqHeaders["authorization"] && tenant.anonKey) {
      reqHeaders["authorization"] = `Bearer ${tenant.anonKey}`;
    }

    let body: any = null;
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      body = await req.arrayBuffer();
    }

    let lastError: any = null;
    for (const host of targetHosts) {
      try {
        const targetUrl = `${host}${subpath}${req.nextUrl.search}`;
        const proxyRes = await fetch(targetUrl, {
          method: req.method,
          headers: reqHeaders,
          body: body ? body : undefined,
          // @ts-ignore
          duplex: body ? "half" : undefined,
        });

        const resHeaders = new Headers();
        proxyRes.headers.forEach((v, k) => {
          resHeaders.set(k, v);
        });
        resHeaders.set("X-Proxied-By", "SupaBase-Control-Plane");

        const data = await proxyRes.arrayBuffer();
        return new NextResponse(data, {
          status: proxyRes.status,
          headers: resHeaders,
        });
      } catch (err: any) {
        lastError = err;
      }
    }

    return NextResponse.json(
      {
        error: `Could not connect to PostgREST container (project_${slug}_rest). Container may be starting or paused.`,
        details: lastError?.message,
      },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string; path: string[] } }) {
  return proxyToPostgrestSubpath(req, params.slug, params.path);
}

export async function POST(req: NextRequest, { params }: { params: { slug: string; path: string[] } }) {
  return proxyToPostgrestSubpath(req, params.slug, params.path);
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string; path: string[] } }) {
  return proxyToPostgrestSubpath(req, params.slug, params.path);
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string; path: string[] } }) {
  return proxyToPostgrestSubpath(req, params.slug, params.path);
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string; path: string[] } }) {
  return proxyToPostgrestSubpath(req, params.slug, params.path);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
