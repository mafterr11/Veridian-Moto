"use server";

import { redirect } from "next/navigation";

import {
  PublicConfigurationError,
  saveConfigurationSnapshot,
} from "@/data/mutations/public-configurations";
import { PublicRateLimitError } from "@/data/mutations/public-rate-limits";
import { isTransientDatabaseError } from "@/db/transient";
import { saveConfigurationSchema } from "@/domain/enquiries/schemas";
import { enforcePublicActionRateLimits } from "@/lib/public-action-rate-limit";

export type ConfigurationSaveState = {
  status: "idle" | "error";
  message?: string;
};

export async function saveConfigurationAction(
  _state: ConfigurationSaveState,
  formData: FormData,
): Promise<ConfigurationSaveState> {
  const serializedState = String(formData.get("state") ?? "");
  if (serializedState.length > 50_000) {
    return { status: "error", message: "Configurația trimisă este prea mare." };
  }

  let state: unknown;
  try {
    state = JSON.parse(serializedState);
  } catch {
    return { status: "error", message: "Configurația trimisă nu este validă." };
  }

  const parsed = saveConfigurationSchema.safeParse({
    modelSlug: formData.get("modelSlug"),
    state,
    clientTotalMinor: formData.get("clientTotalMinor"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Configurația trimisă este incompletă.",
    };
  }

  let reference: string;
  try {
    await enforcePublicActionRateLimits([
      {
        scope: "configuration-snapshot",
        limit: 20,
        windowMs: 10 * 60_000,
      },
    ]);
    reference = await saveConfigurationSnapshot(parsed.data);
  } catch (error) {
    if (
      error instanceof PublicConfigurationError ||
      error instanceof PublicRateLimitError
    ) {
      return { status: "error", message: error.message };
    }

    // Anything reaching here is unexpected — an unreachable pooler, most often.
    // Without this the visitor's summary message is the only trace it leaves.
    console.error("configurator: save action failed", error);
    return {
      status: "error",
      message: isTransientDatabaseError(error)
        ? "Serviciul de salvare este temporar indisponibil."
        : "Configurația nu a putut fi salvată.",
    };
  }

  redirect(`/configuratie/${reference}`);
}
