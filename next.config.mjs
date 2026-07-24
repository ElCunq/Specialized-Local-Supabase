/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["dockerode", "@libsql/client"],
  },
};

export default nextConfig;
