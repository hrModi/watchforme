import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages uses @cloudflare/next-on-pages for the build.
  // API routes and server actions that need Workers runtime must declare:
  // export const runtime = 'edge'
  //
  // Static pages are pre-rendered at build time (generateStaticParams).
  // ISR revalidation is handled per-page via `export const revalidate`.
};

export default nextConfig;
