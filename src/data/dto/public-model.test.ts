import { describe, expect, it } from "vitest";

import { toPublicModelDTO } from "@/data/dto/public-model";

const model = {
  slug: "terran-test",
  name: "Terran Test",
  category: "Adventure",
  basePriceMinor: 4_999_000,
  powerHp: 105,
  displacementCc: 895,
  torqueNm: 93,
  wetWeightKg: 229,
  additionalSpecs: { rangeKm: 420 },
  summary: "Model public de test.",
  featured: true,
};

describe("public model DTO", () => {
  it("converts minor money units and derives availability without private data", () => {
    const result = toPublicModelDTO(
      model,
      { available: 2, incoming: 1 },
      { path: "/model.webp", alt: "Motocicletă" },
      ["ABS"],
    );

    expect(result).toMatchObject({
      price: 49_990,
      availability: "available",
      stockCount: 2,
      displacement: "895 cm³",
      rangeKm: 420,
    });
    expect(result).not.toHaveProperty("vin");
    expect(result).not.toHaveProperty("privateNotes");
    expect(result).not.toHaveProperty("internalQuantity");
  });

  it("uses incoming and order states when no unit is immediately available", () => {
    expect(
      toPublicModelDTO(model, { available: 0, incoming: 1 }, undefined, [])
        .availability,
    ).toBe("incoming");
    expect(
      toPublicModelDTO(model, { available: 0, incoming: 0 }, undefined, [])
        .availability,
    ).toBe("order");
  });
});
