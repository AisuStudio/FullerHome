import type { NextConfig } from "next";

// static export for GitHub Pages; basePath only in CI so local dev stays at /
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubActions ? "/FullerHome" : "",
  // directory-per-route output (route/index.html) so GitHub Pages serves
  // subpages under their clean URLs
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["three"],
};

export default nextConfig;
