import "server-only";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { siteSettings } from "@/db/schema";
import {
  assertAdmin,
  isAdminInfrastructureConfigured,
} from "@/data/auth/admin-session";
import {
  defaultSiteSettings,
  normalizeOpeningHours,
} from "@/data/site-settings";

export async function getAdminSiteSettings() {
  if (!isAdminInfrastructureConfigured()) return defaultSiteSettings;
  await assertAdmin();
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

  return settings
    ? {
        ...settings,
        openingHours: normalizeOpeningHours(settings.openingHours),
      }
    : defaultSiteSettings;
}
