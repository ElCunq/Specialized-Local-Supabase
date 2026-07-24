import Docker from "dockerode";

// Docker API Connection
// Uses local socket /var/run/docker.sock by default, or DOCKER_HOST if configured
export const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock",
});

/**
 * Ensures the required proxy network (e.g., 'traefik-public') exists.
 */
export async function ensureNetworkExists(networkName: string): Promise<Docker.Network> {
  const networks = await docker.listNetworks();
  const existing = networks.find((n) => n.Name === networkName);

  if (existing) {
    return docker.getNetwork(existing.Id);
  }

  return await docker.createNetwork({
    Name: networkName,
    Driver: "bridge",
  });
}
