"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "@/lib/supabase/public-config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  browserClient ??= createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}
