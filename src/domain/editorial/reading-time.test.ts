import { describe, expect, it } from "vitest";

import { estimateReadingMinutes } from "@/domain/editorial/reading-time";

describe("editorial reading time", () => {
  it("returns at least one minute for short or empty content", () => {
    expect(estimateReadingMinutes("")).toBe(1);
    expect(estimateReadingMinutes("Un text foarte scurt.")).toBe(1);
  });

  it("counts readable words and ignores markdown structure", () => {
    const words = Array.from({ length: 211 }, () => "motocicletă").join(" ");

    expect(estimateReadingMinutes(`## Titlu\n\n${words}`)).toBe(2);
  });
});
