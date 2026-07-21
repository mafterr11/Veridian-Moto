import "server-only";

import { and, count, eq, inArray, ne } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import {
  accessories,
  accessoryCategories,
  accessoryCompatibility,
  accessoryMedia,
  categories,
  inventoryMedia,
  inventoryUnits,
  modelFeatures,
  modelMedia,
  motorcycleModels,
  optionChoices,
  optionGroups,
  optionRules,
} from "@/db/schema";
import { assertAdmin } from "@/data/auth/admin-session";
import {
  revalidateAccessoryCatalogue,
  revalidateModelCatalogue,
} from "@/data/revalidation";
import type {
  accessoryCategorySchema,
  accessoryMediaAssignmentSchema,
  accessorySchema,
  categorySchema,
  inventorySchema,
  inventoryMediaAssignmentSchema,
  modelFeatureSchema,
  modelMediaAssignmentSchema,
  modelSchema,
  optionChoiceSchema,
  optionGroupSchema,
  optionRuleSchema,
} from "@/domain/admin/schemas";
import {
  validateModelPublication,
  type PublicationIssue,
} from "@/domain/admin/publication";
import type { ConfiguratorCatalogue } from "@/domain/configurator/types";
import type { z } from "zod";

type CategoryInput = z.infer<typeof categorySchema>;
type ModelInput = z.infer<typeof modelSchema>;
type ModelFeatureInput = z.infer<typeof modelFeatureSchema>;
type OptionGroupInput = z.infer<typeof optionGroupSchema>;
type OptionChoiceInput = z.infer<typeof optionChoiceSchema>;
type OptionRuleInput = z.infer<typeof optionRuleSchema>;
type InventoryInput = z.infer<typeof inventorySchema>;
type AccessoryCategoryInput = z.infer<typeof accessoryCategorySchema>;
type AccessoryInput = z.infer<typeof accessorySchema>;
type ModelMediaAssignmentInput = z.infer<typeof modelMediaAssignmentSchema>;
type AccessoryMediaAssignmentInput = z.infer<
  typeof accessoryMediaAssignmentSchema
>;
type InventoryMediaAssignmentInput = z.infer<
  typeof inventoryMediaAssignmentSchema
>;

export class AdminMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminMutationError";
  }
}

export class PublicationValidationError extends AdminMutationError {
  constructor(public readonly issues: readonly PublicationIssue[]) {
    super(
      "Modelul nu poate fi publicat până când problemele semnalate sunt rezolvate.",
    );
    this.name = "PublicationValidationError";
  }
}

function databaseError(error: unknown, fallback: string): never {
  if (error instanceof AdminMutationError) throw error;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : undefined;

  if (code === "23505") {
    throw new AdminMutationError(
      "Există deja o înregistrare cu același slug, cod, SKU sau VIN.",
    );
  }
  if (code === "23503") {
    throw new AdminMutationError(
      "Înregistrarea este încă folosită și nu poate fi eliminată sau arhivată astfel.",
    );
  }

  throw new AdminMutationError(fallback);
}

async function modelSlug(id: string) {
  const [model] = await getDatabase()
    .select({ slug: motorcycleModels.slug })
    .from(motorcycleModels)
    .where(eq(motorcycleModels.id, id))
    .limit(1);
  return model?.slug;
}

async function markModelDraftIfPublished(
  tx: Parameters<
    Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]
  >[0],
  modelId: string,
) {
  await tx
    .update(motorcycleModels)
    .set({
      status: "draft",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(motorcycleModels.id, modelId),
        eq(motorcycleModels.status, "published"),
      ),
    );
}

export async function saveCategory(input: CategoryInput) {
  await assertAdmin();
  const db = getDatabase();

  try {
    if (input.id) {
      const [updated] = await db
        .update(categories)
        .set({
          name: input.name,
          slug: input.slug,
          description: input.description,
          sortOrder: input.sortOrder,
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, input.id))
        .returning({ id: categories.id });

      if (!updated) throw new AdminMutationError("Categoria nu mai există.");
    } else {
      await db.insert(categories).values(input);
    }
  } catch (error) {
    if (error instanceof AdminMutationError) throw error;
    databaseError(error, "Categoria nu a putut fi salvată.");
  }

  revalidateModelCatalogue();
}

export async function archiveCategory(id: string) {
  await assertAdmin();
  const db = getDatabase();
  const [usage] = await db
    .select({ value: count() })
    .from(motorcycleModels)
    .where(
      and(
        eq(motorcycleModels.categoryId, id),
        ne(motorcycleModels.status, "archived"),
      ),
    );

  if ((usage?.value ?? 0) > 0) {
    throw new AdminMutationError(
      "Arhivează sau mută mai întâi modelele active din această categorie.",
    );
  }

  await db
    .update(categories)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(categories.id, id));
  revalidateModelCatalogue();
}

export async function createModel(input: ModelInput) {
  await assertAdmin();

  try {
    const [created] = await getDatabase()
      .insert(motorcycleModels)
      .values({
        ...input,
        id: undefined,
        currency: "RON",
        status: "draft",
        additionalSpecs: {},
      })
      .returning({ id: motorcycleModels.id });
    return created.id;
  } catch (error) {
    databaseError(error, "Modelul nu a putut fi creat.");
  }
}

export async function updateModel(input: ModelInput & { id: string }) {
  await assertAdmin();

  try {
    const [updated] = await getDatabase()
      .update(motorcycleModels)
      .set({
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        tagline: input.tagline,
        summary: input.summary,
        description: input.description,
        modelYear: input.modelYear,
        basePriceMinor: input.basePriceMinor,
        displacementCc: input.displacementCc,
        powerHp: input.powerHp,
        torqueNm: input.torqueNm,
        wetWeightKg: input.wetWeightKg,
        seatHeightMm: input.seatHeightMm,
        featured: input.featured,
        configuratorEnabled: input.configuratorEnabled,
        status: "draft",
        updatedAt: new Date(),
      })
      .where(eq(motorcycleModels.id, input.id))
      .returning({ slug: motorcycleModels.slug });

    if (!updated) throw new AdminMutationError("Modelul nu mai există.");
    revalidateModelCatalogue(updated.slug);
  } catch (error) {
    if (error instanceof AdminMutationError) throw error;
    databaseError(error, "Modelul nu a putut fi actualizat.");
  }
}

export async function archiveModel(id: string) {
  await assertAdmin();
  const [updated] = await getDatabase()
    .update(motorcycleModels)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(motorcycleModels.id, id))
    .returning({ slug: motorcycleModels.slug });

  if (!updated) throw new AdminMutationError("Modelul nu mai există.");
  revalidateModelCatalogue(updated.slug);
}

export async function saveModelFeature(input: ModelFeatureInput) {
  await assertAdmin();
  const db = getDatabase();

  await db.transaction(async (tx) => {
    if (input.id) {
      await tx
        .update(modelFeatures)
        .set({
          groupName: input.groupName,
          label: input.label,
          value: input.value,
          isStandard: input.isStandard,
          sortOrder: input.sortOrder,
        })
        .where(
          and(
            eq(modelFeatures.id, input.id),
            eq(modelFeatures.modelId, input.modelId),
          ),
        );
    } else {
      await tx.insert(modelFeatures).values(input);
    }
    await markModelDraftIfPublished(tx, input.modelId);
  });

  revalidateModelCatalogue(await modelSlug(input.modelId));
}

export async function deleteModelFeature(id: string, modelId: string) {
  await assertAdmin();
  await getDatabase().transaction(async (tx) => {
    await tx
      .delete(modelFeatures)
      .where(and(eq(modelFeatures.id, id), eq(modelFeatures.modelId, modelId)));
    await markModelDraftIfPublished(tx, modelId);
  });
  revalidateModelCatalogue(await modelSlug(modelId));
}

export async function saveOptionGroup(input: OptionGroupInput) {
  await assertAdmin();

  try {
    await getDatabase().transaction(async (tx) => {
      if (input.id) {
        await tx
          .update(optionGroups)
          .set({
            key: input.key,
            name: input.name,
            description: input.description,
            selectionType: input.selectionType,
            required: input.required,
            minSelected: input.minSelected,
            maxSelected: input.maxSelected,
            sortOrder: input.sortOrder,
            status: input.status,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(optionGroups.id, input.id),
              eq(optionGroups.modelId, input.modelId),
            ),
          );
      } else {
        await tx.insert(optionGroups).values(input);
      }
      await markModelDraftIfPublished(tx, input.modelId);
    });
  } catch (error) {
    databaseError(error, "Grupul de opțiuni nu a putut fi salvat.");
  }

  revalidateModelCatalogue(await modelSlug(input.modelId));
}

export async function archiveOptionGroup(id: string, modelId: string) {
  await assertAdmin();
  await getDatabase().transaction(async (tx) => {
    await tx
      .update(optionGroups)
      .set({ status: "archived", updatedAt: new Date() })
      .where(and(eq(optionGroups.id, id), eq(optionGroups.modelId, modelId)));
    await markModelDraftIfPublished(tx, modelId);
  });
  revalidateModelCatalogue(await modelSlug(modelId));
}

export async function saveOptionChoice(input: OptionChoiceInput) {
  await assertAdmin();

  try {
    await getDatabase().transaction(async (tx) => {
      const [group] = await tx
        .select({ modelId: optionGroups.modelId })
        .from(optionGroups)
        .where(eq(optionGroups.id, input.groupId))
        .limit(1);
      if (!group || group.modelId !== input.modelId) {
        throw new AdminMutationError("Grupul selectat nu aparține modelului.");
      }

      if (input.id) {
        const [existing] = await tx
          .select({ modelId: optionGroups.modelId })
          .from(optionChoices)
          .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
          .where(eq(optionChoices.id, input.id))
          .limit(1);
        if (!existing || existing.modelId !== input.modelId) {
          throw new AdminMutationError(
            "Opțiunea nu există sau aparține altui model.",
          );
        }

        await tx
          .update(optionChoices)
          .set({
            groupId: input.groupId,
            code: input.code,
            name: input.name,
            description: input.description,
            priceDeltaMinor: input.priceDeltaMinor,
            swatchHex: input.swatchHex,
            mediaId: input.mediaId,
            accessoryId: input.accessoryId,
            isStandard: input.isStandard,
            sortOrder: input.sortOrder,
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(optionChoices.id, input.id));
      } else {
        await tx.insert(optionChoices).values({
          groupId: input.groupId,
          code: input.code,
          name: input.name,
          description: input.description,
          priceDeltaMinor: input.priceDeltaMinor,
          swatchHex: input.swatchHex,
          mediaId: input.mediaId,
          accessoryId: input.accessoryId,
          isStandard: input.isStandard,
          sortOrder: input.sortOrder,
          status: input.status,
        });
      }
      await markModelDraftIfPublished(tx, input.modelId);
    });
  } catch (error) {
    if (error instanceof AdminMutationError) throw error;
    databaseError(error, "Opțiunea nu a putut fi salvată.");
  }

  revalidateModelCatalogue(await modelSlug(input.modelId));
}

export async function archiveOptionChoice(id: string, modelId: string) {
  await assertAdmin();
  await getDatabase().transaction(async (tx) => {
    const [existing] = await tx
      .select({ modelId: optionGroups.modelId })
      .from(optionChoices)
      .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
      .where(eq(optionChoices.id, id))
      .limit(1);
    if (!existing || existing.modelId !== modelId) {
      throw new AdminMutationError(
        "Opțiunea nu există sau aparține altui model.",
      );
    }
    await tx
      .update(optionChoices)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(optionChoices.id, id));
    await markModelDraftIfPublished(tx, modelId);
  });
  revalidateModelCatalogue(await modelSlug(modelId));
}

export async function saveOptionRule(input: OptionRuleInput) {
  await assertAdmin();

  try {
    await getDatabase().transaction(async (tx) => {
      const choiceIds = [input.sourceChoiceId, input.targetChoiceId];
      const rows = await tx
        .select({ id: optionChoices.id, modelId: optionGroups.modelId })
        .from(optionChoices)
        .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
        .where(inArray(optionChoices.id, choiceIds));

      if (
        rows.length !== 2 ||
        rows.some((choice) => choice.modelId !== input.modelId)
      ) {
        throw new AdminMutationError(
          "Ambele opțiuni ale regulii trebuie să aparțină modelului.",
        );
      }

      await tx.insert(optionRules).values({
        sourceChoiceId: input.sourceChoiceId,
        targetChoiceId: input.targetChoiceId,
        ruleType: input.ruleType,
        explanation: input.explanation,
      });
      await markModelDraftIfPublished(tx, input.modelId);
    });
  } catch (error) {
    if (error instanceof AdminMutationError) throw error;
    databaseError(error, "Regula nu a putut fi salvată.");
  }

  revalidateModelCatalogue(await modelSlug(input.modelId));
}

export async function deleteOptionRule(id: string, modelId: string) {
  await assertAdmin();
  await getDatabase().transaction(async (tx) => {
    const [existing] = await tx
      .select({ modelId: optionGroups.modelId })
      .from(optionRules)
      .innerJoin(
        optionChoices,
        eq(optionRules.sourceChoiceId, optionChoices.id),
      )
      .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
      .where(eq(optionRules.id, id))
      .limit(1);
    if (!existing || existing.modelId !== modelId) {
      throw new AdminMutationError(
        "Regula nu există sau aparține altui model.",
      );
    }
    await tx.delete(optionRules).where(eq(optionRules.id, id));
    await markModelDraftIfPublished(tx, modelId);
  });
  revalidateModelCatalogue(await modelSlug(modelId));
}

export async function assignModelMedia(input: ModelMediaAssignmentInput) {
  await assertAdmin();
  await getDatabase().transaction(async (tx) => {
    await tx.insert(modelMedia).values(input).onConflictDoNothing();
    await markModelDraftIfPublished(tx, input.modelId);
  });
  revalidateModelCatalogue(await modelSlug(input.modelId));
}

export async function removeModelMedia(id: string, modelId: string) {
  await assertAdmin();
  await getDatabase().transaction(async (tx) => {
    await tx
      .delete(modelMedia)
      .where(and(eq(modelMedia.id, id), eq(modelMedia.modelId, modelId)));
    await markModelDraftIfPublished(tx, modelId);
  });
  revalidateModelCatalogue(await modelSlug(modelId));
}

export async function publishModel(id: string) {
  await assertAdmin();
  const db = getDatabase();
  let publishedSlug = "";

  await db.transaction(async (tx) => {
    const [model] = await tx
      .select({
        id: motorcycleModels.id,
        name: motorcycleModels.name,
        slug: motorcycleModels.slug,
        categoryId: motorcycleModels.categoryId,
        categoryStatus: categories.status,
        summary: motorcycleModels.summary,
        description: motorcycleModels.description,
        basePriceMinor: motorcycleModels.basePriceMinor,
        powerHp: motorcycleModels.powerHp,
        torqueNm: motorcycleModels.torqueNm,
        wetWeightKg: motorcycleModels.wetWeightKg,
        seatHeightMm: motorcycleModels.seatHeightMm,
        configuratorEnabled: motorcycleModels.configuratorEnabled,
      })
      .from(motorcycleModels)
      .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
      .where(eq(motorcycleModels.id, id))
      .limit(1);

    if (!model) throw new AdminMutationError("Modelul nu mai există.");

    const mediaRows = await tx
      .select({ role: modelMedia.role, viewAngle: modelMedia.viewAngle })
      .from(modelMedia)
      .where(eq(modelMedia.modelId, id));
    const groupRows = await tx
      .select()
      .from(optionGroups)
      .where(
        and(eq(optionGroups.modelId, id), ne(optionGroups.status, "archived")),
      );
    const choiceRows = await tx
      .select({
        id: optionChoices.id,
        groupId: optionChoices.groupId,
        name: optionChoices.name,
        description: optionChoices.description,
        priceDeltaMinor: optionChoices.priceDeltaMinor,
        isStandard: optionChoices.isStandard,
        status: optionChoices.status,
      })
      .from(optionChoices)
      .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
      .where(
        and(eq(optionGroups.modelId, id), ne(optionGroups.status, "archived")),
      );
    const ruleRows = await tx
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
      .where(eq(optionGroups.modelId, id));
    const featureRows = await tx
      .select({ label: modelFeatures.label })
      .from(modelFeatures)
      .where(
        and(eq(modelFeatures.modelId, id), eq(modelFeatures.isStandard, true)),
      );

    const requires = new Map<string, string[]>();
    const excludes = new Map<string, string[]>();
    for (const rule of ruleRows) {
      const target = rule.ruleType === "requires" ? requires : excludes;
      const values = target.get(rule.sourceChoiceId) ?? [];
      values.push(rule.targetChoiceId);
      target.set(rule.sourceChoiceId, values);
    }

    const configurator: ConfiguratorCatalogue = {
      modelId: model.id,
      modelName: model.name,
      currency: "RON",
      basePriceMinor: model.basePriceMinor,
      previewAngles: [
        ...new Set(mediaRows.map((media) => media.viewAngle).filter(Boolean)),
      ] as string[],
      standardEquipment: featureRows.map((feature) => feature.label),
      groups: groupRows
        .filter((group) => group.status === "published")
        .map((group) => ({
          id: group.id,
          name: group.name,
          shortName: group.name,
          description: group.description,
          mode: group.selectionType === "multiple" ? "multi" : "single",
          required: group.required,
          maxSelections: group.maxSelected,
          choices: choiceRows
            .filter((choice) => choice.groupId === group.id)
            .map((choice) => ({
              id: choice.id,
              name: choice.name,
              shortDescription: choice.description,
              priceDeltaMinor: choice.priceDeltaMinor,
              published: choice.status === "published",
              default: choice.isStandard,
              requires: requires.get(choice.id),
              excludes: excludes.get(choice.id),
            })),
        })),
    };
    const issues = validateModelPublication({
      ...model,
      categoryPublished: model.categoryStatus === "published",
      mediaRoles: mediaRows.map((media) => media.role),
      configuratorEnabled: model.configuratorEnabled,
      configurator,
      unpublishedGroupNames: groupRows
        .filter((group) => group.status === "draft")
        .map((group) => group.name),
    });

    if (issues.length > 0) {
      throw new PublicationValidationError(issues);
    }

    await tx
      .update(motorcycleModels)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(motorcycleModels.id, id));
    publishedSlug = model.slug;
  });

  revalidateModelCatalogue(publishedSlug);
}

export async function saveInventoryUnit(input: InventoryInput) {
  await assertAdmin();
  const affectedModelIds = new Set([input.modelId]);

  try {
    if (input.id) {
      const inventoryUnitId = input.id;
      await getDatabase().transaction(async (tx) => {
        const [existing] = await tx
          .select({ modelId: inventoryUnits.modelId })
          .from(inventoryUnits)
          .where(eq(inventoryUnits.id, inventoryUnitId))
          .limit(1);
        if (!existing) {
          throw new AdminMutationError("Unitatea de stoc nu mai există.");
        }
        affectedModelIds.add(existing.modelId);

        await tx
          .update(inventoryUnits)
          .set({
            modelId: input.modelId,
            stockCode: input.stockCode.toUpperCase(),
            vin: input.vin,
            condition: input.condition,
            year: input.year,
            mileageKm: input.mileageKm,
            colour: input.colour,
            priceMinor: input.priceMinor,
            status: input.status,
            isPublic: input.isPublic,
            privateNotes: input.privateNotes,
            updatedAt: new Date(),
          })
          .where(eq(inventoryUnits.id, inventoryUnitId));
      });
    } else {
      await getDatabase()
        .insert(inventoryUnits)
        .values({
          ...input,
          id: undefined,
          stockCode: input.stockCode.toUpperCase(),
          currency: "RON",
        });
    }
  } catch (error) {
    if (error instanceof AdminMutationError) throw error;
    databaseError(error, "Unitatea de stoc nu a putut fi salvată.");
  }

  for (const modelId of affectedModelIds) {
    revalidateModelCatalogue(await modelSlug(modelId));
  }
}

export async function archiveInventoryUnit(id: string) {
  await assertAdmin();
  const [unit] = await getDatabase()
    .update(inventoryUnits)
    .set({ status: "archived", isPublic: false, updatedAt: new Date() })
    .where(eq(inventoryUnits.id, id))
    .returning({ modelId: inventoryUnits.modelId });
  if (!unit) throw new AdminMutationError("Unitatea de stoc nu mai există.");
  revalidateModelCatalogue(await modelSlug(unit.modelId));
}

export async function assignInventoryMedia(
  input: InventoryMediaAssignmentInput,
) {
  await assertAdmin();
  const db = getDatabase();
  await db.insert(inventoryMedia).values(input).onConflictDoNothing();
  const [unit] = await db
    .select({ modelId: inventoryUnits.modelId })
    .from(inventoryUnits)
    .where(eq(inventoryUnits.id, input.inventoryUnitId))
    .limit(1);
  if (unit) revalidateModelCatalogue(await modelSlug(unit.modelId));
}

export async function removeInventoryMedia(
  id: string,
  inventoryUnitId: string,
) {
  await assertAdmin();
  const db = getDatabase();
  await db
    .delete(inventoryMedia)
    .where(
      and(
        eq(inventoryMedia.id, id),
        eq(inventoryMedia.inventoryUnitId, inventoryUnitId),
      ),
    );
  const [unit] = await db
    .select({ modelId: inventoryUnits.modelId })
    .from(inventoryUnits)
    .where(eq(inventoryUnits.id, inventoryUnitId))
    .limit(1);
  if (unit) revalidateModelCatalogue(await modelSlug(unit.modelId));
}

export async function saveAccessoryCategory(input: AccessoryCategoryInput) {
  await assertAdmin();

  try {
    if (input.id) {
      await getDatabase()
        .update(accessoryCategories)
        .set({ ...input, id: undefined, updatedAt: new Date() })
        .where(eq(accessoryCategories.id, input.id));
    } else {
      await getDatabase().insert(accessoryCategories).values(input);
    }
  } catch (error) {
    databaseError(error, "Categoria de accesorii nu a putut fi salvată.");
  }
  revalidateAccessoryCatalogue();
}

export async function archiveAccessoryCategory(id: string) {
  await assertAdmin();
  const [usage] = await getDatabase()
    .select({ value: count() })
    .from(accessories)
    .where(
      and(eq(accessories.categoryId, id), ne(accessories.status, "archived")),
    );
  if ((usage?.value ?? 0) > 0) {
    throw new AdminMutationError(
      "Arhivează sau mută accesoriile active înaintea categoriei.",
    );
  }
  await getDatabase()
    .update(accessoryCategories)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(accessoryCategories.id, id));
  revalidateAccessoryCatalogue();
}

export async function saveAccessory(input: AccessoryInput) {
  await assertAdmin();

  try {
    const storedId = await getDatabase().transaction(async (tx) => {
      if (input.status === "published") {
        const [category] = await tx
          .select({ status: accessoryCategories.status })
          .from(accessoryCategories)
          .where(eq(accessoryCategories.id, input.categoryId))
          .limit(1);
        if (category?.status !== "published") {
          throw new AdminMutationError(
            "Accesoriul poate fi publicat doar într-o categorie publicată.",
          );
        }
        if (!input.id) {
          throw new AdminMutationError(
            "Creează accesoriul ca draft, adaugă cel puțin o imagine, apoi publică-l.",
          );
        }
        const [mediaCount] = await tx
          .select({ value: count() })
          .from(accessoryMedia)
          .where(eq(accessoryMedia.accessoryId, input.id));
        if ((mediaCount?.value ?? 0) === 0) {
          throw new AdminMutationError(
            "Adaugă cel puțin o imagine înainte de publicarea accesoriului.",
          );
        }
      }

      let id = input.id;
      const values = {
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        sku: input.sku.toUpperCase(),
        summary: input.summary,
        description: input.description,
        priceMinor: input.priceMinor,
        currency: "RON" as const,
        stockState: input.stockState,
        internalQuantity: input.internalQuantity,
        featured: input.featured,
        status: input.status,
        updatedAt: new Date(),
      };

      if (id) {
        const [updated] = await tx
          .update(accessories)
          .set(values)
          .where(eq(accessories.id, id))
          .returning({ id: accessories.id });
        if (!updated) throw new AdminMutationError("Accesoriul nu mai există.");
      } else {
        const [created] = await tx
          .insert(accessories)
          .values(values)
          .returning({ id: accessories.id });
        id = created.id;
      }

      await tx
        .delete(accessoryCompatibility)
        .where(eq(accessoryCompatibility.accessoryId, id));
      if (input.compatibleModelIds.length > 0) {
        await tx.insert(accessoryCompatibility).values(
          input.compatibleModelIds.map((modelId) => ({
            accessoryId: id,
            modelId,
          })),
        );
      }
      return id;
    });

    revalidateAccessoryCatalogue(input.slug);
    return storedId;
  } catch (error) {
    databaseError(error, "Accesoriul nu a putut fi salvat.");
  }
}

export async function archiveAccessory(id: string) {
  await assertAdmin();
  const [item] = await getDatabase()
    .update(accessories)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(accessories.id, id))
    .returning({ slug: accessories.slug });
  if (item) revalidateAccessoryCatalogue(item.slug);
}

export async function assignAccessoryMedia(
  input: AccessoryMediaAssignmentInput,
) {
  await assertAdmin();
  const db = getDatabase();
  await db.insert(accessoryMedia).values(input).onConflictDoNothing();
  const [item] = await db
    .select({ slug: accessories.slug })
    .from(accessories)
    .where(eq(accessories.id, input.accessoryId))
    .limit(1);
  revalidateAccessoryCatalogue(item?.slug);
}

export async function removeAccessoryMedia(id: string, accessoryId: string) {
  await assertAdmin();
  const db = getDatabase();
  await db
    .delete(accessoryMedia)
    .where(
      and(
        eq(accessoryMedia.id, id),
        eq(accessoryMedia.accessoryId, accessoryId),
      ),
    );
  const [item] = await db
    .select({ slug: accessories.slug })
    .from(accessories)
    .where(eq(accessories.id, accessoryId))
    .limit(1);
  revalidateAccessoryCatalogue(item?.slug);
}
