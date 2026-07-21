import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("atelier proxy", () => {
  it("fails closed when protected routes are requested without configuration", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ADMIN_EMAIL", "");

    const response = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/atelier"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/atelier/login?motiv=configurare",
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toBe(
      "noindex, nofollow, noarchive",
    );
  });

  it("keeps the login route reachable for initial setup", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ADMIN_EMAIL", "");

    const response = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/atelier/login"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
  });
});
