import { docker, ensureNetworkExists } from "./client";
import { generateTraefikLabels } from "../traefik/labels";
import { CreateTenantPodParams, TenantPodStatus } from "./types";

const PUBLIC_GATEWAY_NETWORK = process.env.TRAEFIK_NETWORK || "coolify";
const POSTGRES_IMAGE = "supabase/postgres:15.1.1.78";
const POSTGREST_IMAGE = "postgrest/postgrest:v12.2.0";
const POSTGRES_META_IMAGE = "supabase/postgres-meta:v0.84.1";
const GOTRUE_IMAGE = "supabase/gotrue:v2.132.3";
const PGBOUNCER_IMAGE = "edoburu/pgbouncer:latest";

/**
 * Creates an isolated Tenant Pod (PostgreSQL + PostgREST + Postgres-Meta) with Traefik Proxy labels.
 */
export async function createTenantPod(params: CreateTenantPodParams) {
  const { slug, dbPassword, jwtSecret } = params;

  const dbContainerName = `project_${slug}_db`;
  const restContainerName = `project_${slug}_rest`;
  const metaContainerName = `project_${slug}_meta`;
  const authContainerName = `project_${slug}_auth`;
  const networkName = `project_${slug}_net`;
  const volumeName = `project_${slug}_db_data`;

  // 1. Ensure Traefik Gateway Network & Per-Tenant Network exist
  await ensureNetworkExists(PUBLIC_GATEWAY_NETWORK);
  const tenantNetwork = await ensureNetworkExists(networkName);

  // 2. Ensure Images are pulled
  await pullImageIfNeeded(POSTGRES_IMAGE);
  await pullImageIfNeeded(POSTGREST_IMAGE);
  await pullImageIfNeeded(POSTGRES_META_IMAGE);
  await pullImageIfNeeded(GOTRUE_IMAGE);
  await pullImageIfNeeded(PGBOUNCER_IMAGE);

  // 3. Create PostgreSQL Container (~30MB RAM base)
  const dbContainer = await docker.createContainer({
    Image: POSTGRES_IMAGE,
    name: dbContainerName,
    Cmd: ["postgres", "-c", "shared_preload_libraries=pg_stat_statements,pg_cron", "-c", "pg_cron.database_name=postgres"],
    Env: [
      `POSTGRES_PASSWORD=${dbPassword}`,
      `POSTGRES_DB=postgres`,
      `POSTGRES_USER=postgres`,
    ],
    HostConfig: {
      Memory: 64 * 1024 * 1024, // 64 MB Limit
      MemorySwap: 128 * 1024 * 1024,
      RestartPolicy: { Name: "unless-stopped" },
      Binds: [`${volumeName}:/var/lib/postgresql/data`],
    },
    NetworkingConfig: {
      EndpointsConfig: {
        [networkName]: {},
        [PUBLIC_GATEWAY_NETWORK]: {},
      },
    },
  });

  // Start DB Container first
  await dbContainer.start();

  // Initialize standard Supabase roles (anon, authenticated, service_role) and pg_cron
  await initTenantDbRoles(dbContainerName);

  // 3.5. Create PgBouncer Container (~5MB RAM)
  const pgbouncerContainerName = `project_${slug}_pgbouncer`;
  const pgbouncerContainer = await docker.createContainer({
    Image: PGBOUNCER_IMAGE,
    name: pgbouncerContainerName,
    Env: [
      `DB_USER=postgres`,
      `DB_PASSWORD=${dbPassword}`,
      `DB_HOST=${dbContainerName}`,
      `DB_NAME=postgres`,
      `POOL_MODE=transaction`,
      `MAX_CLIENT_CONN=1000`,
      `DEFAULT_POOL_SIZE=20`,
      `ADMIN_USERS=postgres`,
      `IGNORE_STARTUP_PARAMETERS=extra_float_digits`
    ],
    HostConfig: {
      Memory: 16 * 1024 * 1024, // 16 MB Limit
      RestartPolicy: { Name: "unless-stopped" },
    },
    NetworkingConfig: {
      EndpointsConfig: {
        [networkName]: {},
        [PUBLIC_GATEWAY_NETWORK]: {},
      },
    },
  });

  await pgbouncerContainer.start();

  // 4. Generate Traefik Dynamic Routing Labels for PostgREST
  const traefikLabels = generateTraefikLabels({ slug });

  // 5. Create PostgREST Container (~15MB RAM base)
  const restContainer = await docker.createContainer({
    Image: POSTGREST_IMAGE,
    name: restContainerName,
    Labels: traefikLabels,
    Env: [
      `PGRST_DB_URI=postgres://postgres:${dbPassword}@${pgbouncerContainerName}:6432/postgres`,
      `PGRST_DB_SCHEMA=public`,
      `PGRST_DB_ANON_ROLE=anon`,
      `PGRST_JWT_SECRET=${jwtSecret}`,
      `PGRST_SERVER_PROXY_URI=https://db.orfa.dev/p/${slug}`,
    ],
    HostConfig: {
      Memory: 32 * 1024 * 1024, // 32 MB Limit
      RestartPolicy: { Name: "unless-stopped" },
    },
    NetworkingConfig: {
      EndpointsConfig: {
        [networkName]: {},
        [PUBLIC_GATEWAY_NETWORK]: {},
      },
    },
  });

  // Start PostgREST Container
  await restContainer.start();

  // 6. Create Postgres Meta Container for Studio inspection (~20MB RAM)
  const metaContainer = await docker.createContainer({
    Image: POSTGRES_META_IMAGE,
    name: metaContainerName,
    Env: [
      `PG_META_PORT=8080`,
      `PG_META_DB_HOST=${dbContainerName}`,
      `PG_META_DB_PORT=5432`,
      `PG_META_DB_NAME=postgres`,
      `PG_META_DB_USER=postgres`,
      `PG_META_DB_PASSWORD=${dbPassword}`,
    ],
    HostConfig: {
      Memory: 32 * 1024 * 1024,
      RestartPolicy: { Name: "unless-stopped" },
    },
    NetworkingConfig: {
      EndpointsConfig: {
        [networkName]: {},
        [PUBLIC_GATEWAY_NETWORK]: {},
      },
    },
  });

  await metaContainer.start();

  // 7. Create GoTrue Container for Authentication (~20MB RAM)
  const authContainer = await docker.createContainer({
    Image: GOTRUE_IMAGE,
    name: authContainerName,
    Env: [
      `GOTRUE_API_HOST=0.0.0.0`,
      `GOTRUE_API_PORT=9999`,
      `GOTRUE_DB_DRIVER=postgres`,
      `GOTRUE_DB_DATABASE_URL=postgres://postgres:${dbPassword}@${pgbouncerContainerName}:6432/postgres`,
      `GOTRUE_SITE_URL=http://localhost:3000`,
      `GOTRUE_JWT_SECRET=${jwtSecret}`,
      `GOTRUE_JWT_EXP=3600`,
      `GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated`,
    ],
    HostConfig: {
      Memory: 32 * 1024 * 1024,
      RestartPolicy: { Name: "unless-stopped" },
    },
    NetworkingConfig: {
      EndpointsConfig: {
        [networkName]: {},
        [PUBLIC_GATEWAY_NETWORK]: {},
      },
    },
  });

  await authContainer.start();

  return {
    dbContainerId: dbContainer.id,
    restContainerId: restContainer.id,
    metaContainerId: metaContainer.id,
    authContainerId: authContainer.id,
    network: networkName,
  };
}

/**
 * Toggles Tenant Pod status (Pause / Resume for Scale-to-Zero capability)
 */
export async function toggleTenantStatus(slug: string, action: "pause" | "resume") {
  const dbContainerName = `project_${slug}_db`;
  const restContainerName = `project_${slug}_rest`;
  const metaContainerName = `project_${slug}_meta`;
  const authContainerName = `project_${slug}_auth`;
  const pgbouncerContainerName = `project_${slug}_pgbouncer`;

  const dbContainer = docker.getContainer(dbContainerName);
  const restContainer = docker.getContainer(restContainerName);
  const metaContainer = docker.getContainer(metaContainerName);
  const authContainer = docker.getContainer(authContainerName);
  const pgbouncerContainer = docker.getContainer(pgbouncerContainerName);

  if (action === "pause") {
    try { await authContainer.stop({ t: 2 }); } catch {}
    try { await metaContainer.stop({ t: 2 }); } catch {}
    try { await restContainer.stop({ t: 2 }); } catch {}
    try { await pgbouncerContainer.stop({ t: 2 }); } catch {}
    try { await dbContainer.stop({ t: 5 }); } catch {}
  } else {
    try {
      await dbContainer.start();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await pgbouncerContainer.start();
      await restContainer.start();
      await metaContainer.start();
      await authContainer.start();
    } catch (err: any) {
      throw new Error(`Failed to resume pod for ${slug}: ${err.message}`);
    }
  }
}

/**
 * Deletes a Tenant Pod completely (Containers, Networks, Volumes)
 */
export async function deleteTenantPod(slug: string, removeVolume = true) {
  const dbContainerName = `project_${slug}_db`;
  const restContainerName = `project_${slug}_rest`;
  const metaContainerName = `project_${slug}_meta`;
  const authContainerName = `project_${slug}_auth`;
  const pgbouncerContainerName = `project_${slug}_pgbouncer`;
  const networkName = `project_${slug}_net`;
  const volumeName = `project_${slug}_db_data`;

  // Stop & Remove Auth Container
  try {
    const authContainer = docker.getContainer(authContainerName);
    await authContainer.stop({ t: 2 }).catch(() => {});
    await authContainer.remove({ force: true });
  } catch {}

  // Stop & Remove PgBouncer Container
  try {
    const pgbouncerContainer = docker.getContainer(pgbouncerContainerName);
    await pgbouncerContainer.stop({ t: 2 }).catch(() => {});
    await pgbouncerContainer.remove({ force: true });
  } catch {}

  // Stop & Remove Meta Container
  try {
    const metaContainer = docker.getContainer(metaContainerName);
    await metaContainer.stop({ t: 2 }).catch(() => {});
    await metaContainer.remove({ force: true });
  } catch {}

  // Stop & Remove PostgREST Container
  try {
    const restContainer = docker.getContainer(restContainerName);
    await restContainer.stop({ t: 2 }).catch(() => {});
    await restContainer.remove({ force: true });
  } catch {}

  // Stop & Remove PostgreSQL Container
  try {
    const dbContainer = docker.getContainer(dbContainerName);
    await dbContainer.stop({ t: 3 }).catch(() => {});
    await dbContainer.remove({ force: true });
  } catch {}

  // Remove Tenant Isolated Network
  try {
    const network = docker.getNetwork(networkName);
    await network.remove();
  } catch {}

  // Remove Data Volume if requested
  if (removeVolume) {
    try {
      const volume = docker.getVolume(volumeName);
      await volume.remove();
    } catch {}
  }
}

/**
 * Gathers current CPU and RAM metrics for a Tenant Pod via Docker Engine API
 */
export async function getTenantMetrics(slug: string): Promise<TenantPodStatus> {
  const dbContainerName = `project_${slug}_db`;
  const restContainerName = `project_${slug}_rest`;

  let dbRunning = false;
  let restRunning = false;
  let cpuPercentage = 0;
  let memoryUsageMb = 0;

  try {
    const dbContainer = docker.getContainer(dbContainerName);
    const dbInspect = await dbContainer.inspect();
    dbRunning = dbInspect.State.Running;

    if (dbRunning) {
      const stats = await dbContainer.stats({ stream: false });
      memoryUsageMb += (stats.memory_stats.usage || 0) / (1024 * 1024);
      cpuPercentage += calculateCpuPercent(stats);
    }
  } catch {}

  try {
    const restContainer = docker.getContainer(restContainerName);
    const restInspect = await restContainer.inspect();
    restRunning = restInspect.State.Running;

    if (restRunning) {
      const stats = await restContainer.stats({ stream: false });
      memoryUsageMb += (stats.memory_stats.usage || 0) / (1024 * 1024);
      cpuPercentage += calculateCpuPercent(stats);
    }
  } catch {}

  try {
    const authContainer = docker.getContainer(`project_${slug}_auth`);
    const authInspect = await authContainer.inspect();
    if (authInspect.State.Running) {
      const stats = await authContainer.stats({ stream: false });
      memoryUsageMb += (stats.memory_stats.usage || 0) / (1024 * 1024);
      cpuPercentage += calculateCpuPercent(stats);
    }
  } catch {}

  return {
    slug,
    dbContainerExists: true,
    dbRunning,
    restContainerExists: true,
    restRunning,
    cpuPercentage: parseFloat(cpuPercentage.toFixed(2)),
    memoryUsageMb: parseFloat(memoryUsageMb.toFixed(2)),
  };
}

/**
 * Utility to pull image if not present locally
 */
async function pullImageIfNeeded(imageName: string) {
  const images = await docker.listImages();
  const exists = images.some((img) => img.RepoTags?.includes(imageName));
  if (!exists) {
    console.log(`[Docker Orchestrator] Pulling missing image: ${imageName}`);
    await new Promise((resolve, reject) => {
      docker.pull(imageName, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (progressErr) => {
          if (progressErr) reject(progressErr);
          else resolve(true);
        });
      });
    });
  }
}

/**
 * Calculates CPU percentage from Docker stats buffer
 */
function calculateCpuPercent(stats: any): number {
  if (!stats || !stats.cpu_stats || !stats.precpu_stats) return 0;
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const numberCpus = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage?.length || 1;

  if (systemCpuDelta > 0 && cpuDelta > 0) {
    return (cpuDelta / systemCpuDelta) * numberCpus * 100;
  }
  return 0;
}

/**
 * Initializes standard Supabase roles (anon, authenticated, service_role) and grants schema permissions
 */
export async function initTenantDbRoles(dbContainerName: string) {
  try {
    const container = docker.getContainer(dbContainerName);
    const sql = `
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
      CREATE EXTENSION IF NOT EXISTS pg_cron;
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    `;

    // Wait for Postgres to be ready
    await new Promise((r) => setTimeout(r, 2500));

    const exec = await container.exec({
      Cmd: ["psql", "-U", "postgres", "-d", "postgres", "-c", sql],
      AttachStdout: true,
      AttachStderr: true,
    });

    await exec.start({});
  } catch (err) {
    console.error("[DB Init Roles Error]", err);
  }
}
