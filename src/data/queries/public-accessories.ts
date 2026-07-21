import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  accessories,
  accessoryCategories,
  accessoryCompatibility,
  accessoryMedia,
  mediaAssets,
  motorcycleModels,
} from "@/db/schema";
import { demoAccessories } from "@/data/accessories";
import { CACHE_TAGS } from "@/data/cache-tags";
import {
  toPublicAccessoryDTO,
  type PublicAccessoryDTO,
} from "@/data/dto/public-accessory";

async function loadPublicAccessories(): Promise<readonly PublicAccessoryDTO[]> {
  const db = getDatabase();
  const rows = await db
    .select({
      id: accessories.id,
      slug: accessories.slug,
      name: accessories.name,
      category: accessoryCategories.name,
      priceMinor: accessories.priceMinor,
      summary: accessories.summary,
      stockState: accessories.stockState,
      featured: accessories.featured,
    })
    .from(accessories)
    .innerJoin(
      accessoryCategories,
      eq(accessories.categoryId, accessoryCategories.id),
    )
    .where(
      and(
        eq(accessories.status, "published"),
        eq(accessoryCategories.status, "published"),
      ),
    )
    .orderBy(asc(accessoryCategories.sortOrder), asc(accessories.name));

  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const mediaRows = await db
    .select({
      accessoryId: accessoryMedia.accessoryId,
      path: mediaAssets.storagePath,
      alt: mediaAssets.altText,
    })
    .from(accessoryMedia)
    .innerJoin(mediaAssets, eq(accessoryMedia.mediaId, mediaAssets.id))
    .where(inArray(accessoryMedia.accessoryId, ids))
    .orderBy(asc(accessoryMedia.sortOrder));
  const compatibilityRows = await db
    .select({
      accessoryId: accessoryCompatibility.accessoryId,
      modelName: motorcycleModels.name,
    })
    .from(accessoryCompatibility)
    .innerJoin(
      motorcycleModels,
      eq(accessoryCompatibility.modelId, motorcycleModels.id),
    )
    .where(
      and(
        inArray(accessoryCompatibility.accessoryId, ids),
        eq(motorcycleModels.status, "published"),
      ),
    )
    .orderBy(asc(motorcycleModels.name));

  const firstMedia = new Map(
    mediaRows.map((media) => [media.accessoryId, media]),
  );
  const compatibility = new Map<string, string[]>();
  for (const row of compatibilityRows) {
    const models = compatibility.get(row.accessoryId) ?? [];
    models.push(row.modelName);
    compatibility.set(row.accessoryId, models);
  }

  return rows.map(({ id, ...row }) =>
    toPublicAccessoryDTO(row, firstMedia.get(id), compatibility.get(id) ?? []),
  );
}

const getCachedPublicAccessories = unstable_cache(
  loadPublicAccessories,
  ["public-accessories"],
  {
    revalidate: 3_600,
    tags: [CACHE_TAGS.publicCatalogue, CACHE_TAGS.publicAccessories],
  },
);

export async function getPublicAccessories(): Promise<
  readonly PublicAccessoryDTO[]
> {
  if (!isDatabaseConfigured()) return demoAccessories;
  return getCachedPublicAccessories();
}
