import "server-only";

import { and, asc, desc, eq, lte } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { discoverCategories, discoverPosts, mediaAssets } from "@/db/schema";
import { CACHE_TAGS, discoverPostCacheTag } from "@/data/cache-tags";
import { articles, getDemoArticle } from "@/data/editorial";

export type PublicArticleSummary = {
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  publishedAt: Date;
  updatedAt: Date;
  featured: boolean;
};

export type PublicArticleDetail = PublicArticleSummary & {
  bodyMarkdown: string;
  seoTitle?: string;
  seoDescription?: string;
};

function demoSummary(article: (typeof articles)[number]): PublicArticleSummary {
  const publishedAt = new Date(article.publishedAt);
  return {
    slug: article.slug,
    category: article.category,
    categorySlug: article.categorySlug,
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
    imageAlt: article.imageAlt,
    publishedAt,
    updatedAt: publishedAt,
    featured: article.featured,
  };
}

export async function getPublicArticles(): Promise<
  readonly PublicArticleSummary[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicDiscover);

  if (!isDatabaseConfigured()) return articles.map(demoSummary);
  const rows = await getDatabase()
    .select({
      slug: discoverPosts.slug,
      category: discoverCategories.name,
      categorySlug: discoverCategories.slug,
      title: discoverPosts.title,
      excerpt: discoverPosts.excerpt,
      image: mediaAssets.storagePath,
      imageAlt: mediaAssets.altText,
      publishedAt: discoverPosts.publishedAt,
      updatedAt: discoverPosts.updatedAt,
      featured: discoverPosts.featured,
    })
    .from(discoverPosts)
    .innerJoin(
      discoverCategories,
      eq(discoverPosts.categoryId, discoverCategories.id),
    )
    .innerJoin(mediaAssets, eq(discoverPosts.coverMediaId, mediaAssets.id))
    .where(
      and(
        eq(discoverPosts.status, "published"),
        lte(discoverPosts.publishedAt, new Date()),
      ),
    )
    .orderBy(desc(discoverPosts.featured), desc(discoverPosts.publishedAt));

  return rows.flatMap((row) =>
    row.publishedAt ? [{ ...row, publishedAt: row.publishedAt }] : [],
  );
}

export async function getPublicDiscoverCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicDiscover);

  const publicArticles = await getPublicArticles();
  const categoryMap = new Map<
    string,
    { name: string; slug: string; articleCount: number }
  >();
  for (const article of publicArticles) {
    const category = categoryMap.get(article.categorySlug);
    categoryMap.set(article.categorySlug, {
      name: article.category,
      slug: article.categorySlug,
      articleCount: (category?.articleCount ?? 0) + 1,
    });
  }
  return [...categoryMap.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "ro"),
  );
}

export async function getPublicArticle(
  slug: string,
): Promise<PublicArticleDetail | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicDiscover, discoverPostCacheTag(slug));

  if (!isDatabaseConfigured()) {
    const article = getDemoArticle(slug);
    return article
      ? {
          ...demoSummary(article),
          bodyMarkdown: article.bodyMarkdown,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
        }
      : undefined;
  }

  const [row] = await getDatabase()
    .select({
      slug: discoverPosts.slug,
      category: discoverCategories.name,
      categorySlug: discoverCategories.slug,
      title: discoverPosts.title,
      excerpt: discoverPosts.excerpt,
      bodyMarkdown: discoverPosts.bodyMarkdown,
      image: mediaAssets.storagePath,
      imageAlt: mediaAssets.altText,
      publishedAt: discoverPosts.publishedAt,
      updatedAt: discoverPosts.updatedAt,
      featured: discoverPosts.featured,
      seoTitle: discoverPosts.seoTitle,
      seoDescription: discoverPosts.seoDescription,
    })
    .from(discoverPosts)
    .innerJoin(
      discoverCategories,
      eq(discoverPosts.categoryId, discoverCategories.id),
    )
    .innerJoin(mediaAssets, eq(discoverPosts.coverMediaId, mediaAssets.id))
    .where(
      and(
        eq(discoverPosts.slug, slug),
        eq(discoverPosts.status, "published"),
        lte(discoverPosts.publishedAt, new Date()),
      ),
    )
    .limit(1);

  if (!row?.publishedAt) return undefined;
  return {
    ...row,
    publishedAt: row.publishedAt,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
  };
}

export async function getPublicArticleSlugs() {
  return (await getPublicArticleIndexEntries()).map(({ slug }) => slug);
}

export async function getPublicArticleIndexEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicDiscover);

  if (!isDatabaseConfigured()) {
    return articles.map(({ slug, publishedAt }) => ({
      slug,
      updatedAt: new Date(publishedAt),
    }));
  }
  return getDatabase()
    .select({
      slug: discoverPosts.slug,
      updatedAt: discoverPosts.updatedAt,
    })
    .from(discoverPosts)
    .where(
      and(
        eq(discoverPosts.status, "published"),
        lte(discoverPosts.publishedAt, new Date()),
      ),
    )
    .orderBy(asc(discoverPosts.slug));
}
