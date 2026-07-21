import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabasePublicConfig } from "@/lib/supabase/public-config";

afterEach(() => vi.unstubAllEnvs());

describe("Supabase public configuration", () => {
  it("accepts only complete HTTP(S) configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co/path");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    expect(getSupabasePublicConfig()).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "publishable-key",
    });

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "javascript:alert(1)");
    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("fails closed when either value is absent", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    expect(getSupabasePublicConfig()).toBeNull();
  });
});
