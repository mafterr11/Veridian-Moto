import "server-only";

import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  categories,
  configurationSnapshots,
  motorcycleModels,
  optionChoices,
  optionGroups,
} from "@/db/schema";
import { modelCacheTag } from "@/data/cache-tags";

export async function getPublicConfiguration(reference: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`public:configuration:${reference}`);

  if (!isDatabaseConfigured()) return undefined;
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

  cacheTag(modelCacheTag(snapshot.modelIdentity.slug));
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
    createdAt: snapshot.createdAt,
    selectedChoices: snapshot.selectedChoices.map((choice) => ({
      ...choice,
      isCurrentlyAvailable: availableKeys.has(
        `${choice.groupKey}:${choice.choiceCode}`,
      ),
    })),
  };
}
