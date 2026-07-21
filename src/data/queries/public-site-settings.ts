import "server-only";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { CACHE_TAGS } from "@/data/cache-tags";
import {
  defaultSiteSettings,
  normalizeOpeningHours,
  sanitizeSocialLinks,
  type PublicSiteSettings,
} from "@/data/site-settings";

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.siteSettings);

  if (!isDatabaseConfigured()) return defaultSiteSettings;
  const [settings] = await getDatabase()
    .select({
      contactEmail: siteSettings.contactEmail,
      contactPhone: siteSettings.contactPhone,
      address: siteSettings.address,
      openingHours: siteSettings.openingHours,
      socialLinks: siteSettings.socialLinks,
      defaultSeoTitle: siteSettings.defaultSeoTitle,
      defaultSeoDescription: siteSettings.defaultSeoDescription,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, "primary"))
    .limit(1);

  if (!settings) return defaultSiteSettings;
  return {
    ...settings,
    openingHours: normalizeOpeningHours(settings.openingHours),
    socialLinks: sanitizeSocialLinks(settings.socialLinks),
  };
}
