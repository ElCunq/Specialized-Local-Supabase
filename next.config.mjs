/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["dockerode", "@libsql/client", "better-sqlite3"],
  },
};

export default nextConfig;
