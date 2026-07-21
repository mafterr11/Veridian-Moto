import { describe, expect, it } from "vitest";

import {
  createRequestKeyHash,
  normalizeClientAddress,
} from "@/domain/security/request-fingerprint";

describe("public request fingerprints", () => {
  it("uses the first valid forwarded address and rejects arbitrary header text", () => {
    expect(normalizeClientAddress("203.0.113.7, 10.0.0.1", null)).toBe(
      "203.0.113.7",
    );
    expect(normalizeClientAddress("attacker-controlled", "2001:db8::1")).toBe(
      "2001:db8::1",
    );
    expect(normalizeClientAddress("not-an-ip", null)).toBe("unknown");
  });

  it("creates stable, scope-separated one-way keys", () => {
    const first = createRequestKeyHash("a".repeat(32), "inquiry", "value");
    expect(first).toHaveLength(64);
    expect(createRequestKeyHash("a".repeat(32), "inquiry", "value")).toBe(
      first,
    );
    expect(createRequestKeyHash("a".repeat(32), "snapshot", "value")).not.toBe(
      first,
    );
  });
});
