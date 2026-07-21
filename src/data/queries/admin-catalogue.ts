import "server-only";

import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import {
  accessories,
  accessoryCategories,
  accessoryCompatibility,
  accessoryMedia,
  adminProfiles,
  categories,
  discoverPosts,
  inventoryUnits,
  inventoryMedia,
  inquiries,
  mediaAssets,
  modelFeatures,
  modelMedia,
  motorcycleModels,
  optionChoices,
  optionGroups,
  optionRules,
} from "@/db/schema";
import {
  assertAdmin,
  isAdminInfrastructureConfigured,
} from "@/data/auth/admin-session";

async function canReadAdminData() {
  if (!isAdminInfrastructureConfigured()) {
    return false;
  }

  await assertAdmin();
  return true;
}

export async function getAdminDashboardCounts() {
  if (!(await canReadAdminData())) {
    return {
      models: 0,
      publishedModels: 0,
      publicInventory: 0,
      accessories: 0,
      newInquiries: 0,
      publishedArticles: 0,
    };
  }

  const db = getDatabase();
  const [
    modelCount,
    publishedCount,
    inventoryCount,
    accessoryCount,
    inquiryCount,
    articleCount,
  ] = await Promise.all([
    db.select({ value: count() }).from(motorcycleModels),
    db
      .select({ value: count() })
      .from(motorcycleModels)
      .where(eq(motorcycleModels.status, "published")),
    db
      .select({ value: count() })
      .from(inventoryUnits)
      .where(eq(inventoryUnits.isPublic, true)),
    db.select({ value: count() }).from(accessories),
    db
      .select({ value: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "new")),
    db
      .select({ value: count() })
      .from(discoverPosts)
      .where(eq(discoverPosts.status, "published")),
  ]);

  return {
    models: modelCount[0]?.value ?? 0,
    publishedModels: publishedCount[0]?.value ?? 0,
    publicInventory: inventoryCount[0]?.value ?? 0,
    accessories: accessoryCount[0]?.value ?? 0,
    newInquiries: inquiryCount[0]?.value ?? 0,
    publishedArticles: articleCount[0]?.value ?? 0,
  };
}

export async function getAdminCategories() {
  if (!(await canReadAdminData())) return [];

  return getDatabase()
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      sortOrder: categories.sortOrder,
      status: categories.status,
      modelCount: count(motorcycleModels.id),
    })
    .from(categories)
    .leftJoin(motorcycleModels, eq(motorcycleModels.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getAdminModelList() {
  if (!(await canReadAdminData())) return [];

  return getDatabase()
    .select({
      id: motorcycleModels.id,
      name: motorcycleModels.name,
      slug: motorcycleModels.slug,
      modelYear: motorcycleModels.modelYear,
      basePriceMinor: motorcycleModels.basePriceMinor,
      currency: motorcycleModels.currency,
      status: motorcycleModels.status,
      featured: motorcycleModels.featured,
      configuratorEnabled: motorcycleModels.configuratorEnabled,
      categoryName: categories.name,
      publicInventory:
        sql<number>`count(${inventoryUnits.id}) filter (where ${inventoryUnits.isPublic} = true)`.mapWith(
          Number,
        ),
      updatedAt: motorcycleModels.updatedAt,
    })
    .from(motorcycleModels)
    .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
    .leftJoin(inventoryUnits, eq(inventoryUnits.modelId, motorcycleModels.id))
    .groupBy(motorcycleModels.id, categories.name)
    .orderBy(desc(motorcycleModels.updatedAt));
}

export async function getAdminModelEditor(id: string) {
  if (!(await canReadAdminData())) return null;

  const db = getDatabase();
  const [model] = await db
    .select({
      id: motorcycleModels.id,
      categoryId: motorcycleModels.categoryId,
      categoryName: categories.name,
      name: motorcycleModels.name,
      slug: motorcycleModels.slug,
      tagline: motorcycleModels.tagline,
      summary: motorcycleModels.summary,
      description: motorcycleModels.description,
      modelYear: motorcycleModels.modelYear,
      basePriceMinor: motorcycleModels.basePriceMinor,
      currency: motorcycleModels.currency,
      displacementCc: motorcycleModels.displacementCc,
      powerHp: motorcycleModels.powerHp,
      torqueNm: motorcycleModels.torqueNm,
      wetWeightKg: motorcycleModels.wetWeightKg,
      seatHeightMm: motorcycleModels.seatHeightMm,
      featured: motorcycleModels.featured,
      configuratorEnabled: motorcycleModels.configuratorEnabled,
      status: motorcycleModels.status,
      updatedAt: motorcycleModels.updatedAt,
    })
    .from(motorcycleModels)
    .innerJoin(categories, eq(motorcycleModels.categoryId, categories.id))
    .where(eq(motorcycleModels.id, id))
    .limit(1);

  if (!model) return null;

  const [
    categoryRows,
    featureRows,
    mediaRows,
    allMedia,
    groupRows,
    choiceRows,
    ruleRows,
    accessoryRows,
  ] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        status: categories.status,
      })
      .from(categories)
      .where(sql`${categories.status} <> 'archived'`)
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select()
      .from(modelFeatures)
      .where(eq(modelFeatures.modelId, id))
      .orderBy(asc(modelFeatures.sortOrder)),
    db
      .select({
        id: modelMedia.id,
        mediaId: mediaAssets.id,
        role: modelMedia.role,
        viewAngle: modelMedia.viewAngle,
        sortOrder: modelMedia.sortOrder,
        storagePath: mediaAssets.storagePath,
        altText: mediaAssets.altText,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(modelMedia)
      .innerJoin(mediaAssets, eq(modelMedia.mediaId, mediaAssets.id))
      .where(eq(modelMedia.modelId, id))
      .orderBy(asc(modelMedia.role), asc(modelMedia.sortOrder)),
    db
      .select({
        id: mediaAssets.id,
        storagePath: mediaAssets.storagePath,
        altText: mediaAssets.altText,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt))
      .limit(100),
    db
      .select()
      .from(optionGroups)
      .where(eq(optionGroups.modelId, id))
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
        mediaId: optionChoices.mediaId,
        accessoryId: optionChoices.accessoryId,
        isStandard: optionChoices.isStandard,
        sortOrder: optionChoices.sortOrder,
        status: optionChoices.status,
      })
      .from(optionChoices)
      .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
      .where(eq(optionGroups.modelId, id))
      .orderBy(asc(optionChoices.sortOrder)),
    db
      .select({
        id: optionRules.id,
        sourceChoiceId: optionRules.sourceChoiceId,
        targetChoiceId: optionRules.targetChoiceId,
        ruleType: optionRules.ruleType,
        explanation: optionRules.explanation,
      })
      .from(optionRules)
      .innerJoin(
        optionChoices,
        eq(optionRules.sourceChoiceId, optionChoices.id),
      )
      .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
      .where(eq(optionGroups.modelId, id)),
    db
      .select({
        id: accessories.id,
        name: accessories.name,
        sku: accessories.sku,
      })
      .from(accessories)
      .where(sql`${accessories.status} <> 'archived'`)
      .orderBy(asc(accessories.name)),
  ]);

  return {
    model,
    categories: categoryRows,
    features: featureRows,
    media: mediaRows,
    mediaLibrary: allMedia,
    groups: groupRows,
    choices: choiceRows,
    rules: ruleRows,
    accessories: accessoryRows,
  };
}

export async function getAdminModelSelectOptions() {
  if (!(await canReadAdminData())) return [];

  return getDatabase()
    .select({
      id: motorcycleModels.id,
      name: motorcycleModels.name,
      slug: motorcycleModels.slug,
      status: motorcycleModels.status,
      basePriceMinor: motorcycleModels.basePriceMinor,
    })
    .from(motorcycleModels)
    .where(sql`${motorcycleModels.status} <> 'archived'`)
    .orderBy(asc(motorcycleModels.name));
}

export async function getAdminInventoryWorkspace() {
  if (!(await canReadAdminData())) {
    return { models: [], units: [], media: [], mediaLibrary: [] };
  }

  const db = getDatabase();
  const [models, units, attachedMedia, mediaLibrary] = await Promise.all([
    db
      .select({
        id: motorcycleModels.id,
        name: motorcycleModels.name,
        basePriceMinor: motorcycleModels.basePriceMinor,
      })
      .from(motorcycleModels)
      .where(sql`${motorcycleModels.status} <> 'archived'`)
      .orderBy(asc(motorcycleModels.name)),
    db
      .select({
        id: inventoryUnits.id,
        modelId: inventoryUnits.modelId,
        modelName: motorcycleModels.name,
        stockCode: inventoryUnits.stockCode,
        vin: inventoryUnits.vin,
        condition: inventoryUnits.condition,
        year: inventoryUnits.year,
        mileageKm: inventoryUnits.mileageKm,
        colour: inventoryUnits.colour,
        priceMinor: inventoryUnits.priceMinor,
        currency: inventoryUnits.currency,
        status: inventoryUnits.status,
        isPublic: inventoryUnits.isPublic,
        privateNotes: inventoryUnits.privateNotes,
        updatedAt: inventoryUnits.updatedAt,
      })
      .from(inventoryUnits)
      .innerJoin(
        motorcycleModels,
        eq(inventoryUnits.modelId, motorcycleModels.id),
      )
      .orderBy(desc(inventoryUnits.updatedAt)),
    db
      .select({
        id: inventoryMedia.id,
        inventoryUnitId: inventoryMedia.inventoryUnitId,
        mediaId: mediaAssets.id,
        storagePath: mediaAssets.storagePath,
        altText: mediaAssets.altText,
        sortOrder: inventoryMedia.sortOrder,
      })
      .from(inventoryMedia)
      .innerJoin(mediaAssets, eq(inventoryMedia.mediaId, mediaAssets.id))
      .orderBy(asc(inventoryMedia.sortOrder)),
    db
      .select({ id: mediaAssets.id, altText: mediaAssets.altText })
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt))
      .limit(100),
  ]);

  return { models, units, media: attachedMedia, mediaLibrary };
}

export async function getAdminAccessoryWorkspace() {
  if (!(await canReadAdminData())) {
    return {
      categories: [],
      models: [],
      accessories: [],
      compatibility: [],
      media: [],
      mediaLibrary: [],
    };
  }

  const db = getDatabase();
  const [
    categoryRows,
    modelRows,
    accessoryRows,
    compatibilityRows,
    attachedMedia,
    mediaLibrary,
  ] = await Promise.all([
    db
      .select()
      .from(accessoryCategories)
      .orderBy(asc(accessoryCategories.sortOrder)),
    db
      .select({ id: motorcycleModels.id, name: motorcycleModels.name })
      .from(motorcycleModels)
      .where(sql`${motorcycleModels.status} <> 'archived'`)
      .orderBy(asc(motorcycleModels.name)),
    db
      .select({
        id: accessories.id,
        categoryId: accessories.categoryId,
        categoryName: accessoryCategories.name,
        name: accessories.name,
        slug: accessories.slug,
        sku: accessories.sku,
        summary: accessories.summary,
        description: accessories.description,
        priceMinor: accessories.priceMinor,
        currency: accessories.currency,
        stockState: accessories.stockState,
        internalQuantity: accessories.internalQuantity,
        featured: accessories.featured,
        status: accessories.status,
        updatedAt: accessories.updatedAt,
      })
      .from(accessories)
      .innerJoin(
        accessoryCategories,
        eq(accessories.categoryId, accessoryCategories.id),
      )
      .orderBy(desc(accessories.updatedAt)),
    db.select().from(accessoryCompatibility),
    db
      .select({
        id: accessoryMedia.id,
        accessoryId: accessoryMedia.accessoryId,
        mediaId: mediaAssets.id,
        storagePath: mediaAssets.storagePath,
        altText: mediaAssets.altText,
        sortOrder: accessoryMedia.sortOrder,
      })
      .from(accessoryMedia)
      .innerJoin(mediaAssets, eq(accessoryMedia.mediaId, mediaAssets.id))
      .orderBy(asc(accessoryMedia.sortOrder)),
    db
      .select({ id: mediaAssets.id, altText: mediaAssets.altText })
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt))
      .limit(100),
  ]);

  return {
    categories: categoryRows,
    models: modelRows,
    accessories: accessoryRows,
    compatibility: compatibilityRows,
    media: attachedMedia,
    mediaLibrary,
  };
}

export async function getAdminProfileCount() {
  if (!(await canReadAdminData())) return 0;
  const [result] = await getDatabase()
    .select({ value: count() })
    .from(adminProfiles)
    .where(
      and(eq(adminProfiles.role, "admin"), eq(adminProfiles.isActive, true)),
    );
  return result?.value ?? 0;
}

export async function getChoicesForModels(modelIds: readonly string[]) {
  if (!(await canReadAdminData()) || modelIds.length === 0) return [];

  return getDatabase()
    .select({
      id: optionChoices.id,
      name: optionChoices.name,
      groupId: optionChoices.groupId,
    })
    .from(optionChoices)
    .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
    .where(inArray(optionGroups.modelId, [...modelIds]));
}
