import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {
  archiveModelAction,
  publishModelAction,
  updateModelAction,
} from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { ModelConfigurationEditor } from "@/components/admin/model-configuration-editor";
import { ModelFeatureEditor } from "@/components/admin/model-feature-editor";
import { ModelForm } from "@/components/admin/model-form";
import { ModelMediaEditor } from "@/components/admin/model-media-editor";
import { AdminPageHeader, AdminSection } from "@/components/admin/page-header";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { getAdminModelEditor } from "@/data/queries/admin-catalogue";

export const metadata: Metadata = { title: "Editor model" };

type Params = Promise<{ id: string }>;

export default function EditModelPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ModelEditorLoading />}>
      <ModelEditor params={params} />
    </Suspense>
  );
}

async function ModelEditor({ params }: { params: Params }) {
  const { id } = await params;
  const workspace = await getAdminModelEditor(id);
  if (!workspace) notFound();

  const { model } = workspace;

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow={`Catalog / ${model.categoryName}`}
        title={model.name}
        description="Orice modificare editorială readuce modelul în draft. Publicarea rulează validarea completă într-o tranzacție."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/atelier/modele"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft aria-hidden="true" /> Modele
            </Link>
            {model.status === "published" && (
              <Link
                href={`/modele/${model.slug}`}
                target="_blank"
                className={buttonVariants({ variant: "outline" })}
              >
                Preview <ExternalLink aria-hidden="true" />
              </Link>
            )}
          </div>
        }
      />

      <div className="border-obsidian/15 mt-8 flex flex-col gap-4 border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Stare curentă</span>
            <AdminStatusBadge status={model.status} />
          </div>
          <p className="text-steel mt-1 text-xs">
            Ultima actualizare: {model.updatedAt.toLocaleString("ro-RO")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminActionForm
            action={publishModelAction.bind(null, model.id)}
            submitLabel={
              model.status === "published"
                ? "Revalidează publicarea"
                : "Validează și publică"
            }
          />
          {model.status !== "archived" && (
            <AdminActionForm
              action={archiveModelAction.bind(null, model.id)}
              submitLabel="Arhivează"
              buttonVariant="destructive"
            />
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8">
        <AdminSection
          title="Identitate și specificații"
          description="Salvarea acestei secțiuni păstrează toate celelalte relații și setează starea draft."
        >
          <ModelForm
            action={updateModelAction}
            categories={workspace.categories}
            value={model}
            submitLabel="Salvează modelul"
          />
        </AdminSection>

        <AdminSection
          title="Echipare standard"
          description="Elementele standard apar în prezentarea publică și în rezumatul configuratorului."
        >
          <ModelFeatureEditor
            modelId={model.id}
            features={workspace.features}
          />
        </AdminSection>

        <AdminSection
          title="Media"
          description="Publicarea cere câte o asociere card și hero. Fișierele noi sunt validate și normalizate înainte de Storage."
        >
          <ModelMediaEditor
            modelId={model.id}
            assigned={workspace.media}
            library={workspace.mediaLibrary}
          />
        </AdminSection>

        <AdminSection
          title="Configurator"
          description="Grupurile, alegerile implicite și regulile sunt validate împreună înainte ca modelul să poată deveni public."
        >
          <ModelConfigurationEditor
            modelId={model.id}
            groups={workspace.groups}
            choices={workspace.choices}
            rules={workspace.rules}
            accessories={workspace.accessories}
            mediaLibrary={workspace.mediaLibrary}
          />
        </AdminSection>
      </div>
    </main>
  );
}

function ModelEditorLoading() {
  return (
    <main className="px-5 py-12 sm:px-8 lg:px-10">
      <p className="text-sm font-semibold">Se încarcă editorul modelului…</p>
    </main>
  );
}
