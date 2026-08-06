import { NextRequest, NextResponse } from "next/server";
import { docker } from "@/lib/docker/client";

async function handler(
  req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const pathSegments = params.path || [];
  const path = pathSegments.join("/");

  // Determine target project slug from header, query, or cookie
  const url = new URL(req.url);
  const slug =
    req.headers.get("x-project-slug") ||
    url.searchParams.get("project") ||
    req.cookies.get("active_project_slug")?.value ||
    "eren-saas";

  // Target container: project_${slug}_meta listening on port 8080 inside docker network
  const metaContainerName = `project_${slug}_meta`;

  try {
    // Get container IP in docker network or query port
    const container = docker.getContainer(metaContainerName);
    const inspect = await container.inspect();
    const networkName = `project_${slug}_net`;
    const netSettings = inspect.NetworkSettings as any;
    const ip = netSettings?.Networks?.[networkName]?.IPAddress || netSettings?.IPAddress;

    const targetUrl = `http://${ip || metaContainerName}:8080/${path}${url.search}`;

    const headers = new Headers(req.headers);
    headers.delete("host");

    const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.text();

    const resp = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const data = await resp.text();
    return new NextResponse(data, {
      status: resp.status,
      headers: {
        "content-type": resp.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    console.error(`[Meta Proxy Error for ${slug}]:`, err);
    return NextResponse.json(
      { error: `Meta service unavailable for project '${slug}'`, details: err.message },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
