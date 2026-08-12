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
  const [counts] = await db.execute<{
    models: number;
    publishedModels: number;
    publicInventory: number;
    accessories: number;
    newInquiries: number;
    publishedArticles: number;
  }>(sql`
    select
      (select count(*)::int from ${motorcycleModels}) as "models",
      (select count(*)::int from ${motorcycleModels} where ${motorcycleModels.status} = 'published') as "publishedModels",
      (select count(*)::int from ${inventoryUnits} where ${inventoryUnits.isPublic} = true) as "publicInventory",
      (select count(*)::int from ${accessories}) as "accessories",
      (select count(*)::int from ${inquiries} where ${inquiries.status} = 'new') as "newInquiries",
      (select count(*)::int from ${discoverPosts} where ${discoverPosts.status} = 'published') as "publishedArticles"
  `);

  return {
    models: counts?.models ?? 0,
    publishedModels: counts?.publishedModels ?? 0,
    publicInventory: counts?.publicInventory ?? 0,
    accessories: counts?.accessories ?? 0,
    newInquiries: counts?.newInquiries ?? 0,
    publishedArticles: counts?.publishedArticles ?? 0,
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

  // The runtime pool intentionally owns one connection. Run related reads in
  // sequence so a failed first query does not leave seven queued statements
  // occupying that connection after the response has already failed.
  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      status: categories.status,
    })
    .from(categories)
    .where(sql`${categories.status} <> 'archived'`)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  const featureRows = await db
    .select()
    .from(modelFeatures)
    .where(eq(modelFeatures.modelId, id))
    .orderBy(asc(modelFeatures.sortOrder));
  const mediaRows = await db
    .select({
      id: modelMedia.id,
      mediaId: mediaAssets.id,
      role: modelMedia.role,
      optionChoiceId: modelMedia.optionChoiceId,
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
    .orderBy(asc(modelMedia.role), asc(modelMedia.sortOrder));
  const allMedia = await db
    .select({
      id: mediaAssets.id,
      storagePath: mediaAssets.storagePath,
      altText: mediaAssets.altText,
      width: mediaAssets.width,
      height: mediaAssets.height,
    })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(100);
  const groupRows = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.modelId, id))
    .orderBy(asc(optionGroups.sortOrder));
  const choiceRows = await db
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
      groupStatus: optionGroups.status,
    })
    .from(optionChoices)
    .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
    .where(eq(optionGroups.modelId, id))
    .orderBy(asc(optionChoices.sortOrder));
  const ruleRows = await db
    .select({
      id: optionRules.id,
      sourceChoiceId: optionRules.sourceChoiceId,
      targetChoiceId: optionRules.targetChoiceId,
      ruleType: optionRules.ruleType,
      explanation: optionRules.explanation,
    })
    .from(optionRules)
    .innerJoin(optionChoices, eq(optionRules.sourceChoiceId, optionChoices.id))
    .innerJoin(optionGroups, eq(optionChoices.groupId, optionGroups.id))
    .where(eq(optionGroups.modelId, id));
  const accessoryRows = await db
    .select({
      id: accessories.id,
      name: accessories.name,
      sku: accessories.sku,
    })
    .from(accessories)
    .where(sql`${accessories.status} <> 'archived'`)
    .orderBy(asc(accessories.name));

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
  const models = await db
    .select({
      id: motorcycleModels.id,
      name: motorcycleModels.name,
      basePriceMinor: motorcycleModels.basePriceMinor,
    })
    .from(motorcycleModels)
    .where(sql`${motorcycleModels.status} <> 'archived'`)
    .orderBy(asc(motorcycleModels.name));
  const units = await db
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
    .orderBy(desc(inventoryUnits.updatedAt));
  const attachedMedia = await db
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
    .orderBy(asc(inventoryMedia.sortOrder));
  const mediaLibrary = await db
    .select({ id: mediaAssets.id, altText: mediaAssets.altText })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(100);

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
  const categoryRows = await db
    .select()
    .from(accessoryCategories)
    .orderBy(asc(accessoryCategories.sortOrder));
  const modelRows = await db
    .select({ id: motorcycleModels.id, name: motorcycleModels.name })
    .from(motorcycleModels)
    .where(sql`${motorcycleModels.status} <> 'archived'`)
    .orderBy(asc(motorcycleModels.name));
  const accessoryRows = await db
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
    .orderBy(desc(accessories.updatedAt));
  const compatibilityRows = await db.select().from(accessoryCompatibility);
  const attachedMedia = await db
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
    .orderBy(asc(accessoryMedia.sortOrder));
  const mediaLibrary = await db
    .select({ id: mediaAssets.id, altText: mediaAssets.altText })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(100);

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
