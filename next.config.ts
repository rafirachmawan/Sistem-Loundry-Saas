import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "@prisma/client"],
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "@prisma/client"],
  },
};

export default nextConfig;
