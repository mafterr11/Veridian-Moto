import "server-only";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import sharp from "sharp";

import { getDatabase } from "@/db/client";
import {
  accessories,
  accessoryMedia,
  discoverPosts,
  inventoryMedia,
  inventoryUnits,
  mediaAssets,
  modelMedia,
  motorcycleModels,
} from "@/db/schema";
import { assertAdmin } from "@/data/auth/admin-session";
import {
  AdminMutationError,
  assertValidModelMediaPlacement,
} from "@/data/mutations/admin-catalogue";
import {
  revalidateAccessoryCatalogue,
  revalidateDiscoverContent,
  revalidateModelCatalogue,
} from "@/data/revalidation";
import {
  hasMatchingImageSignature,
  isAllowedCatalogueImageType,
  MAX_CATALOGUE_IMAGE_BYTES,
  MAX_CATALOGUE_IMAGE_PIXELS,
} from "@/domain/admin/image-validation";
import type {
  uploadAccessoryImageSchema,
  uploadDiscoverImageSchema,
  uploadImageSchema,
  uploadInventoryImageSchema,
} from "@/domain/admin/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { z } from "zod";

const STORAGE_BUCKET = "catalogue";

type UploadImageInput = z.infer<typeof uploadImageSchema>;
type UploadAccessoryImageInput = z.infer<typeof uploadAccessoryImageSchema>;
type UploadDiscoverImageInput = z.infer<typeof uploadDiscoverImageSchema>;
type UploadInventoryImageInput = z.infer<typeof uploadInventoryImageSchema>;

async function normalizeImage(file: File) {
  if (file.size <= 0 || file.size > MAX_CATALOGUE_IMAGE_BYTES) {
    throw new AdminMutationError(
      "Imaginea trebuie să aibă între 1 octet și 5 MB.",
    );
  }
  if (!isAllowedCatalogueImageType(file.type)) {
    throw new AdminMutationError(
      "Formatul nu este acceptat. Folosește JPEG, PNG, WebP sau AVIF.",
    );
  }

  const input = Buffer.from(await file.arrayBuffer());
  if (!hasMatchingImageSignature(input, file.type)) {
    throw new AdminMutationError(
      "Conținutul fișierului nu corespunde formatului declarat.",
    );
  }

  try {
    const sourceMetadata = await sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_CATALOGUE_IMAGE_PIXELS,
    }).metadata();

    if (
      !sourceMetadata.width ||
      !sourceMetadata.height ||
      sourceMetadata.width < 320 ||
      sourceMetadata.height < 240
    ) {
      throw new AdminMutationError(
        "Imaginea trebuie să aibă minimum 320 × 240 pixeli.",
      );
    }
    if ((sourceMetadata.pages ?? 1) > 1) {
      throw new AdminMutationError("Imaginile animate nu sunt acceptate.");
    }

    const { data, info } = await sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_CATALOGUE_IMAGE_PIXELS,
    })
      .rotate()
      .resize({
        width: 2400,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 86, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    if (info.size > MAX_CATALOGUE_IMAGE_BYTES) {
      throw new AdminMutationError(
        "Imaginea normalizată depășește limita Storage de 5 MB.",
      );
    }

    return { data, width: info.width, height: info.height, size: info.size };
  } catch (error) {
    if (error instanceof AdminMutationError) throw error;
    throw new AdminMutationError(
      "Imaginea nu a putut fi decodată în siguranță.",
    );
  }
}

async function rollbackUploadedObject(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  objectPath: string,
  associationMessage: string,
): Promise<never> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([objectPath]);
  throw new AdminMutationError(
    error
      ? `${associationMessage} Fișierul încărcat poate necesita eliminare manuală din Storage.`
      : `${associationMessage} Fișierul încărcat a fost eliminat.`,
  );
}

export async function uploadAndAssignModelImage(
  input: UploadImageInput,
  file: File,
) {
  await assertAdmin();
  await assertValidModelMediaPlacement(input);
  const normalized = await normalizeImage(file);
  const objectPath = `models/${input.modelId}/${randomUUID()}.webp`;
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, normalized.data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new AdminMutationError(
      "Fișierul nu a putut fi încărcat. Verifică bucket-ul și politicile Storage.",
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(objectPath);
  const db = getDatabase();

  try {
    await db.transaction(async (tx) => {
      const [media] = await tx
        .insert(mediaAssets)
        .values({
          storagePath: publicUrlData.publicUrl,
          mimeType: "image/webp",
          width: normalized.width,
          height: normalized.height,
          fileSizeBytes: normalized.size,
          altText: input.altText,
        })
        .returning({ id: mediaAssets.id });

      await tx.insert(modelMedia).values({
        modelId: input.modelId,
        mediaId: media.id,
        role: input.role,
        optionChoiceId: input.optionChoiceId,
        viewAngle: input.viewAngle,
        sortOrder: input.sortOrder,
      });
      await tx
        .update(motorcycleModels)
        .set({ status: "draft", updatedAt: new Date() })
        .where(eq(motorcycleModels.id, input.modelId));
    });
  } catch {
    await rollbackUploadedObject(
      supabase,
      objectPath,
      "Asocierea imaginii cu modelul a eșuat.",
    );
  }

  const [model] = await db
    .select({ slug: motorcycleModels.slug })
    .from(motorcycleModels)
    .where(eq(motorcycleModels.id, input.modelId))
    .limit(1);
  revalidateModelCatalogue(model?.slug);
}

export async function uploadAndAssignAccessoryImage(
  input: UploadAccessoryImageInput,
  file: File,
) {
  await assertAdmin();
  const normalized = await normalizeImage(file);
  const objectPath = `accessories/${input.accessoryId}/${randomUUID()}.webp`;
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, normalized.data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new AdminMutationError(
      "Fișierul nu a putut fi încărcat. Verifică bucket-ul și politicile Storage.",
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(objectPath);
  const db = getDatabase();

  try {
    await db.transaction(async (tx) => {
      const [media] = await tx
        .insert(mediaAssets)
        .values({
          storagePath: publicUrlData.publicUrl,
          mimeType: "image/webp",
          width: normalized.width,
          height: normalized.height,
          fileSizeBytes: normalized.size,
          altText: input.altText,
        })
        .returning({ id: mediaAssets.id });
      await tx.insert(accessoryMedia).values({
        accessoryId: input.accessoryId,
        mediaId: media.id,
        sortOrder: input.sortOrder,
      });
    });
  } catch {
    await rollbackUploadedObject(
      supabase,
      objectPath,
      "Asocierea imaginii cu accesoriul a eșuat.",
    );
  }

  const [item] = await db
    .select({ slug: accessories.slug })
    .from(accessories)
    .where(eq(accessories.id, input.accessoryId))
    .limit(1);
  revalidateAccessoryCatalogue(item?.slug);
}

export async function uploadAndAssignInventoryImage(
  input: UploadInventoryImageInput,
  file: File,
) {
  await assertAdmin();
  const normalized = await normalizeImage(file);
  const objectPath = `inventory/${input.inventoryUnitId}/${randomUUID()}.webp`;
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, normalized.data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new AdminMutationError(
      "Fișierul nu a putut fi încărcat. Verifică bucket-ul și politicile Storage.",
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(objectPath);
  const db = getDatabase();

  try {
    await db.transaction(async (tx) => {
      const [media] = await tx
        .insert(mediaAssets)
        .values({
          storagePath: publicUrlData.publicUrl,
          mimeType: "image/webp",
          width: normalized.width,
          height: normalized.height,
          fileSizeBytes: normalized.size,
          altText: input.altText,
        })
        .returning({ id: mediaAssets.id });
      await tx.insert(inventoryMedia).values({
        inventoryUnitId: input.inventoryUnitId,
        mediaId: media.id,
        sortOrder: input.sortOrder,
      });
    });
  } catch {
    await rollbackUploadedObject(
      supabase,
      objectPath,
      "Asocierea imaginii cu unitatea de stoc a eșuat.",
    );
  }

  const [unit] = await db
    .select({ slug: motorcycleModels.slug })
    .from(inventoryUnits)
    .innerJoin(
      motorcycleModels,
      eq(inventoryUnits.modelId, motorcycleModels.id),
    )
    .where(eq(inventoryUnits.id, input.inventoryUnitId))
    .limit(1);
  revalidateModelCatalogue(unit?.slug);
}

export async function uploadAndAssignDiscoverImage(
  input: UploadDiscoverImageInput,
  file: File,
) {
  await assertAdmin();
  const normalized = await normalizeImage(file);
  const objectPath = `discover/${input.postId}/${randomUUID()}.webp`;
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, normalized.data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new AdminMutationError(
      "Fișierul nu a putut fi încărcat. Verifică bucket-ul și politicile Storage.",
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(objectPath);
  const db = getDatabase();

  try {
    await db.transaction(async (tx) => {
      const [media] = await tx
        .insert(mediaAssets)
        .values({
          storagePath: publicUrlData.publicUrl,
          mimeType: "image/webp",
          width: normalized.width,
          height: normalized.height,
          fileSizeBytes: normalized.size,
          altText: input.altText,
        })
        .returning({ id: mediaAssets.id });
      const [updated] = await tx
        .update(discoverPosts)
        .set({
          coverMediaId: media.id,
          status: "draft",
          updatedAt: new Date(),
        })
        .where(eq(discoverPosts.id, input.postId))
        .returning({ id: discoverPosts.id });
      if (!updated) throw new AdminMutationError("Articolul nu mai există.");
    });
  } catch {
    await rollbackUploadedObject(
      supabase,
      objectPath,
      "Asocierea imaginii cu articolul a eșuat.",
    );
  }

  const [post] = await db
    .select({ slug: discoverPosts.slug })
    .from(discoverPosts)
    .where(eq(discoverPosts.id, input.postId))
    .limit(1);
  revalidateDiscoverContent(post?.slug);
}
