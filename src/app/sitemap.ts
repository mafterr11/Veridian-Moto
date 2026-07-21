import type { MetadataRoute } from "next";

import { getPublicArticleIndexEntries } from "@/data/queries/public-editorial";
import { getPublicModelIndexEntries } from "@/data/queries/public-models";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const models = await getPublicModelIndexEntries();
  const articles = await getPublicArticleIndexEntries();
  const staticRoutes = [
    "",
    "/modele",
    "/configurator",
    "/accesorii",
    "/descopera",
    "/contact",
    "/politica-de-confidentialitate",
    "/termeni-si-conditii",
    "/politica-cookies",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date("2026-07-21"),
    })),
    ...models.map((model) => ({
      url: `${baseUrl}/modele/${model.slug}`,
      lastModified: model.updatedAt,
    })),
    ...articles.map((article) => ({
      url: `${baseUrl}/descopera/${article.slug}`,
      lastModified: article.updatedAt,
    })),
  ];
}
