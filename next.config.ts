import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: false,
  partialPrefetching: false,
  poweredByHeader: false,
};

export default nextConfig;
