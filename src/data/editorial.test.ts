import { describe, expect, it } from "vitest";

import { articles } from "@/data/editorial";
import { estimateReadingMinutes } from "@/domain/editorial/reading-time";

describe("demo editorial catalogue", () => {
  it("keeps all six articles substantial and visually structured", () => {
    expect(articles).toHaveLength(6);

    for (const article of articles) {
      expect(
        estimateReadingMinutes(article.bodyMarkdown),
      ).toBeGreaterThanOrEqual(3);
      expect(article.bodyMarkdown.match(/^## /gm)?.length ?? 0).toBeGreaterThan(
        2,
      );
      expect(article.bodyMarkdown).toContain("> ");
      expect(article.bodyMarkdown).toContain("- ");
      expect(article.seoTitle).toBeTruthy();
      expect(article.seoDescription).toBeTruthy();
    }
  });
});
