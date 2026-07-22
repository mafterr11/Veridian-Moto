import { describe, expect, it } from "vitest";

import { demoAccessories, filterAccessories } from "@/data/accessories";

describe("accessory catalogue filtering", () => {
  it("combines category and stock filters", () => {
    const result = filterAccessories({
      category: "Bagaje",
      stock: "in_stock",
    });

    expect(result.map((item) => item.slug)).toEqual([
      "geanta-rezervor-12l",
      "set-cutii-laterale-aluminium",
    ]);
  });

  it("ships a complete twelve-product range with dedicated imagery", () => {
    expect(demoAccessories).toHaveLength(12);
    expect(
      demoAccessories.every(
        (item) => item.image === `/images/accessories/${item.slug}.webp`,
      ),
    ).toBe(true);
    expect(new Set(demoAccessories.map((item) => item.image))).toHaveLength(12);
  });

  it("sorts without mutating the source catalogue", () => {
    const original = demoAccessories.map((item) => item.slug);
    const result = filterAccessories({ sort: "price-desc" });

    expect(result[0]?.price).toBeGreaterThanOrEqual(result.at(-1)?.price ?? 0);
    expect(demoAccessories.map((item) => item.slug)).toEqual(original);
  });
});
