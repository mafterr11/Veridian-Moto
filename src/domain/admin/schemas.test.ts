import { describe, expect, it } from "vitest";

import {
  discoverPostSchema,
  inventorySchema,
  optionGroupSchema,
  parseMoneyToMinor,
  siteSettingsSchema,
} from "@/domain/admin/schemas";

describe("admin form validation", () => {
  it("converts Romanian-friendly decimal prices to integer bani", () => {
    expect(parseMoneyToMinor("49990")).toBe(4_999_000);
    expect(parseMoneyToMinor("49990,50")).toBe(4_999_050);
    expect(parseMoneyToMinor("12.345")).toBeNaN();
  });

  it("rejects inconsistent configuration limits", () => {
    const result = optionGroupSchema.safeParse({
      modelId: "550e8400-e29b-41d4-a716-446655440000",
      key: "culoare",
      name: "Culoare",
      description: "Alege culoarea.",
      selectionType: "single",
      required: true,
      minSelected: "0",
      maxSelected: "2",
      sortOrder: "0",
      status: "draft",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["minSelected", "maxSelected"]),
      );
    }
  });

  it("normalizes and validates private VIN input", () => {
    const base = {
      modelId: "550e8400-e29b-41d4-a716-446655440000",
      stockCode: "TEST-001",
      condition: "new",
      year: "2026",
      mileageKm: "0",
      colour: "Graphite",
      priceMinor: "49990",
      status: "available",
      isPublic: true,
    };

    expect(
      inventorySchema.parse({ ...base, vin: "wvwzzza1zlw000001" }).vin,
    ).toBe("WVWZZZA1ZLW000001");
    expect(inventorySchema.safeParse({ ...base, vin: "short" }).success).toBe(
      false,
    );
  });

  it("prevents reserved or sold stock from remaining public", () => {
    const result = inventorySchema.safeParse({
      modelId: "550e8400-e29b-41d4-a716-446655440000",
      stockCode: "TEST-002",
      condition: "demo",
      year: "2026",
      mileageKm: "120",
      colour: "Veridian",
      priceMinor: "47990",
      status: "reserved",
      isPublic: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["isPublic"]);
    }
  });

  it("requires a cover before an editorial draft can be published", () => {
    const result = discoverPostSchema.safeParse({
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Un articol editorial valid",
      slug: "articol-editorial-valid",
      excerpt:
        "Un rezumat suficient de amplu pentru cardul articolului public.",
      bodyMarkdown:
        "## Titlu\n\nAcesta este un corp editorial suficient de lung pentru a trece validarea serverului și pentru a demonstra publicarea.",
      featured: false,
      status: "published",
      publishedAt: "2026-07-21T08:30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["coverMediaId"]);
    }
  });

  it("rejects inverted opening hours", () => {
    const open = { closed: false, opens: "09:00", closes: "18:00" };
    const result = siteSettingsSchema.safeParse({
      contactEmail: "salut@example.com",
      contactPhone: "+40 312 345 678",
      address: "Strada Atelierului 24, Brașov, România",
      openingHours: {
        luni: { closed: false, opens: "18:00", closes: "09:00" },
        marti: open,
        miercuri: open,
        joi: open,
        vineri: open,
        sambata: open,
        duminica: { closed: true },
      },
      socialLinks: {},
      defaultSeoTitle: "VERIDIAN Moto — Mai mult standard",
      defaultSeoDescription:
        "Motociclete moderne, echipare generoasă și informații clare pentru fiecare drum.",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("closes")),
      ).toBe(true);
    }
  });

  it("allows only HTTP or HTTPS social links", () => {
    const open = { closed: false, opens: "09:00", closes: "18:00" };
    const base = {
      contactEmail: "salut@example.com",
      contactPhone: "+40 312 345 678",
      address: "Strada Atelierului 24, Brașov, România",
      openingHours: {
        luni: open,
        marti: open,
        miercuri: open,
        joi: open,
        vineri: open,
        sambata: open,
        duminica: { closed: true },
      },
      defaultSeoTitle: "VERIDIAN Moto — Mai mult standard",
      defaultSeoDescription:
        "Motociclete moderne, echipare generoasă și informații clare pentru fiecare drum.",
    };

    expect(
      siteSettingsSchema.safeParse({
        ...base,
        socialLinks: { instagram: "javascript:alert(1)" },
      }).success,
    ).toBe(false);
    expect(
      siteSettingsSchema.safeParse({
        ...base,
        socialLinks: { instagram: "https://instagram.com/veridian" },
      }).success,
    ).toBe(true);
  });
});
