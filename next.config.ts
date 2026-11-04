import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by frontend/Dockerfile (standalone server.js). Without this the
  // ".next/standalone" copy is empty and the production image cannot boot.
  output: "standalone",
  // API base injected at build/run time; no secrets in client code.
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1",
  },
  // Upgrade policy applied by the security upgrade to 16.4.5: only surface the
  // upgrade nudge again when a published security advisory affects the install.
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
