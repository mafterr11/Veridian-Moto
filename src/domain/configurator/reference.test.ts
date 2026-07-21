import { describe, expect, it } from "vitest";

import { createPublicReference } from "@/domain/configurator/reference";

describe("public configuration references", () => {
  it("creates a deterministic, nonsequential 12-character reference", () => {
    const reference = createPublicReference(
      Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    );

    expect(reference).toBe("ABCDEFGHJKLM");
    expect(reference).toMatch(/^[A-HJ-NP-Z2-9]{12}$/);
  });

  it("omits characters that are easy to confuse", () => {
    const reference = createPublicReference(
      Uint8Array.from({ length: 12 }, (_, index) => 200 + index),
    );

    expect(reference).not.toMatch(/[01IO]/);
  });

  it("requires enough entropy for the complete reference", () => {
    expect(() => createPublicReference(new Uint8Array(11))).toThrow(
      "Public references require 12 random bytes.",
    );
  });
});
