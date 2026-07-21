import { describe, expect, it, vi } from "vitest";

const publishedAt = new Date("2026-07-12T08:00:00.000Z");
const updatedAt = new Date("2026-07-13T09:30:00.000Z");

const databaseMocks = vi.hoisted(() => {
  const rows = [
    {
      slug: "cache-contract",
      category: "Tehnologie",
      categorySlug: "tehnologie",
      title: "Cache contract",
      excerpt: "A regression fixture.",
      image: "/images/models/apex-675-r.webp",
      imageAlt: "Regression fixture",
      publishedAt: new Date("2026-07-12T08:00:00.000Z"),
      updatedAt: new Date("2026-07-13T09:30:00.000Z"),
      featured: true,
    },
  ];
  const query = {
    from: vi.fn(() => query),
    innerJoin: vi.fn(() => query),
    where: vi.fn(() => query),
    orderBy: vi.fn(async () => rows),
  };

  return {
    getDatabase: vi.fn(() => ({ select: vi.fn(() => query) })),
    isDatabaseConfigured: vi.fn(() => true),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => databaseMocks);
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn(
    <Arguments extends unknown[], Result>(
      callback: (...arguments_: Arguments) => Promise<Result>,
    ) => {
      let cachedJson: string | undefined;

      return async (...arguments_: Arguments): Promise<Result> => {
        if (cachedJson) return JSON.parse(cachedJson) as Result;

        const result = await callback(...arguments_);
        cachedJson = JSON.stringify(result);
        return result;
      };
    },
  ),
}));

import { getPublicArticles } from "./public-editorial";

describe("public editorial cache boundary", () => {
  it("returns Date objects on both the cache fill and a JSON cache hit", async () => {
    const first = await getPublicArticles();
    const cached = await getPublicArticles();

    expect(first[0]?.publishedAt).toBeInstanceOf(Date);
    expect(cached[0]?.publishedAt).toBeInstanceOf(Date);
    expect(cached[0]?.updatedAt).toBeInstanceOf(Date);
    expect(cached[0]?.publishedAt.toISOString()).toBe(
      publishedAt.toISOString(),
    );
    expect(cached[0]?.updatedAt.toISOString()).toBe(updatedAt.toISOString());
    expect(databaseMocks.getDatabase).toHaveBeenCalledTimes(1);
  });
});
