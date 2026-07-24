/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["dockerode", "@libsql/client"],
  },
};

export default nextConfig;
