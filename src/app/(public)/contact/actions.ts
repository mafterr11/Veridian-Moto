"use server";

import {
  createPublicInquiry,
  PublicInquiryError,
} from "@/data/mutations/public-inquiries";
import { PublicRateLimitError } from "@/data/mutations/public-rate-limits";
import { inquirySchema } from "@/domain/enquiries/schemas";
import { enforcePublicActionRateLimits } from "@/lib/public-action-rate-limit";

export type InquiryFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  reference?: string;
  issues?: Record<string, string>;
};

export async function submitInquiryAction(
  _state: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const parsed = inquirySchema.safeParse({
    configurationReference:
      String(formData.get("configurationReference") ?? "").trim() || undefined,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    preferredContactMethod: formData.get("preferredContactMethod"),
    privacyAcknowledged: formData.get("privacyAcknowledged") === "on",
    website: formData.get("website"),
    startedAt: formData.get("startedAt"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifică informațiile evidențiate.",
      issues: Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0] ?? "form"),
          issue.message,
        ]),
      ),
    };
  }

  const elapsed = Date.now() - parsed.data.startedAt;
  if (elapsed < 2_000 || elapsed > 7_200_000) {
    return {
      status: "error",
      message: "Sesiunea formularului nu mai este validă. Reîncarcă pagina.",
    };
  }

  try {
    await enforcePublicActionRateLimits([
      {
        scope: "inquiry-ip",
        limit: 5,
        windowMs: 15 * 60_000,
      },
      {
        scope: "inquiry-email",
        discriminator: parsed.data.email,
        includeAddress: false,
        limit: 3,
        windowMs: 15 * 60_000,
      },
    ]);
    const result = await createPublicInquiry(parsed.data);
    return {
      status: "success",
      message: "Solicitarea a fost înregistrată.",
      reference: result.displayReference,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof PublicInquiryError ||
        error instanceof PublicRateLimitError
          ? error.message
          : "Solicitarea nu a putut fi înregistrată. Încearcă din nou.",
    };
  }
}
