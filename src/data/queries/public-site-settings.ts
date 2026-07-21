import "server-only";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { CACHE_TAGS } from "@/data/cache-tags";
import {
  defaultSiteSettings,
  normalizeOpeningHours,
  sanitizeSocialLinks,
  type PublicSiteSettings,
} from "@/data/site-settings";

const getCachedSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => {
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
  },
  ["public-site-settings"],
  { revalidate: 3_600, tags: [CACHE_TAGS.siteSettings] },
);

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  if (!isDatabaseConfigured()) return defaultSiteSettings;
  return getCachedSiteSettings();
}
