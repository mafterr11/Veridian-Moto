import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site";

describe("siteConfig", () => {
  it("keeps the approved public navigation in order", () => {
    expect(siteConfig.navigation.map((item) => item.label)).toEqual([
      "Acasă",
      "Modele",
      "Accesorii",
      "Descoperă",
      "Contact",
    ]);
  });

  it("uses the approved Romanian locale and currency", () => {
    expect(siteConfig.locale).toBe("ro-RO");
    expect(siteConfig.currency).toBe("RON");
  });
});
