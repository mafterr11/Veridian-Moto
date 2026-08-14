import type { NextConfig } from "next";

import { buildSecurityHeaders } from "./src/lib/security-headers";

function catalogueRemotePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) return [];

  try {
    const url = new URL(value);
    return [
      {
        protocol: url.protocol === "http:" ? "http" : "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  // The PDF renderer resolves fonts and parses TTFs at runtime; bundling it
  // breaks those lookups, so let it load from node_modules instead.
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    // Offer documents read brand typefaces and configurator artwork from disk.
    // Neither is reachable through an import, so trace them explicitly.
    "/api/oferta": [
      "./src/lib/pdf/fonts/*.ttf",
      "./public/images/configurator/**",
      "./public/images/models/**",
    ],
    "/api/oferta/[reference]": [
      "./src/lib/pdf/fonts/*.ttf",
      "./public/images/configurator/**",
      "./public/images/models/**",
    ],
  },
  experimental: {
    // Admin catalogue images are limited to 5 MB; multipart overhead needs a
    // little headroom above that application-level limit.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86_400,
    remotePatterns: catalogueRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders({
          isDevelopment: process.env.NODE_ENV !== "production",
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        }),
      },
    ];
  },
};

export default nextConfig;
