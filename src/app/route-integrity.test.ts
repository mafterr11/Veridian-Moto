import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routeContracts = {
  homepage: ["src/app/(public)/page.tsx", "function HomePage"],
  accessories: [
    "src/app/(public)/accesorii/page.tsx",
    "function AccessoriesPage",
  ],
  models: ["src/app/(public)/modele/page.tsx", "function ModelsPage"],
  modelDetail: [
    "src/app/(public)/modele/[slug]/page.tsx",
    "function ModelDetailPage",
  ],
  discover: ["src/app/(public)/descopera/page.tsx", "function DiscoverPage"],
  article: [
    "src/app/(public)/descopera/[slug]/page.tsx",
    "function ArticlePage",
  ],
  adminDashboard: [
    "src/app/atelier/(protected)/page.tsx",
    "function AdminDashboardPage",
  ],
  adminInquiries: [
    "src/app/atelier/(protected)/solicitari/page.tsx",
    "function AdminInquiriesPage",
  ],
  adminDiscover: [
    "src/app/atelier/(protected)/descopera/page.tsx",
    "function AdminDiscoverPage",
  ],
  adminArticlePreview: [
    "src/app/atelier/(protected)/descopera/[id]/previzualizare/page.tsx",
    "function EditorialPreviewPage",
  ],
} as const;

function source(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("critical route source integrity", () => {
  it.each(Object.entries(routeContracts))(
    "%s retains its route-specific component",
    (_, [relativePath, signature]) => {
      expect(source(relativePath)).toContain(signature);
    },
  );

  it("does not contain byte-for-byte duplicate critical pages", () => {
    const hashes = Object.values(routeContracts).map(([relativePath]) =>
      createHash("sha256").update(source(relativePath)).digest("hex"),
    );

    expect(new Set(hashes).size).toBe(hashes.length);
  });
});
