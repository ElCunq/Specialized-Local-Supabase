/**
 * Traefik Dynamic Label Generator for Per-Tenant Pods
 * Configures automatic HTTP header & path routing on db.orfa.dev
 */

export interface TraefikLabelOptions {
  slug: string;
  domain?: string;
  targetPort?: number; // PostgREST port inside container (default 3000)
}

export function generateTraefikLabels(options: TraefikLabelOptions): Record<string, string> {
  const { slug, domain = process.env.SYSTEM_DOMAIN || "db.orfa.dev", targetPort = 3000 } = options;
  const routerName = `tenant-${slug}`;
  const middlewarePrefix = `tenant-${slug}-stripprefix`;
  const middlewareCors = `tenant-${slug}-cors`;

  // Detect Traefik entrypoints from env or support both http,https and web,websecure
  const entrypoints = process.env.TRAEFIK_ENTRYPOINTS || "http,https,web,websecure";

  return {
    "traefik.enable": "true",
    "traefik.docker.network": process.env.TRAEFIK_NETWORK || "coolify",

    // Service definition
    [`traefik.http.services.${routerName}.loadbalancer.server.port`]: String(targetPort),

    // Router Rules (Path Prefix OR Header match)
    [`traefik.http.routers.${routerName}.rule`]: `Host(\`${domain}\`) && (PathPrefix(\`/p/${slug}\`) || Header(\`X-Project-ID\`, \`${slug}\`) || Header(\`X-Tenant-ID\`, \`${slug}\`))`,

    // Router Entrypoints (Supports http,https and web,websecure for Coolify & Traefik)
    [`traefik.http.routers.${routerName}.entrypoints`]: entrypoints,

    // Middleware assignment (Strip Prefix for /p/{slug} requests + CORS)
    [`traefik.http.routers.${routerName}.middlewares`]: `${middlewarePrefix}@docker,${middlewareCors}@docker`,

    // Middleware 1: Strip Path Prefix /p/{slug} -> /
    [`traefik.http.middlewares.${middlewarePrefix}.stripprefix.prefixes`]: `/p/${slug}`,

    // Middleware 2: Global CORS headers for client SDK compatibility
    [`traefik.http.middlewares.${middlewareCors}.headers.accessControlAllowOriginList`]: "*",
    [`traefik.http.middlewares.${middlewareCors}.headers.accessControlAllowMethods`]: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    [`traefik.http.middlewares.${middlewareCors}.headers.accessControlAllowHeaders`]: "Authorization,Content-Type,X-Project-ID,X-Tenant-ID,apikey,Prefer",
  };
}
