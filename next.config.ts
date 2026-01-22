import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is the Next.js 15 way to handle those specific libraries
  // It clears the "outdated webpack" error and enables Turbopack speed
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
};

export default nextConfig;
