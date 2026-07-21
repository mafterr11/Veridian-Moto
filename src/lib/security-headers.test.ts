import { describe, expect, it } from "vitest";

import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
} from "@/lib/security-headers";

describe("security headers", () => {
  it("builds a production policy without development eval permissions", () => {
    const policy = buildContentSecurityPolicy({
      isDevelopment: false,
      supabaseUrl: "https://project.supabase.co/path",
    });

    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("https://project.supabase.co");
    expect(policy).toContain("wss://project.supabase.co");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("adds HSTS only outside development and ignores invalid remote URLs", () => {
    const development = buildSecurityHeaders({
      isDevelopment: true,
      supabaseUrl: "not a URL",
    });
    const production = buildSecurityHeaders({ isDevelopment: false });

    expect(
      development.some(({ key }) => key === "Strict-Transport-Security"),
    ).toBe(false);
    expect(
      production.some(({ key }) => key === "Strict-Transport-Security"),
    ).toBe(true);
    expect(
      development.find(({ key }) => key === "Content-Security-Policy")?.value,
    ).toContain("'unsafe-eval'");
  });
});
