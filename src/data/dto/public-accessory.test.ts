import { describe, expect, it } from "vitest";

import { toPublicAccessoryDTO } from "@/data/dto/public-accessory";

describe("public accessory DTO", () => {
  it("projects only public accessory fields and converts bani to lei", () => {
    const result = toPublicAccessoryDTO(
      {
        slug: "cutii",
        name: "Cutii laterale",
        category: "Bagaje",
        priceMinor: 429_000,
        summary: "Bagaje pentru drum lung.",
        stockState: "in_stock",
        featured: true,
      },
      { path: "/cutii.webp", alt: "Cutii laterale" },
      ["Terran 650"],
    );

    expect(result).toMatchObject({
      price: 4_290,
      image: "/cutii.webp",
      compatibility: ["Terran 650"],
    });
    expect(result).not.toHaveProperty("internalQuantity");
  });
});
