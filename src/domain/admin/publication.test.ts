import { describe, expect, it } from "vitest";

import {
  validateModelPublication,
  type ModelPublicationCandidate,
} from "@/domain/admin/publication";

const validCandidate: ModelPublicationCandidate = {
  id: "model-1",
  name: "Terran 900 Rally",
  slug: "terran-900-rally",
  categoryId: "category-1",
  categoryPublished: true,
  summary: "Un adventure pregătit pentru drumuri foarte lungi.",
  description:
    "O descriere completă a motocicletei, echipării standard și utilizării sale.",
  basePriceMinor: 4_999_000,
  powerHp: 105,
  torqueNm: 93,
  wetWeightKg: 229,
  seatHeightMm: 870,
  configuratorEnabled: false,
  mediaRoles: ["card", "hero"],
};

describe("model publication validation", () => {
  it("accepts a complete non-configurable model", () => {
    expect(validateModelPublication(validCandidate)).toEqual([]);
  });

  it("collects actionable issues instead of partially publishing", () => {
    const issues = validateModelPublication({
      ...validCandidate,
      categoryPublished: false,
      powerHp: 0,
      mediaRoles: [],
      configuratorEnabled: true,
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "invalid-category",
        "missing-key-specifications",
        "missing-card-media",
        "missing-hero-media",
        "missing-configuration",
      ]),
    );
  });
});
