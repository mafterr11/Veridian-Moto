import { describe, expect, it } from "vitest";

import { formatOpeningHours, phoneHref } from "@/domain/site-settings";

describe("public site settings", () => {
  it("formats the complete weekly programme", () => {
    expect(
      formatOpeningHours({
        luni: { closed: false, opens: "09:00", closes: "18:00" },
        marti: { closed: false, opens: "09:00", closes: "18:00" },
        miercuri: { closed: false, opens: "09:00", closes: "18:00" },
        joi: { closed: false, opens: "09:00", closes: "18:00" },
        vineri: { closed: false, opens: "09:00", closes: "18:00" },
        sambata: { closed: false, opens: "10:00", closes: "14:00" },
        duminica: { closed: true },
      }),
    ).toContain("Duminică: închis");
  });

  it("creates a safe telephone link", () => {
    expect(phoneHref("+40 312 345 678")).toBe("tel:+40312345678");
  });
});
