import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  profileLimit: vi.fn(),
  getClaims: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T>(callback: T) => callback };
});
vi.mock("@/env", () => ({
  env: { ADMIN_EMAIL: "admin@veridian.example" },
}));
vi.mock("@/lib/supabase/public-config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://project.supabase.co",
    publishableKey: "sb_publishable_test",
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getClaims: mocks.getClaims },
  }),
}));
vi.mock("@/db/client", () => ({
  isDatabaseConfigured: () => true,
  getDatabase: () => ({
    select: () => ({
      from: () => ({
        where: () => ({ limit: mocks.profileLimit }),
      }),
    }),
  }),
}));

import { getAdminAuthState } from "@/data/auth/admin-session";

describe("administrator session dependency failures", () => {
  beforeEach(() => {
    mocks.getClaims.mockReset();
    mocks.profileLimit.mockReset();
    mocks.getClaims.mockResolvedValue({
      data: {
        claims: {
          sub: "c277671a-2acd-4a2c-8e0c-e39885b19e3a",
          email: "admin@veridian.example",
        },
      },
      error: null,
    });
  });

  it("returns a finite service-unavailable state when PostgreSQL times out", async () => {
    const error = new Error("Failed query", {
      cause: Object.assign(new Error("statement timeout"), { code: "57014" }),
    });
    mocks.profileLimit.mockRejectedValue(error);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(getAdminAuthState()).resolves.toEqual({
      status: "service-unavailable",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Atelier database authorization check failed.",
      { code: "57014" },
    );
  });

  it("authenticates only an active provisioned profile", async () => {
    mocks.profileLimit.mockResolvedValue([
      {
        id: "c277671a-2acd-4a2c-8e0c-e39885b19e3a",
        displayName: "Administrator",
      },
    ]);

    await expect(getAdminAuthState()).resolves.toEqual({
      status: "authenticated",
      identity: {
        id: "c277671a-2acd-4a2c-8e0c-e39885b19e3a",
        email: "admin@veridian.example",
        displayName: "Administrator",
      },
    });
  });
});
