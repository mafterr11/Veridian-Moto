import { describe, expect, it } from "vitest";

import { parseEditorialBody } from "@/domain/editorial/body";

describe("editorial body parser", () => {
  it("creates a small safe set of structured content blocks", () => {
    expect(
      parseEditorialBody(`## Poziția la ghidon

Două linii care formează
același paragraf.

- Control la viteză mică
- Confort pe distanță

> Motocicleta potrivită dispare de sub tine.`),
    ).toEqual([
      { type: "heading", level: 2, text: "Poziția la ghidon" },
      {
        type: "paragraph",
        text: "Două linii care formează același paragraf.",
      },
      {
        type: "list",
        items: ["Control la viteză mică", "Confort pe distanță"],
      },
      { type: "quote", text: "Motocicleta potrivită dispare de sub tine." },
    ]);
  });

  it("removes raw HTML and link destinations instead of rendering them", () => {
    expect(
      parseEditorialBody(
        '<script>alert("x")</script> Citește [ghidul](javascript:alert(1)).',
      ),
    ).toEqual([{ type: "paragraph", text: 'alert("x") Citește ghidul).' }]);
  });
});
