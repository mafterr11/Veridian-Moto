import { config as loadEnv } from "dotenv";
import { and, eq, like } from "drizzle-orm";

import { createDatabaseConnection } from "@/db/connection";
import {
  accessories,
  accessoryCategories,
  accessoryCompatibility,
  accessoryMedia,
  categories,
  discoverCategories,
  discoverPosts,
  inventoryUnits,
  mediaAssets,
  modelFeatures,
  modelMedia,
  motorcycleModels,
  optionChoices,
  optionGroups,
  optionRules,
  siteSettings,
} from "@/db/schema";
import { demoAccessories } from "@/data/accessories";
import {
  demoModelMetadata,
  motorcycles,
  type ModelCategory,
} from "@/data/catalogue";
import { demoConfiguratorCatalogues } from "@/domain/configurator/demo-catalogues";
import { articles } from "@/data/editorial";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const categorySeed: Record<
  ModelCategory,
  { slug: string; description: string; sortOrder: number }
> = {
  Adventure: {
    slug: "adventure",
    description:
      "Motociclete pentru asfalt, drum forestier și călătorii lungi.",
    sortOrder: 0,
  },
  Sport: {
    slug: "sport",
    description: "Precizie, control și performanță utilizabilă pe șosea.",
    sortOrder: 1,
  },
  Roadster: {
    slug: "roadster",
    description: "Motociclete directe și agile pentru fiecare zi.",
    sortOrder: 2,
  },
  Touring: {
    slug: "touring",
    description: "Confort, protecție și autonomie pentru distanțe mari.",
    sortOrder: 3,
  },
  Heritage: {
    slug: "heritage",
    description:
      "Forme clasice și mecanică modernă, fără nostalgie artificială.",
    sortOrder: 4,
  },
  "Urban Electric": {
    slug: "urban-electric",
    description: "Mobilitate electrică practică pentru oraș și împrejurimi.",
    sortOrder: 5,
  },
};

function imageDimensions(slug: string) {
  return slug === "terran-900-rally"
    ? { width: 1672, height: 941 }
    : { width: 1448, height: 1086 };
}

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Copy .env.example to .env.local and configure Supabase first.",
    );
  }

  const connection = createDatabaseConnection(databaseUrl);

  try {
    await connection.db.transaction(async (tx) => {
      const categoryIds = new Map<ModelCategory, string>();
      const modelIdsByName = new Map<string, string>();
      const modelIdsBySlug = new Map<string, string>();
      const mediaIdsByPath = new Map<string, string>();

      for (const [name, values] of Object.entries(categorySeed) as [
        ModelCategory,
        (typeof categorySeed)[ModelCategory],
      ][]) {
        const [category] = await tx
          .insert(categories)
          .values({ name, status: "published", ...values })
          .onConflictDoUpdate({
            target: categories.slug,
            set: {
              name,
              description: values.description,
              sortOrder: values.sortOrder,
              status: "published",
              updatedAt: new Date(),
            },
          })
          .returning({ id: categories.id });

        categoryIds.set(name, category.id);
      }

      for (const model of motorcycles) {
        const categoryId = categoryIds.get(model.category as ModelCategory);
        const details = demoModelMetadata[model.slug];

        if (!categoryId || !details) {
          throw new Error(`Seed metadata is missing for ${model.slug}.`);
        }

        const displacement = Number.parseInt(model.displacement, 10);
        const [storedModel] = await tx
          .insert(motorcycleModels)
          .values({
            categoryId,
            name: model.name,
            slug: model.slug,
            tagline: details.tagline,
            summary: model.description,
            description: model.description,
            modelYear: details.modelYear,
            basePriceMinor: model.price * 100,
            currency: "RON",
            displacementCc: Number.isNaN(displacement) ? null : displacement,
            powerHp: model.powerHp,
            torqueNm: model.torqueNm,
            wetWeightKg: model.wetWeightKg,
            seatHeightMm: details.seatHeightMm,
            additionalSpecs: model.rangeKm ? { rangeKm: model.rangeKm } : {},
            featured: Boolean(model.featured),
            configuratorEnabled: true,
            status: "published",
          })
          .onConflictDoUpdate({
            target: motorcycleModels.slug,
            set: {
              categoryId,
              name: model.name,
              tagline: details.tagline,
              summary: model.description,
              description: model.description,
              modelYear: details.modelYear,
              basePriceMinor: model.price * 100,
              displacementCc: Number.isNaN(displacement) ? null : displacement,
              powerHp: model.powerHp,
              torqueNm: model.torqueNm,
              wetWeightKg: model.wetWeightKg,
              seatHeightMm: details.seatHeightMm,
              additionalSpecs: model.rangeKm ? { rangeKm: model.rangeKm } : {},
              featured: Boolean(model.featured),
              configuratorEnabled: true,
              status: "published",
              updatedAt: new Date(),
            },
          })
          .returning({ id: motorcycleModels.id });

        const dimensions = imageDimensions(model.slug);
        const [media] = await tx
          .insert(mediaAssets)
          .values({
            storagePath: model.image,
            mimeType: "image/webp",
            ...dimensions,
            fileSizeBytes: 0,
            altText: model.imageAlt,
          })
          .onConflictDoUpdate({
            target: mediaAssets.storagePath,
            set: {
              mimeType: "image/webp",
              ...dimensions,
              altText: model.imageAlt,
              updatedAt: new Date(),
            },
          })
          .returning({ id: mediaAssets.id });

        modelIdsByName.set(model.name, storedModel.id);
        modelIdsBySlug.set(model.slug, storedModel.id);
        mediaIdsByPath.set(model.image, media.id);

        await tx
          .insert(modelMedia)
          .values({
            modelId: storedModel.id,
            mediaId: media.id,
            role: "card",
            sortOrder: 0,
          })
          .onConflictDoNothing();

        await tx
          .insert(modelMedia)
          .values({
            modelId: storedModel.id,
            mediaId: media.id,
            role: "hero",
            sortOrder: 0,
          })
          .onConflictDoNothing();

        const existingFeatures = await tx
          .select({ id: modelFeatures.id })
          .from(modelFeatures)
          .where(eq(modelFeatures.modelId, storedModel.id))
          .limit(1);
        if (existingFeatures.length === 0) {
          await tx.insert(modelFeatures).values(
            model.highlights.map((highlight, index) => ({
              modelId: storedModel.id,
              groupName: "Echipare standard",
              label: highlight,
              isStandard: true,
              sortOrder: index,
            })),
          );
        }

        const existingInventory = await tx
          .select({ id: inventoryUnits.id })
          .from(inventoryUnits)
          .where(eq(inventoryUnits.modelId, storedModel.id));

        if (existingInventory.length > 0) {
          await tx
            .update(inventoryUnits)
            .set({
              priceMinor: model.price * 100,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(inventoryUnits.modelId, storedModel.id),
                like(inventoryUnits.stockCode, `${model.slug.toUpperCase()}-%`),
              ),
            );
        }

        if (existingInventory.length === 0) {
          const inventoryCount =
            model.stockCount > 0
              ? model.stockCount
              : model.availability === "incoming"
                ? 1
                : 0;

          if (inventoryCount > 0) {
            await tx.insert(inventoryUnits).values(
              Array.from({ length: inventoryCount }, (_, index) => ({
                modelId: storedModel.id,
                stockCode: `${model.slug.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
                condition: "new" as const,
                year: details.modelYear,
                mileageKm: 0,
                colour: "Configurație standard",
                priceMinor: model.price * 100,
                currency: "RON",
                status:
                  model.availability === "available"
                    ? ("available" as const)
                    : ("incoming" as const),
                isPublic: true,
              })),
            );
          }
        }
      }

      for (const catalogue of demoConfiguratorCatalogues) {
        const modelId = modelIdsBySlug.get(catalogue.modelId);
        if (!modelId) continue;
        const [existingGroup] = await tx
          .select({ id: optionGroups.id })
          .from(optionGroups)
          .where(eq(optionGroups.modelId, modelId))
          .limit(1);
        if (existingGroup) continue;

        const choiceIds = new Map<string, string>();
        for (const [groupIndex, group] of catalogue.groups.entries()) {
          const [storedGroup] = await tx
            .insert(optionGroups)
            .values({
              modelId,
              key: group.key ?? group.id,
              name: group.name,
              description: group.description,
              selectionType: group.mode === "multi" ? "multiple" : "single",
              required: group.required,
              minSelected: group.required ? 1 : 0,
              maxSelected:
                group.mode === "single" ? 1 : (group.maxSelections ?? 1),
              sortOrder: groupIndex,
              status: "published",
            })
            .returning({ id: optionGroups.id });

          for (const [choiceIndex, choice] of group.choices.entries()) {
            let mediaId: string | undefined;
            if (choice.image) {
              mediaId = mediaIdsByPath.get(choice.image);
              if (!mediaId) {
                const [media] = await tx
                  .insert(mediaAssets)
                  .values({
                    storagePath: choice.image,
                    mimeType: "image/webp",
                    width: 1672,
                    height: 941,
                    fileSizeBytes: 0,
                    altText: `VERIDIAN ${catalogue.modelName} — ${choice.name}`,
                  })
                  .onConflictDoUpdate({
                    target: mediaAssets.storagePath,
                    set: {
                      altText: `VERIDIAN ${catalogue.modelName} — ${choice.name}`,
                      updatedAt: new Date(),
                    },
                  })
                  .returning({ id: mediaAssets.id });
                mediaId = media.id;
                mediaIdsByPath.set(choice.image, media.id);
              }
            }

            const [storedChoice] = await tx
              .insert(optionChoices)
              .values({
                groupId: storedGroup.id,
                code: choice.code ?? choice.id,
                name: choice.name,
                description: choice.shortDescription,
                priceDeltaMinor: choice.priceDeltaMinor,
                swatchHex: choice.swatch,
                mediaId,
                isStandard: Boolean(choice.default),
                sortOrder: choiceIndex,
                status: choice.published ? "published" : "archived",
              })
              .returning({ id: optionChoices.id });
            choiceIds.set(choice.id, storedChoice.id);
          }
        }

        for (const group of catalogue.groups) {
          for (const choice of group.choices) {
            const sourceChoiceId = choiceIds.get(choice.id);
            if (!sourceChoiceId) continue;
            for (const [ruleType, targetCodes] of [
              ["requires", choice.requires ?? []],
              ["excludes", choice.excludes ?? []],
            ] as const) {
              for (const targetCode of targetCodes) {
                const targetChoiceId = choiceIds.get(targetCode);
                if (!targetChoiceId) continue;
                await tx
                  .insert(optionRules)
                  .values({
                    sourceChoiceId,
                    targetChoiceId,
                    ruleType,
                    explanation: `${choice.name} ${ruleType === "requires" ? "necesită" : "exclude"} opțiunea asociată.`,
                  })
                  .onConflictDoNothing();
              }
            }
          }
        }
      }

      const accessoryCategoryIds = new Map<string, string>();
      for (const [index, name] of [
        ...new Set(demoAccessories.map((item) => item.category)),
      ].entries()) {
        const slug = name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replaceAll(" ", "-");
        const [category] = await tx
          .insert(accessoryCategories)
          .values({ name, slug, sortOrder: index, status: "published" })
          .onConflictDoUpdate({
            target: accessoryCategories.slug,
            set: { name, sortOrder: index, status: "published" },
          })
          .returning({ id: accessoryCategories.id });
        accessoryCategoryIds.set(name, category.id);
      }

      for (const [index, accessory] of demoAccessories.entries()) {
        const categoryId = accessoryCategoryIds.get(accessory.category);
        if (!categoryId) continue;
        const [storedAccessory] = await tx
          .insert(accessories)
          .values({
            categoryId,
            name: accessory.name,
            slug: accessory.slug,
            sku: `VER-${String(index + 1).padStart(4, "0")}`,
            summary: accessory.summary,
            description: accessory.summary,
            priceMinor: accessory.price * 100,
            currency: "RON",
            stockState: accessory.stockState,
            internalQuantity: accessory.stockState === "unavailable" ? 0 : 5,
            featured: accessory.featured,
            status: "published",
          })
          .onConflictDoUpdate({
            target: accessories.slug,
            set: {
              categoryId,
              name: accessory.name,
              summary: accessory.summary,
              description: accessory.summary,
              priceMinor: accessory.price * 100,
              stockState: accessory.stockState,
              featured: accessory.featured,
              status: "published",
              updatedAt: new Date(),
            },
          })
          .returning({ id: accessories.id });

        const imagePath = accessory.image;
        if (imagePath) {
          const [media] = await tx
            .insert(mediaAssets)
            .values({
              storagePath: imagePath,
              mimeType: "image/webp",
              width: 1536,
              height: 1024,
              fileSizeBytes: 0,
              altText: accessory.imageAlt ?? accessory.name,
            })
            .onConflictDoUpdate({
              target: mediaAssets.storagePath,
              set: {
                mimeType: "image/webp",
                width: 1536,
                height: 1024,
                altText: accessory.imageAlt ?? accessory.name,
                updatedAt: new Date(),
              },
            })
            .returning({ id: mediaAssets.id });

          mediaIdsByPath.set(imagePath, media.id);
          await tx
            .delete(accessoryMedia)
            .where(
              and(
                eq(accessoryMedia.accessoryId, storedAccessory.id),
                eq(accessoryMedia.sortOrder, 0),
              ),
            );
          await tx.insert(accessoryMedia).values({
            accessoryId: storedAccessory.id,
            mediaId: media.id,
            sortOrder: 0,
          });
        }

        await tx
          .delete(accessoryCompatibility)
          .where(eq(accessoryCompatibility.accessoryId, storedAccessory.id));
        for (const modelName of accessory.compatibility) {
          const modelId = modelIdsByName.get(modelName);
          if (!modelId) continue;
          await tx
            .insert(accessoryCompatibility)
            .values({ accessoryId: storedAccessory.id, modelId })
            .onConflictDoNothing();
        }
      }

      const discoverCategoryIds = new Map<string, string>();
      const discoverCategoryNames = [
        ...new Map(
          articles.map((article) => [article.categorySlug, article.category]),
        ).entries(),
      ];
      for (const [sortOrder, [slug, name]] of discoverCategoryNames.entries()) {
        const [category] = await tx
          .insert(discoverCategories)
          .values({ name, slug, sortOrder })
          .onConflictDoUpdate({
            target: discoverCategories.slug,
            set: { name, sortOrder },
          })
          .returning({ id: discoverCategories.id });
        discoverCategoryIds.set(slug, category.id);
      }

      for (const article of articles) {
        const categoryId = discoverCategoryIds.get(article.categorySlug);
        const coverMediaId = mediaIdsByPath.get(article.image);
        if (!categoryId || !coverMediaId) {
          throw new Error(
            `Editorial seed dependencies are missing for ${article.slug}.`,
          );
        }
        await tx
          .insert(discoverPosts)
          .values({
            categoryId,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            bodyMarkdown: article.bodyMarkdown,
            coverMediaId,
            featured: article.featured,
            status: "published",
            publishedAt: new Date(article.publishedAt),
            seoTitle: article.seoTitle,
            seoDescription: article.seoDescription,
          })
          .onConflictDoUpdate({
            target: discoverPosts.slug,
            set: {
              categoryId,
              title: article.title,
              excerpt: article.excerpt,
              bodyMarkdown: article.bodyMarkdown,
              coverMediaId,
              featured: article.featured,
              status: "published",
              publishedAt: new Date(article.publishedAt),
              seoTitle: article.seoTitle,
              seoDescription: article.seoDescription,
              updatedAt: new Date(),
            },
          });
      }

      await tx
        .insert(siteSettings)
        .values({
          id: "primary",
          contactEmail: "salut@veridian-moto.ro",
          contactPhone: "+40 312 345 678",
          address: "Strada Atelierului 24, Brașov, România",
          openingHours: {
            luni: { opens: "09:00", closes: "18:00" },
            marti: { opens: "09:00", closes: "18:00" },
            miercuri: { opens: "09:00", closes: "18:00" },
            joi: { opens: "09:00", closes: "18:00" },
            vineri: { opens: "09:00", closes: "18:00" },
            sambata: { opens: "10:00", closes: "14:00" },
            duminica: { closed: true },
          },
          socialLinks: {},
          defaultSeoTitle: "VERIDIAN Moto — Mai mult standard",
          defaultSeoDescription:
            "Motociclete moderne, echipare generoasă și prețuri corecte.",
        })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: { updatedAt: new Date() },
        });
    });

    process.stdout.write("VERIDIAN seed completed.\n");
  } finally {
    await connection.close();
  }
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown seed error";
  process.stderr.write(`VERIDIAN seed failed: ${message}\n`);
  process.exitCode = 1;
});
