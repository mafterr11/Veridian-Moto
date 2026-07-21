import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "@/lib/supabase/public-config";

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase authentication is not configured.");
    this.name = "SupabaseNotConfiguredError";
  }
}

export async function createSupabaseServerClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new SupabaseNotConfiguredError();
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies. proxy.ts refreshes
          // and persists the session before protected routes are rendered.
        }
      },
    },
  });
}
