import "server-only";

import { and, eq } from "drizzle-orm";
import { cache } from "react";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { adminProfiles } from "@/db/schema";
import {
  isAllowedAdminEmail,
  readAdminClaims,
} from "@/domain/auth/admin-identity";
import { env } from "@/env";
import { getSupabasePublicConfig } from "@/lib/supabase/public-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  email: string;
  displayName: string;
};

export type AdminAuthState =
  | { status: "authenticated"; identity: AdminIdentity }
  | { status: "missing-configuration" }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "unprovisioned" };

export class AdminAuthorizationError extends Error {
  constructor() {
    super("Administrator authorization is required.");
    this.name = "AdminAuthorizationError";
  }
}

export function isAdminInfrastructureConfigured() {
  return Boolean(
    getSupabasePublicConfig() && isDatabaseConfigured() && env.ADMIN_EMAIL,
  );
}

export async function findActiveAdminProfile(id: string) {
  const [profile] = await getDatabase()
    .select({
      id: adminProfiles.id,
      displayName: adminProfiles.displayName,
    })
    .from(adminProfiles)
    .where(
      and(
        eq(adminProfiles.id, id),
        eq(adminProfiles.role, "admin"),
        eq(adminProfiles.isActive, true),
      ),
    )
    .limit(1);

  return profile ?? null;
}

export const getAdminAuthState = cache(async (): Promise<AdminAuthState> => {
  if (!isAdminInfrastructureConfigured()) {
    return { status: "missing-configuration" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return { status: "unauthenticated" };
  }

  const claims = readAdminClaims(data.claims);

  if (!claims) {
    return { status: "unauthenticated" };
  }

  if (!isAllowedAdminEmail(claims.email, env.ADMIN_EMAIL)) {
    return { status: "forbidden" };
  }

  const profile = await findActiveAdminProfile(claims.id);

  if (!profile) {
    return { status: "unprovisioned" };
  }

  return {
    status: "authenticated",
    identity: {
      id: profile.id,
      email: claims.email,
      displayName: profile.displayName,
    },
  };
});

export async function assertAdmin(): Promise<AdminIdentity> {
  const auth = await getAdminAuthState();

  if (auth.status !== "authenticated") {
    throw new AdminAuthorizationError();
  }

  return auth.identity;
}
