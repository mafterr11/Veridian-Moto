import "server-only";

import { randomBytes } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  categories,
  configurationSnapshots,
  modelFeatures,
  motorcycleModels,
  optionChoices,
  optionGroups,
  optionRules,
} from "@/db/schema";
import {
  validateCatalogue,
  verifyClientTotal,
} from "@/domain/configurator/engine";
import { createPublicReference } from "@/domain/configurator/reference";
import type {
  ConfigurationState,
  ConfiguratorCatalogue,
} from "@/domain/configurator/types";

export class PublicConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicConfigurationError";
  }
}

async function loadAuthoritativeCatalogue(slug: string) {
  if (!isDatabaseConfigured()) {
    throw new PublicConfigurationError(
      "Salvarea configurațiilor necesită conectarea bazei de date.",
    );
  }

  const db = getDatabase();
  const [model] = await db
    .select({
      id: motorcycleModels.id,
      slug: motorcycleModels.slug,
      name: motorcycleModels.name,
      modelYear: motorcycleModels.modelYear,
      basePriceMinor: motorcycleModels.basePriceMinor,
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
  if (!model) {
    throw new PublicConfigurationError(
      "Modelul nu mai este disponibil în configurator.",
    );
  }

  const groups = await db
    .select()
    .from(optionGroups)
    .where(
      and(
        eq(optionGroups.modelId, model.id),
        eq(optionGroups.status, "published"),
      ),
    )
    .orderBy(asc(optionGroups.sortOrder));
  const choices = await db
    .select()
    .from(optionChoices)
    .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
    .where(
      and(
        eq(optionGroups.modelId, model.id),
        eq(optionGroups.status, "published"),
        eq(optionChoices.status, "published"),
      ),
    )
    .orderBy(asc(optionChoices.sortOrder));
  const rules = await db
    .select({
      sourceChoiceId: optionRules.sourceChoiceId,
      targetChoiceId: optionRules.targetChoiceId,
      ruleType: optionRules.ruleType,
    })
    .from(optionRules)
    .innerJoin(optionChoices, eq(optionRules.sourceChoiceId, optionChoices.id))
    .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
    .where(eq(optionGroups.modelId, model.id));
  const features = await db
    .select({ label: modelFeatures.label, value: modelFeatures.value })
    .from(modelFeatures)
    .where(
      and(
        eq(modelFeatures.modelId, model.id),
        eq(modelFeatures.isStandard, true),
      ),
    )
    .orderBy(asc(modelFeatures.sortOrder));

  const requires = new Map<string, string[]>();
  const excludes = new Map<string, string[]>();
  for (const rule of rules) {
    const target = rule.ruleType === "requires" ? requires : excludes;
    const list = target.get(rule.sourceChoiceId) ?? [];
    list.push(rule.targetChoiceId);
    target.set(rule.sourceChoiceId, list);
  }

  const catalogue: ConfiguratorCatalogue = {
    modelId: model.id,
    modelName: model.name,
    currency: "RON",
    basePriceMinor: model.basePriceMinor,
    previewAngles: ["front-three-quarter"],
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
        .filter(({ option_choices: choice }) => choice.groupId === group.id)
        .map(({ option_choices: choice }) => ({
          id: choice.id,
          code: choice.code,
          name: choice.name,
          shortDescription: choice.description,
          priceDeltaMinor: choice.priceDeltaMinor,
          published: true,
          default: choice.isStandard,
          requires: requires.get(choice.id),
          excludes: excludes.get(choice.id),
        })),
    })),
  };

  const catalogueIssues = validateCatalogue(catalogue);
  if (catalogueIssues.length) {
    throw new PublicConfigurationError(
      "Catalogul configuratorului a devenit invalid. Reîncarcă pagina sau contactează-ne.",
    );
  }

  return { model, catalogue };
}

export async function saveConfigurationSnapshot({
  modelSlug,
  state,
  clientTotalMinor,
}: {
  modelSlug: string;
  state: ConfigurationState;
  clientTotalMinor: number;
}) {
  const { model, catalogue } = await loadAuthoritativeCatalogue(modelSlug);
  const verification = verifyClientTotal(catalogue, state, clientTotalMinor);
  if (verification.issues.length || !verification.matches) {
    throw new PublicConfigurationError(
      "Configurația sau prețul s-au schimbat. Reîncarcă pagina și verifică selecțiile.",
    );
  }

  const groups = new Map(catalogue.groups.map((group) => [group.id, group]));
  const choices = new Map(
    catalogue.groups.flatMap((group) =>
      group.choices.map((choice) => [choice.id, choice] as const),
    ),
  );
  const selectedChoices = verification.selectedChoices.map((selection) => {
    const group = groups.get(selection.groupId);
    const choice = choices.get(selection.choiceId);
    if (!group || !choice) {
      throw new PublicConfigurationError("Selecția nu mai este disponibilă.");
    }
    return {
      groupKey: group.key ?? group.id,
      groupName: group.name,
      choiceCode: choice.code ?? choice.id,
      choiceName: choice.name,
      priceDeltaMinor: choice.priceDeltaMinor,
    };
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reference = createPublicReference(randomBytes(12));
    try {
      await getDatabase().transaction(async (tx) => {
        await tx.insert(configurationSnapshots).values({
          publicReference: reference,
          modelId: model.id,
          modelIdentity: {
            slug: model.slug,
            name: model.name,
            modelYear: model.modelYear,
          },
          basePriceMinor: catalogue.basePriceMinor,
          selectedChoices,
          totalPriceMinor: verification.totalMinor,
          currency: catalogue.currency,
        });
      });
      return reference;
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : undefined;
      if (code !== "23505" || attempt === 2) {
        throw new PublicConfigurationError(
          "Configurația nu a putut fi salvată. Încearcă din nou.",
        );
      }
    }
  }

  throw new PublicConfigurationError("Referința nu a putut fi generată.");
}
