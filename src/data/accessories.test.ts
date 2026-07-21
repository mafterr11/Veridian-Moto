import { describe, expect, it } from "vitest";

import { demoAccessories, filterAccessories } from "@/data/accessories";

describe("accessory catalogue filtering", () => {
  it("combines category and stock filters", () => {
    const result = filterAccessories({
      category: "Bagaje",
      stock: "in_stock",
    });

    expect(result.map((item) => item.slug)).toEqual([
      "set-cutii-laterale-aluminium",
    ]);
  });

  it("sorts without mutating the source catalogue", () => {
    const original = demoAccessories.map((item) => item.slug);
    const result = filterAccessories({ sort: "price-desc" });

    expect(result[0]?.price).toBeGreaterThanOrEqual(result.at(-1)?.price ?? 0);
    expect(demoAccessories.map((item) => item.slug)).toEqual(original);
  });
});
