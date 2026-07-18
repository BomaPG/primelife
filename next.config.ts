import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Turbopack isn't supported by @serwist/next yet — this only matters for
  // `next dev`, not `next build` (F10 acceptance runs against the build).
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
