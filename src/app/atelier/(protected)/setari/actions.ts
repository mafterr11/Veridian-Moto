"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/data/auth/admin-session";
import { saveSiteSettings } from "@/data/mutations/admin-settings";
import {
  mutationErrorState,
  type AdminFormState,
  validationErrorState,
} from "@/domain/admin/form-state";
import {
  openingHoursFromForm,
  siteSettingsSchema,
} from "@/domain/admin/schemas";

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export async function saveSiteSettingsAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await assertAdmin();
  } catch {
    return { status: "error", message: "Sesiunea de administrator a expirat." };
  }

  const parsed = siteSettingsSchema.safeParse({
    contactEmail: field(formData, "contactEmail"),
    contactPhone: field(formData, "contactPhone"),
    address: field(formData, "address"),
    openingHours: openingHoursFromForm(formData),
    socialLinks: {
      instagram: field(formData, "instagram"),
      youtube: field(formData, "youtube"),
      facebook: field(formData, "facebook"),
    },
    defaultSeoTitle: field(formData, "defaultSeoTitle"),
    defaultSeoDescription: field(formData, "defaultSeoDescription"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveSiteSettings(parsed.data);
    revalidatePath("/atelier/setari");
    return {
      status: "success",
      message: "Setările publice au fost actualizate.",
    };
  } catch (error) {
    return mutationErrorState(error);
  }
}
