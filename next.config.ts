import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repo-name>/; the deploy workflow sets this.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
};

export default nextConfig;
