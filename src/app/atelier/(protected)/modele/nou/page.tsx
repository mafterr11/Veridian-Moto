import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { createModelAction } from "@/app/atelier/(protected)/catalogue-actions";
import { AdminDocumentLink } from "@/components/admin/admin-document-link";
import { ModelForm } from "@/components/admin/model-form";
import { AdminPageHeader, AdminSection } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCategories } from "@/data/queries/admin-catalogue";

export const metadata: Metadata = { title: "Model nou" };

export default function NewModelPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Catalog / Modele"
        title="Model nou"
        description="Începe cu identitatea și specificațiile. Modelul este creat ca draft; media și configuratorul se adaugă în editor."
        actions={
          <AdminDocumentLink
            href="/atelier/modele"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft aria-hidden="true" /> Înapoi
          </AdminDocumentLink>
        }
      />
      <NewModelForm />
    </main>
  );
}

async function NewModelForm() {
  const categories = await getAdminCategories();

  return (
    <AdminSection title="Identitate și specificații" className="mt-10">
      {categories.length ? (
        <ModelForm
          action={createModelAction}
          categories={categories}
          submitLabel="Creează draftul"
        />
      ) : (
        <p className="text-steel text-sm leading-6">
          Creează mai întâi o categorie în{" "}
          <AdminDocumentLink
            href="/atelier/categorii"
            className="text-veridian-dark underline"
          >
            administrarea categoriilor
          </AdminDocumentLink>
          .
        </p>
      )}
    </AdminSection>
  );
}
