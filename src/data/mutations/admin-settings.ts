import "server-only";

import { revalidateTag } from "next/cache";

import { getDatabase } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { assertAdmin } from "@/data/auth/admin-session";
import { CACHE_TAGS } from "@/data/cache-tags";
import type { siteSettingsSchema } from "@/domain/admin/schemas";
import type { z } from "zod";

type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export async function saveSiteSettings(input: SiteSettingsInput) {
  await assertAdmin();
  await getDatabase()
    .insert(siteSettings)
    .values({ id: "primary", ...input })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { ...input, updatedAt: new Date() },
    });
  revalidateTag(CACHE_TAGS.siteSettings, "max");
}
