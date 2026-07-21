"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/data/auth/admin-session";
import { updateInquiry } from "@/data/mutations/admin-inquiries";
import {
  mutationErrorState,
  type AdminFormState,
  validationErrorState,
} from "@/domain/admin/form-state";
import { updateInquirySchema } from "@/domain/enquiries/schemas";

export async function updateInquiryAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await assertAdmin();
  } catch {
    return { status: "error", message: "Sesiunea de administrator a expirat." };
  }

  const parsed = updateInquirySchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    privateAdminNotes: formData.get("privateAdminNotes"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await updateInquiry(parsed.data);
    revalidatePath("/atelier/solicitari");
    return { status: "success", message: "Solicitarea a fost actualizată." };
  } catch (error) {
    return mutationErrorState(error);
  }
}
