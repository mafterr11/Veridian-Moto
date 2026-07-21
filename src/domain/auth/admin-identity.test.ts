import { describe, expect, it } from "vitest";

import {
  isAllowedAdminEmail,
  normalizeEmail,
  readAdminClaims,
} from "@/domain/auth/admin-identity";

describe("administrator identity", () => {
  it("compares the allow-listed email case-insensitively", () => {
    expect(
      isAllowedAdminEmail(" Admin@Example.com ", "admin@example.com"),
    ).toBe(true);
    expect(isAllowedAdminEmail("other@example.com", "admin@example.com")).toBe(
      false,
    );
    expect(isAllowedAdminEmail(undefined, "admin@example.com")).toBe(false);
  });

  it("extracts only a valid subject and email from verified claims", () => {
    expect(
      readAdminClaims({
        sub: "user-id",
        email: "ADMIN@example.com",
        role: "x",
      }),
    ).toEqual({ id: "user-id", email: "admin@example.com" });
    expect(readAdminClaims({ email: "admin@example.com" })).toBeNull();
    expect(normalizeEmail(" A@B.COM ")).toBe("a@b.com");
  });
});
