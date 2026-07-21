import { describe, expect, it } from "vitest";

import { restoreCacheDate, serializeCacheDate } from "./cache-date";

describe("cache date serialization", () => {
  it("restores Date methods after the JSON round trip used by unstable_cache", () => {
    const original = new Date("2026-07-12T08:00:00.000Z");
    const cached = JSON.parse(
      JSON.stringify({ publishedAt: serializeCacheDate(original) }),
    ) as { publishedAt: string };

    const restored = restoreCacheDate(cached.publishedAt);

    expect(restored).toBeInstanceOf(Date);
    expect(restored.toISOString()).toBe(original.toISOString());
  });

  it("rejects invalid cached dates instead of returning an unusable value", () => {
    expect(() => restoreCacheDate("not-a-date")).toThrow(TypeError);
    expect(() => serializeCacheDate("not-a-date")).toThrow(TypeError);
  });
});
