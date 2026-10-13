import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
};

export default nextConfig;
