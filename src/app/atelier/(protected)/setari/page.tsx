import type { Metadata } from "next";

import { saveSiteSettingsAction } from "@/app/atelier/(protected)/setari/actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminCheckbox, AdminField } from "@/components/admin/form-field";
import { AdminPageHeader, AdminSection } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSiteSettings } from "@/data/queries/admin-settings";
import { openingDayKeys, openingDayLabels } from "@/domain/site-settings";

export const metadata: Metadata = { title: "Setări site" };

export default function AdminSettingsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Site"
        title="Setări"
        description="Actualizează contactul, programul, rețelele sociale și valorile SEO implicite fără modificări în cod."
      />
      <SettingsWorkspace />
    </main>
  );
}

async function SettingsWorkspace() {
  const settings = await getAdminSiteSettings();
  return (
    <AdminActionForm
      action={saveSiteSettingsAction}
      submitLabel="Salvează setările publice"
      className="mt-10"
      buttonClassName="h-11"
    >
      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <AdminSection title="Contact public">
          <div className="grid gap-5">
            <AdminField label="Email" htmlFor="settings-email">
              <Input
                id="settings-email"
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                required
              />
            </AdminField>
            <AdminField label="Telefon" htmlFor="settings-phone">
              <Input
                id="settings-phone"
                name="contactPhone"
                type="tel"
                defaultValue={settings.contactPhone}
                required
              />
            </AdminField>
            <AdminField label="Adresă" htmlFor="settings-address">
              <Textarea
                id="settings-address"
                name="address"
                rows={3}
                defaultValue={settings.address}
                required
              />
            </AdminField>
          </div>
        </AdminSection>

        <AdminSection
          title="SEO implicit"
          description="Paginile cu metadata proprie o suprascriu."
        >
          <div className="grid gap-5">
            <AdminField label="Titlu implicit" htmlFor="settings-seo-title">
              <Input
                id="settings-seo-title"
                name="defaultSeoTitle"
                maxLength={70}
                defaultValue={settings.defaultSeoTitle}
                required
              />
            </AdminField>
            <AdminField
              label="Descriere implicită"
              htmlFor="settings-seo-description"
            >
              <Textarea
                id="settings-seo-description"
                name="defaultSeoDescription"
                rows={4}
                minLength={50}
                maxLength={170}
                defaultValue={settings.defaultSeoDescription}
                required
              />
            </AdminField>
          </div>
        </AdminSection>
      </div>

      <AdminSection
        title="Program"
        description="Bifează Închis pentru zilele fără program. Orele folosesc formatul 24h."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {openingDayKeys.map((day) => {
            const value = settings.openingHours[day];
            return (
              <div
                key={day}
                className="border-obsidian/15 grid gap-4 border p-4 sm:grid-cols-[1fr_8rem_8rem] sm:items-end"
              >
                <AdminCheckbox
                  id={`${day}-closed`}
                  name={`${day}Closed`}
                  label={`${openingDayLabels[day]} · Închis`}
                  defaultChecked={value.closed}
                />
                <AdminField label="Deschide" htmlFor={`${day}-opens`}>
                  <Input
                    id={`${day}-opens`}
                    name={`${day}Opens`}
                    type="time"
                    defaultValue={value.opens ?? "09:00"}
                  />
                </AdminField>
                <AdminField label="Închide" htmlFor={`${day}-closes`}>
                  <Input
                    id={`${day}-closes`}
                    name={`${day}Closes`}
                    type="time"
                    defaultValue={value.closes ?? "18:00"}
                  />
                </AdminField>
              </div>
            );
          })}
        </div>
      </AdminSection>

      <AdminSection
        title="Rețele sociale"
        description="Lasă câmpul gol pentru a ascunde linkul din footer."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {(["instagram", "youtube", "facebook"] as const).map((network) => (
            <AdminField
              key={network}
              label={network[0]!.toUpperCase() + network.slice(1)}
              htmlFor={`settings-${network}`}
            >
              <Input
                id={`settings-${network}`}
                name={network}
                type="url"
                placeholder="https://…"
                defaultValue={settings.socialLinks[network] ?? ""}
              />
            </AdminField>
          ))}
        </div>
      </AdminSection>
    </AdminActionForm>
  );
}
