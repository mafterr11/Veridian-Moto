import "server-only";

import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  categories,
  configurationSnapshots,
  motorcycleModels,
  optionChoices,
  optionGroups,
} from "@/db/schema";
import { CACHE_TAGS } from "@/data/cache-tags";
import { restoreCacheDate, serializeCacheDate } from "@/data/cache-date";

async function loadPublicConfiguration(reference: string) {
  const db = getDatabase();
  const [snapshot] = await db
    .select({
      reference: configurationSnapshots.publicReference,
      modelId: configurationSnapshots.modelId,
      modelIdentity: configurationSnapshots.modelIdentity,
      basePriceMinor: configurationSnapshots.basePriceMinor,
      selectedChoices: configurationSnapshots.selectedChoices,
      totalPriceMinor: configurationSnapshots.totalPriceMinor,
      currency: configurationSnapshots.currency,
      createdAt: configurationSnapshots.createdAt,
    })
    .from(configurationSnapshots)
    .where(eq(configurationSnapshots.publicReference, reference))
    .limit(1);
  if (!snapshot) return undefined;

  const currentlyPublished = snapshot.modelId
    ? await db
        .select({
          groupKey: optionGroups.key,
          choiceCode: optionChoices.code,
        })
        .from(optionChoices)
        .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
        .innerJoin(
          motorcycleModels,
          eq(optionGroups.modelId, motorcycleModels.id),
        )
        .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
        .where(
          and(
            eq(motorcycleModels.id, snapshot.modelId),
            eq(motorcycleModels.status, "published"),
            eq(motorcycleModels.configuratorEnabled, true),
            eq(categories.status, "published"),
            eq(optionGroups.status, "published"),
            eq(optionChoices.status, "published"),
          ),
        )
    : [];
  const availableKeys = new Set(
    currentlyPublished.map(
      (choice) => `${choice.groupKey}:${choice.choiceCode}`,
    ),
  );
  return {
    reference: snapshot.reference,
    modelIdentity: snapshot.modelIdentity,
    basePriceMinor: snapshot.basePriceMinor,
    totalPriceMinor: snapshot.totalPriceMinor,
    currency: snapshot.currency,
    createdAt: serializeCacheDate(snapshot.createdAt),
    selectedChoices: snapshot.selectedChoices.map((choice) => ({
      ...choice,
      isCurrentlyAvailable: availableKeys.has(
        `${choice.groupKey}:${choice.choiceCode}`,
      ),
    })),
  };
}

const getCachedPublicConfiguration = unstable_cache(
  loadPublicConfiguration,
  ["public-configuration"],
  { revalidate: 3_600, tags: [CACHE_TAGS.publicModels] },
);

export async function getPublicConfiguration(reference?: string) {
  if (!reference || !isDatabaseConfigured()) return undefined;
  const configuration = await getCachedPublicConfiguration(reference);
  return configuration
    ? {
        ...configuration,
        createdAt: restoreCacheDate(configuration.createdAt),
      }
    : undefined;
}
