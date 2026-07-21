import type { Metadata } from "next";
import { ArrowRight, Plus } from "lucide-react";

import { archiveModelAction } from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminDocumentLink } from "@/components/admin/admin-document-link";
import { AdminPageHeader, AdminSection } from "@/components/admin/page-header";
import {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { getAdminModelList } from "@/data/queries/admin-catalogue";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Modele" };

export default function AdminModelsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Modele"
        description="Creează drafturi, completează media și configurația, apoi publică numai după validarea întregului model."
        actions={
          <AdminDocumentLink
            href="/atelier/modele/nou"
            className={buttonVariants()}
          >
            <Plus aria-hidden="true" /> Model nou
          </AdminDocumentLink>
        }
      />
      <ModelsTable />
    </main>
  );
}

async function ModelsTable() {
  const models = await getAdminModelList();

  return (
    <AdminSection
      title="Gama administrată"
      description={`${models.length} modele`}
      className="mt-10"
    >
      {models.length === 0 ? (
        <AdminEmptyState>
          Nu există modele. Creează primul draft pentru a continua.
        </AdminEmptyState>
      ) : (
        <div className="grid gap-3">
          {models.map((model) => (
            <article
              key={model.id}
              className="border-obsidian/15 grid gap-4 border p-4 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-2xl font-bold uppercase">
                    {model.name}
                  </h2>
                  <AdminStatusBadge status={model.status} />
                  {model.configuratorEnabled && (
                    <span className="border-obsidian/15 border px-2 py-1 text-[0.65rem] font-bold uppercase">
                      Configurator
                    </span>
                  )}
                </div>
                <p className="text-steel mt-1 text-xs">
                  {model.categoryName} · {model.modelYear} ·{" "}
                  {formatPrice(model.basePriceMinor / 100)} ·{" "}
                  {model.publicInventory} unități publice
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {model.status !== "archived" && (
                  <AdminActionForm
                    action={archiveModelAction.bind(null, model.id)}
                    submitLabel="Arhivează"
                    buttonVariant="destructive"
                  />
                )}
                <AdminDocumentLink
                  href={`/atelier/modele/${model.id}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Editează <ArrowRight aria-hidden="true" />
                </AdminDocumentLink>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
