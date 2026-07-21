import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { discoverCategories, discoverPosts, mediaAssets } from "@/db/schema";
import {
  assertAdmin,
  isAdminInfrastructureConfigured,
} from "@/data/auth/admin-session";

export async function getAdminEditorialWorkspace() {
  if (!isAdminInfrastructureConfigured()) {
    return { categories: [], posts: [], mediaLibrary: [] };
  }
  await assertAdmin();
  const db = getDatabase();
  const categories = await db
    .select()
    .from(discoverCategories)
    .orderBy(asc(discoverCategories.sortOrder), asc(discoverCategories.name));
  const posts = await db
    .select({
      id: discoverPosts.id,
      categoryId: discoverPosts.categoryId,
      categoryName: discoverCategories.name,
      title: discoverPosts.title,
      slug: discoverPosts.slug,
      excerpt: discoverPosts.excerpt,
      bodyMarkdown: discoverPosts.bodyMarkdown,
      coverMediaId: discoverPosts.coverMediaId,
      coverPath: mediaAssets.storagePath,
      coverAlt: mediaAssets.altText,
      featured: discoverPosts.featured,
      status: discoverPosts.status,
      publishedAt: discoverPosts.publishedAt,
      seoTitle: discoverPosts.seoTitle,
      seoDescription: discoverPosts.seoDescription,
      updatedAt: discoverPosts.updatedAt,
    })
    .from(discoverPosts)
    .innerJoin(
      discoverCategories,
      eq(discoverPosts.categoryId, discoverCategories.id),
    )
    .leftJoin(mediaAssets, eq(discoverPosts.coverMediaId, mediaAssets.id))
    .orderBy(desc(discoverPosts.updatedAt));
  const mediaLibrary = await db
    .select({
      id: mediaAssets.id,
      storagePath: mediaAssets.storagePath,
      altText: mediaAssets.altText,
      width: mediaAssets.width,
      height: mediaAssets.height,
    })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(150);

  return { categories, posts, mediaLibrary };
}

export async function getAdminPostPreview(id: string) {
  if (!isAdminInfrastructureConfigured()) return null;
  await assertAdmin();
  const [post] = await getDatabase()
    .select({
      id: discoverPosts.id,
      title: discoverPosts.title,
      slug: discoverPosts.slug,
      excerpt: discoverPosts.excerpt,
      bodyMarkdown: discoverPosts.bodyMarkdown,
      category: discoverCategories.name,
      image: mediaAssets.storagePath,
      imageAlt: mediaAssets.altText,
      status: discoverPosts.status,
      publishedAt: discoverPosts.publishedAt,
      updatedAt: discoverPosts.updatedAt,
    })
    .from(discoverPosts)
    .innerJoin(
      discoverCategories,
      eq(discoverPosts.categoryId, discoverCategories.id),
    )
    .leftJoin(mediaAssets, eq(discoverPosts.coverMediaId, mediaAssets.id))
    .where(eq(discoverPosts.id, id))
    .limit(1);
  return post ?? null;
}
