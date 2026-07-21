"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  findActiveAdminProfile,
  isAdminInfrastructureConfigured,
} from "@/data/auth/admin-session";
import {
  isAllowedAdminEmail,
  readAdminClaims,
} from "@/domain/auth/admin-identity";
import { env } from "@/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Introdu o adresă de email validă."),
  password: z
    .string()
    .min(1, "Introdu parola.")
    .max(256, "Parola introdusă este prea lungă."),
});

export type LoginActionState = {
  status: "idle" | "error" | "configuration-error";
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!isAdminInfrastructureConfigured()) {
    return {
      status: "configuration-error",
      message:
        "Administrarea nu este configurată încă. Completează variabilele Supabase și baza de date.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginActionState["fieldErrors"] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" || field === "password") {
        fieldErrors[field] ??= issue.message;
      }
    }

    return {
      status: "error",
      message: "Verifică datele introduse.",
      fieldErrors,
    };
  }

  const genericError = {
    status: "error" as const,
    message: "Emailul sau parola nu sunt corecte.",
  };

  if (!isAllowedAdminEmail(parsed.data.email, env.ADMIN_EMAIL)) {
    return genericError;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error: signInError } = await supabase.auth.signInWithPassword(
      parsed.data,
    );

    if (signInError) {
      return genericError;
    }

    const { data, error: claimsError } = await supabase.auth.getClaims();
    const claims = claimsError ? null : readAdminClaims(data?.claims);

    if (!claims || !isAllowedAdminEmail(claims.email, env.ADMIN_EMAIL)) {
      await supabase.auth.signOut();
      return genericError;
    }

    const profile = await findActiveAdminProfile(claims.id);

    if (!profile) {
      await supabase.auth.signOut();
      return {
        status: "configuration-error",
        message:
          "Contul este valid, dar profilul de administrator nu a fost provisionat. Rulează comanda db:admin.",
      };
    }
  } catch (error) {
    console.error("Atelier login dependency check failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      status: "configuration-error",
      message:
        "Serviciul de autentificare sau baza de date nu răspunde momentan. Încearcă din nou după verificarea Supabase.",
    };
  }

  redirect("/atelier");
}

export async function logoutAction() {
  try {
    if (isAdminInfrastructureConfigured()) {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error("Atelier logout could not reach Supabase.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }

  redirect("/atelier/login");
}
