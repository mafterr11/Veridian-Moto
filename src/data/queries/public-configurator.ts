import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  categories,
  mediaAssets,
  modelFeatures,
  modelMedia,
  motorcycleModels,
  optionChoices,
  optionGroups,
  optionRules,
} from "@/db/schema";
import { CACHE_TAGS, modelCacheTag } from "@/data/cache-tags";
import { getPublicModels } from "@/data/queries/public-models";
import { getDemoConfigurator } from "@/domain/configurator/demo-catalogues";
import type { ConfiguratorCatalogue } from "@/domain/configurator/types";

export type PublicConfiguratorDTO = {
  catalogue: ConfiguratorCatalogue;
  model: {
    slug: string;
    category: string;
    powerHp: number;
    torqueNm: number;
    wetWeightKg: number;
    image: string;
    imageAlt: string;
  };
};

export async function getConfigurableModels() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicCatalogue, CACHE_TAGS.publicModels);

  const models = await getPublicModels();
  if (!isDatabaseConfigured()) return models;

  const enabled = await getDatabase()
    .select({ slug: motorcycleModels.slug })
    .from(motorcycleModels)
    .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
    .where(
      and(
        eq(motorcycleModels.status, "published"),
        eq(categories.status, "published"),
        eq(motorcycleModels.configuratorEnabled, true),
      ),
    );
  const slugs = new Set(enabled.map((model) => model.slug));
  return models.filter((model) => slugs.has(model.slug));
}

export async function getPublicConfigurator(
  slug?: string,
): Promise<PublicConfiguratorDTO | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.publicCatalogue, CACHE_TAGS.publicModels);

  if (!slug) return undefined;

  cacheTag(modelCacheTag(slug));

  const publicModels = await getPublicModels();
  const publicModel = publicModels.find((model) => model.slug === slug);
  if (!publicModel) return undefined;

  if (!isDatabaseConfigured()) {
    const catalogue = getDemoConfigurator(slug);
    if (!catalogue) return undefined;
    return {
      catalogue,
      model: {
        slug,
        category: publicModel.category,
        powerHp: publicModel.powerHp,
        torqueNm: publicModel.torqueNm,
        wetWeightKg: publicModel.wetWeightKg,
        image: publicModel.image,
        imageAlt: publicModel.imageAlt,
      },
    };
  }

  const db = getDatabase();
  const [model] = await db
    .select({
      id: motorcycleModels.id,
      slug: motorcycleModels.slug,
      name: motorcycleModels.name,
      category: categories.name,
      basePriceMinor: motorcycleModels.basePriceMinor,
      powerHp: motorcycleModels.powerHp,
      torqueNm: motorcycleModels.torqueNm,
      wetWeightKg: motorcycleModels.wetWeightKg,
    })
    .from(motorcycleModels)
    .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
    .where(
      and(
        eq(motorcycleModels.slug, slug),
        eq(motorcycleModels.status, "published"),
        eq(categories.status, "published"),
        eq(motorcycleModels.configuratorEnabled, true),
      ),
    )
    .limit(1);
  if (!model) return undefined;

  const [groups, choices, rules, features, media] = await Promise.all([
    db
      .select()
      .from(optionGroups)
      .where(
        and(
          eq(optionGroups.modelId, model.id),
          eq(optionGroups.status, "published"),
        ),
      )
      .orderBy(asc(optionGroups.sortOrder)),
    db
      .select({
        id: optionChoices.id,
        groupId: optionChoices.groupId,
        code: optionChoices.code,
        name: optionChoices.name,
        description: optionChoices.description,
        priceDeltaMinor: optionChoices.priceDeltaMinor,
        swatchHex: optionChoices.swatchHex,
        isStandard: optionChoices.isStandard,
        image: mediaAssets.storagePath,
      })
      .from(optionChoices)
      .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
      .leftJoin(mediaAssets, eq(optionChoices.mediaId, mediaAssets.id))
      .where(
        and(
          eq(optionGroups.modelId, model.id),
          eq(optionGroups.status, "published"),
          eq(optionChoices.status, "published"),
        ),
      )
      .orderBy(asc(optionChoices.sortOrder)),
    db
      .select({
        sourceChoiceId: optionRules.sourceChoiceId,
        targetChoiceId: optionRules.targetChoiceId,
        ruleType: optionRules.ruleType,
      })
      .from(optionRules)
      .innerJoin(
        optionChoices,
        eq(optionRules.sourceChoiceId, optionChoices.id),
      )
      .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
      .where(eq(optionGroups.modelId, model.id)),
    db
      .select({ label: modelFeatures.label, value: modelFeatures.value })
      .from(modelFeatures)
      .where(
        and(
          eq(modelFeatures.modelId, model.id),
          eq(modelFeatures.isStandard, true),
        ),
      )
      .orderBy(asc(modelFeatures.sortOrder)),
    db
      .select({
        path: mediaAssets.storagePath,
        alt: mediaAssets.altText,
        role: modelMedia.role,
        viewAngle: modelMedia.viewAngle,
        sortOrder: modelMedia.sortOrder,
      })
      .from(modelMedia)
      .innerJoin(mediaAssets, eq(modelMedia.mediaId, mediaAssets.id))
      .where(eq(modelMedia.modelId, model.id))
      .orderBy(asc(modelMedia.sortOrder)),
  ]);

  const choiceIds = new Set(choices.map((choice) => choice.id));
  const requires = new Map<string, string[]>();
  const excludes = new Map<string, string[]>();
  for (const rule of rules) {
    if (!choiceIds.has(rule.targetChoiceId)) continue;
    const target = rule.ruleType === "requires" ? requires : excludes;
    const values = target.get(rule.sourceChoiceId) ?? [];
    values.push(rule.targetChoiceId);
    target.set(rule.sourceChoiceId, values);
  }

  const catalogue: ConfiguratorCatalogue = {
    modelId: model.id,
    modelName: model.name,
    currency: "RON",
    basePriceMinor: model.basePriceMinor,
    previewAngles: [
      ...new Set(
        media
          .map((item) => item.viewAngle)
          .filter((value): value is string => Boolean(value)),
      ),
    ],
    standardEquipment: features.map((feature) =>
      feature.value ? `${feature.label}: ${feature.value}` : feature.label,
    ),
    groups: groups.map((group) => ({
      id: group.id,
      key: group.key,
      name: group.name,
      shortName: group.name,
      description: group.description,
      mode: group.selectionType === "multiple" ? "multi" : "single",
      required: group.required,
      maxSelections: group.maxSelected,
      choices: choices
        .filter((choice) => choice.groupId === group.id)
        .map((choice) => ({
          id: choice.id,
          code: choice.code,
          name: choice.name,
          shortDescription: choice.description,
          priceDeltaMinor: choice.priceDeltaMinor,
          published: true,
          default: choice.isStandard,
          requires: requires.get(choice.id),
          excludes: excludes.get(choice.id),
          image: choice.image ?? undefined,
          swatch: choice.swatchHex ?? undefined,
          badge: choice.isStandard ? "Inclus" : undefined,
        })),
    })),
  };
  const hero =
    media.find((item) => item.role === "configurator_base") ??
    media.find((item) => item.role === "hero") ??
    media.find((item) => item.role === "card");

  return {
    catalogue,
    model: {
      slug: model.slug,
      category: model.category,
      powerHp: model.powerHp,
      torqueNm: model.torqueNm,
      wetWeightKg: model.wetWeightKg,
      image: hero?.path ?? publicModel.image,
      imageAlt: hero?.alt ?? publicModel.imageAlt,
    },
  };
}
