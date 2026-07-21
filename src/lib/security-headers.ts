type SecurityHeaderOptions = {
  isDevelopment: boolean;
  supabaseUrl?: string;
};

function externalOrigins(value: string | undefined) {
  if (!value) return [];

  try {
    const origin = new URL(value).origin;
    const socketOrigin = origin.replace(/^(https?):/, (_, protocol: string) =>
      protocol === "https" ? "wss:" : "ws:",
    );
    return [origin, socketOrigin];
  } catch {
    return [];
  }
}

export function buildContentSecurityPolicy({
  isDevelopment,
  supabaseUrl,
}: SecurityHeaderOptions) {
  const [supabaseOrigin, supabaseSocketOrigin] = externalOrigins(supabaseUrl);
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    `img-src 'self' data: blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
    `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}${supabaseSocketOrigin ? ` ${supabaseSocketOrigin}` : ""}${isDevelopment ? " ws://127.0.0.1:* ws://localhost:*" : ""}`,
    "media-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.join("; ");
}

export function buildSecurityHeaders(options: SecurityHeaderOptions) {
  const headers = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
  ];

  if (!options.isDevelopment) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
