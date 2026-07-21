"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/data/auth/admin-session";
import {
  archiveDiscoverPost,
  saveDiscoverCategory,
  saveDiscoverPost,
} from "@/data/mutations/admin-editorial";
import { uploadAndAssignDiscoverImage } from "@/data/mutations/admin-media";
import {
  mutationErrorState,
  type AdminFormState,
  validationErrorState,
} from "@/domain/admin/form-state";
import {
  checked,
  discoverCategorySchema,
  discoverPostSchema,
  uploadDiscoverImageSchema,
} from "@/domain/admin/schemas";

const uuid = z.string().uuid();

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function optionalField(formData: FormData, name: string) {
  const value = field(formData, name).trim();
  return value || undefined;
}

async function authorize(): Promise<AdminFormState | null> {
  try {
    await assertAdmin();
    return null;
  } catch {
    return { status: "error", message: "Sesiunea de administrator a expirat." };
  }
}

export async function saveDiscoverCategoryAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorize();
  if (denied) return denied;
  const parsed = discoverCategorySchema.safeParse({
    id: optionalField(formData, "id"),
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveDiscoverCategory(parsed.data);
    revalidatePath("/atelier/descopera");
    return {
      status: "success",
      message: parsed.data.id
        ? "Categoria editorială a fost actualizată."
        : "Categoria editorială a fost creată.",
    };
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveDiscoverPostAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorize();
  if (denied) return denied;
  const parsed = discoverPostSchema.safeParse({
    id: optionalField(formData, "id"),
    categoryId: field(formData, "categoryId"),
    title: field(formData, "title"),
    slug: field(formData, "slug"),
    excerpt: field(formData, "excerpt"),
    bodyMarkdown: field(formData, "bodyMarkdown"),
    coverMediaId: field(formData, "coverMediaId"),
    featured: checked(formData, "featured"),
    status: field(formData, "status"),
    publishedAt: field(formData, "publishedAt"),
    seoTitle: field(formData, "seoTitle"),
    seoDescription: field(formData, "seoDescription"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveDiscoverPost(parsed.data);
    revalidatePath("/atelier/descopera");
    return {
      status: "success",
      message: parsed.data.id
        ? "Articolul a fost actualizat."
        : "Articolul a fost creat.",
    };
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function archiveDiscoverPostAction(
  id: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorize();
  if (denied) return denied;
  if (!uuid.safeParse(id).success) {
    return { status: "error", message: "Articolul selectat nu este valid." };
  }

  try {
    await archiveDiscoverPost(id);
    revalidatePath("/atelier/descopera");
    return { status: "success", message: "Articolul a fost arhivat." };
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function uploadDiscoverCoverAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorize();
  if (denied) return denied;
  const parsed = uploadDiscoverImageSchema.safeParse({
    postId: field(formData, "postId"),
    altText: field(formData, "altText"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: "Selectează o imagine validă." };
  }

  try {
    await uploadAndAssignDiscoverImage(parsed.data, file);
    revalidatePath("/atelier/descopera");
    return {
      status: "success",
      message:
        "Coperta a fost optimizată și salvată; articolul este acum draft.",
    };
  } catch (error) {
    return mutationErrorState(error);
  }
}
