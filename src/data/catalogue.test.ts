import { describe, expect, it } from "vitest";

import { filterModels, getModel, motorcycles } from "@/data/catalogue";

describe("catalogue", () => {
  it("contains unique slugs for all initial models", () => {
    const slugs = motorcycles.map((model) => model.slug);

    expect(motorcycles).toHaveLength(8);
    expect(new Set(slugs)).toHaveLength(slugs.length);
  });

  it("filters by category and availability", () => {
    const results = filterModels({
      category: "Adventure",
      availability: "available",
    });

    expect(results).toHaveLength(2);
    expect(results.every((model) => model.category === "Adventure")).toBe(true);
  });

  it("sorts by power descending", () => {
    const results = filterModels({ sort: "power-desc" });

    expect(results[0]?.slug).toBe("apex-900-rr");
  });

  it("finds a model by slug", () => {
    expect(getModel("rift-700")?.name).toBe("Rift 700");
    expect(getModel("missing")).toBeUndefined();
  });

  it("keeps the researched 2026 launch prices in whole RON", () => {
    expect(
      Object.fromEntries(motorcycles.map((model) => [model.slug, model.price])),
    ).toEqual({
      "terran-650": 36_990,
      "terran-900-rally": 54_990,
      "apex-675-r": 39_990,
      "apex-900-rr": 66_990,
      "rift-700": 38_990,
      "meridian-900-gt": 59_990,
      "foundry-800": 47_990,
      "volt-e2": 59_990,
    });
  });
});
