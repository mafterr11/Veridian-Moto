import "server-only";

import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  categories,
  inventoryMedia,
  inventoryUnits,
  mediaAssets,
  modelFeatures,
  modelMedia,
  motorcycleModels,
} from "@/db/schema";
import { CACHE_TAGS } from "@/data/cache-tags";
import { demoModelMetadata, getModel, motorcycles } from "@/data/catalogue";
import {
  toPublicModelDTO,
  type PublicModelDetailDTO,
  type PublicModelDTO,
} from "@/data/dto/public-model";
import { modelCacheTag } from "@/data/cache-tags";

export type PublicCategoryDTO = {
  name: string;
  slug: string;
  description: string;
  modelCount: number;
};

export async function getPublicModelIndexEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicCatalogue, CACHE_TAGS.publicModels);

  if (!isDatabaseConfigured()) {
    return motorcycles.map(({ slug }) => ({
      slug,
      updatedAt: new Date("2026-07-21"),
    }));
  }

  return getDatabase()
    .select({
      slug: motorcycleModels.slug,
      updatedAt: motorcycleModels.updatedAt,
    })
    .from(motorcycleModels)
    .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
    .where(
      and(
        eq(motorcycleModels.status, "published"),
        eq(categories.status, "published"),
      ),
    )
    .orderBy(asc(motorcycleModels.slug));
}

export async function getPublicCategories(): Promise<
  readonly PublicCategoryDTO[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicCatalogue, CACHE_TAGS.publicModels);

  if (!isDatabaseConfigured()) {
    const names = [...new Set(motorcycles.map((model) => model.category))];
    return names.map((name) => ({
      name,
      slug: name.toLocaleLowerCase("ro-RO").replaceAll(" ", "-"),
      description: `Modelele VERIDIAN din categoria ${name}.`,
      modelCount: motorcycles.filter((model) => model.category === name).length,
    }));
  }

  return getDatabase()
    .select({
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      modelCount: count(motorcycleModels.id),
    })
    .from(categories)
    .leftJoin(
      motorcycleModels,
      and(
        eq(motorcycleModels.categoryId, categories.id),
        eq(motorcycleModels.status, "published"),
      ),
    )
    .where(eq(categories.status, "published"))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getPublicModels(): Promise<readonly PublicModelDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicCatalogue, CACHE_TAGS.publicModels);

  if (!isDatabaseConfigured()) {
    return motorcycles;
  }

  const db = getDatabase();
  const modelRows = await db
    .select({
      id: motorcycleModels.id,
      slug: motorcycleModels.slug,
      name: motorcycleModels.name,
      category: categories.name,
      basePriceMinor: motorcycleModels.basePriceMinor,
      powerHp: motorcycleModels.powerHp,
      displacementCc: motorcycleModels.displacementCc,
      torqueNm: motorcycleModels.torqueNm,
      wetWeightKg: motorcycleModels.wetWeightKg,
      additionalSpecs: motorcycleModels.additionalSpecs,
      summary: motorcycleModels.summary,
      featured: motorcycleModels.featured,
    })
    .from(motorcycleModels)
    .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
    .where(
      and(
        eq(motorcycleModels.status, "published"),
        eq(categories.status, "published"),
      ),
    )
    .orderBy(asc(motorcycleModels.basePriceMinor));

  if (modelRows.length === 0) {
    return [];
  }

  const modelIds = modelRows.map((model) => model.id);
  const [inventoryRows, mediaRows, featureRows] = await Promise.all([
    db
      .select({
        modelId: inventoryUnits.modelId,
        available:
          sql<number>`count(*) filter (where ${inventoryUnits.status} = 'available')`.mapWith(
            Number,
          ),
        incoming:
          sql<number>`count(*) filter (where ${inventoryUnits.status} = 'incoming')`.mapWith(
            Number,
          ),
      })
      .from(inventoryUnits)
      .where(
        and(
          eq(inventoryUnits.isPublic, true),
          inArray(inventoryUnits.modelId, modelIds),
        ),
      )
      .groupBy(inventoryUnits.modelId),
    db
      .select({
        modelId: modelMedia.modelId,
        path: mediaAssets.storagePath,
        alt: mediaAssets.altText,
      })
      .from(modelMedia)
      .innerJoin(mediaAssets, eq(modelMedia.mediaId, mediaAssets.id))
      .where(
        and(eq(modelMedia.role, "card"), inArray(modelMedia.modelId, modelIds)),
      )
      .orderBy(asc(modelMedia.sortOrder)),
    db
      .select({
        modelId: modelFeatures.modelId,
        label: modelFeatures.label,
        value: modelFeatures.value,
      })
      .from(modelFeatures)
      .where(
        and(
          eq(modelFeatures.isStandard, true),
          inArray(modelFeatures.modelId, modelIds),
        ),
      )
      .orderBy(asc(modelFeatures.sortOrder)),
  ]);

  const inventoryByModel = new Map(
    inventoryRows.map((inventory) => [inventory.modelId, inventory]),
  );
  const mediaByModel = new Map(
    mediaRows.map((media) => [media.modelId, media]),
  );
  const featuresByModel = new Map<string, string[]>();

  for (const feature of featureRows) {
    const features = featuresByModel.get(feature.modelId) ?? [];
    features.push(
      feature.value ? `${feature.label}: ${feature.value}` : feature.label,
    );
    featuresByModel.set(feature.modelId, features);
  }

  return modelRows.map(({ id, ...model }) =>
    toPublicModelDTO(
      model,
      inventoryByModel.get(id),
      mediaByModel.get(id),
      featuresByModel.get(id) ?? [],
    ),
  );
}

export async function getPublicModel(
  slug: string,
): Promise<PublicModelDetailDTO | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.publicCatalogue,
    CACHE_TAGS.publicModels,
    CACHE_TAGS.publicInventory,
    modelCacheTag(slug),
  );

  if (!isDatabaseConfigured()) {
    const model = getModel(slug);
    const metadata = demoModelMetadata[slug];
    if (!model || !metadata) return undefined;

    return {
      ...model,
      tagline: metadata.tagline,
      fullDescription: model.description,
      modelYear: metadata.modelYear,
      seatHeightMm: metadata.seatHeightMm,
      configuratorEnabled: metadata.configuratorEnabled,
      media: [{ path: model.image, alt: model.imageAlt, role: "hero" }],
      inventory: Array.from(
        {
          length: model.stockCount || model.availability === "incoming" ? 1 : 0,
        },
        (_, index) => ({
          stockCode: `${model.slug.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
          condition: "new" as const,
          year: metadata.modelYear,
          mileageKm: 0,
          colour: "Configurație standard",
          price: model.price,
          status:
            model.availability === "incoming"
              ? ("incoming" as const)
              : ("available" as const),
        }),
      ),
    };
  }

  const db = getDatabase();
  const [row] = await db
    .select({
      id: motorcycleModels.id,
      slug: motorcycleModels.slug,
      name: motorcycleModels.name,
      category: categories.name,
      tagline: motorcycleModels.tagline,
      summary: motorcycleModels.summary,
      description: motorcycleModels.description,
      modelYear: motorcycleModels.modelYear,
      basePriceMinor: motorcycleModels.basePriceMinor,
      displacementCc: motorcycleModels.displacementCc,
      powerHp: motorcycleModels.powerHp,
      torqueNm: motorcycleModels.torqueNm,
      wetWeightKg: motorcycleModels.wetWeightKg,
      seatHeightMm: motorcycleModels.seatHeightMm,
      additionalSpecs: motorcycleModels.additionalSpecs,
      featured: motorcycleModels.featured,
      configuratorEnabled: motorcycleModels.configuratorEnabled,
    })
    .from(motorcycleModels)
    .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
    .where(
      and(
        eq(motorcycleModels.slug, slug),
        eq(motorcycleModels.status, "published"),
        eq(categories.status, "published"),
      ),
    )
    .limit(1);

  if (!row) return undefined;

  const [inventoryRows, mediaRows, inventoryMediaRows, featureRows] =
    await Promise.all([
      db
        .select({
          id: inventoryUnits.id,
          stockCode: inventoryUnits.stockCode,
          condition: inventoryUnits.condition,
          year: inventoryUnits.year,
          mileageKm: inventoryUnits.mileageKm,
          colour: inventoryUnits.colour,
          priceMinor: inventoryUnits.priceMinor,
          status: inventoryUnits.status,
        })
        .from(inventoryUnits)
        .where(
          and(
            eq(inventoryUnits.modelId, row.id),
            eq(inventoryUnits.isPublic, true),
            inArray(inventoryUnits.status, ["incoming", "available"]),
          ),
        )
        .orderBy(asc(inventoryUnits.priceMinor)),
      db
        .select({
          path: mediaAssets.storagePath,
          alt: mediaAssets.altText,
          role: modelMedia.role,
          sortOrder: modelMedia.sortOrder,
        })
        .from(modelMedia)
        .innerJoin(mediaAssets, eq(modelMedia.mediaId, mediaAssets.id))
        .where(eq(modelMedia.modelId, row.id))
        .orderBy(asc(modelMedia.sortOrder)),
      db
        .select({
          inventoryUnitId: inventoryMedia.inventoryUnitId,
          path: mediaAssets.storagePath,
          alt: mediaAssets.altText,
        })
        .from(inventoryMedia)
        .innerJoin(mediaAssets, eq(inventoryMedia.mediaId, mediaAssets.id))
        .innerJoin(
          inventoryUnits,
          eq(inventoryMedia.inventoryUnitId, inventoryUnits.id),
        )
        .where(
          and(
            eq(inventoryUnits.modelId, row.id),
            eq(inventoryUnits.isPublic, true),
          ),
        )
        .orderBy(asc(inventoryMedia.sortOrder)),
      db
        .select({ label: modelFeatures.label, value: modelFeatures.value })
        .from(modelFeatures)
        .where(
          and(
            eq(modelFeatures.modelId, row.id),
            eq(modelFeatures.isStandard, true),
          ),
        )
        .orderBy(asc(modelFeatures.sortOrder)),
    ]);

  const inventoryMediaByUnit = new Map(
    inventoryMediaRows.map((media) => [media.inventoryUnitId, media]),
  );
  const available = inventoryRows.filter(
    (unit) => unit.status === "available",
  ).length;
  const incoming = inventoryRows.filter(
    (unit) => unit.status === "incoming",
  ).length;
  const cardMedia = mediaRows.find((media) => media.role === "card");
  const heroMedia =
    mediaRows.find((media) => media.role === "hero") ?? cardMedia;
  const highlights = featureRows.map((feature) =>
    feature.value ? `${feature.label}: ${feature.value}` : feature.label,
  );
  const base = toPublicModelDTO(
    row,
    { available, incoming },
    cardMedia ?? heroMedia,
    highlights,
  );

  return {
    ...base,
    image: heroMedia?.path ?? base.image,
    imageAlt: heroMedia?.alt ?? base.imageAlt,
    tagline: row.tagline,
    fullDescription: row.description,
    modelYear: row.modelYear,
    seatHeightMm: row.seatHeightMm,
    configuratorEnabled: row.configuratorEnabled,
    media: mediaRows.map(({ sortOrder: _sortOrder, ...media }) => media),
    inventory: inventoryRows.map(({ id, priceMinor, ...unit }) => {
      const media = inventoryMediaByUnit.get(id);
      return {
        ...unit,
        status: unit.status as "incoming" | "available",
        price: priceMinor / 100,
        image: media?.path,
        imageAlt: media?.alt,
      };
    }),
  };
}
