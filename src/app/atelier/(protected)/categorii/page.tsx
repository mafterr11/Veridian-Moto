import type { Metadata } from "next";

import {
  archiveCategoryAction,
  saveCategoryAction,
} from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminField } from "@/components/admin/form-field";
import { AdminPageHeader, AdminSection } from "@/components/admin/page-header";
import {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getAdminCategories } from "@/data/queries/admin-catalogue";

export const metadata: Metadata = { title: "Categorii modele" };

export default function AdminCategoriesPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categorii"
        description="Organizează gama publică. O categorie publicată poate primi modele; una folosită nu poate fi arhivată accidental."
      />
      <CategoriesWorkspace />
    </main>
  );
}

async function CategoriesWorkspace() {
  const categories = await getAdminCategories();

  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <AdminSection title="Categorie nouă">
        <CategoryForm prefix="new-category" />
      </AdminSection>

      <AdminSection
        title="Categorii existente"
        description={`${categories.length} înregistrări`}
      >
        {categories.length === 0 ? (
          <AdminEmptyState>
            Nu există categorii în baza de date.
          </AdminEmptyState>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <details
                key={category.id}
                className="border-obsidian/15 group border"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{category.name}</p>
                      <AdminStatusBadge status={category.status} />
                    </div>
                    <p className="text-steel mt-1 text-xs">
                      /{category.slug} · {category.modelCount} modele
                    </p>
                  </div>
                  <span className="text-veridian-dark text-xs font-bold group-open:hidden">
                    Editează
                  </span>
                </summary>
                <div className="border-obsidian/10 border-t p-4">
                  <CategoryForm prefix={category.id} value={category} />
                  {category.status !== "archived" && (
                    <AdminActionForm
                      action={archiveCategoryAction.bind(null, category.id)}
                      submitLabel="Arhivează categoria"
                      buttonVariant="destructive"
                      className="border-obsidian/10 mt-6 border-t pt-5"
                    />
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}

function CategoryForm({
  prefix,
  value,
}: {
  prefix: string;
  value?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    sortOrder: number;
    status: "draft" | "published" | "archived";
  };
}) {
  return (
    <AdminActionForm
      action={saveCategoryAction}
      submitLabel={value ? "Actualizează" : "Creează categoria"}
    >
      {value && <input type="hidden" name="id" value={value.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Nume" htmlFor={`${prefix}-name`}>
          <Input
            id={`${prefix}-name`}
            name="name"
            defaultValue={value?.name}
            required
          />
        </AdminField>
        <AdminField label="Slug" htmlFor={`${prefix}-slug`}>
          <Input
            id={`${prefix}-slug`}
            name="slug"
            defaultValue={value?.slug}
            required
          />
        </AdminField>
      </div>
      <AdminField label="Descriere" htmlFor={`${prefix}-description`}>
        <Textarea
          id={`${prefix}-description`}
          name="description"
          rows={3}
          defaultValue={value?.description}
          required
        />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Ordine" htmlFor={`${prefix}-sort`}>
          <Input
            id={`${prefix}-sort`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={value?.sortOrder ?? 0}
            required
          />
        </AdminField>
        <AdminField label="Stare" htmlFor={`${prefix}-status`}>
          <NativeSelect
            id={`${prefix}-status`}
            name="status"
            defaultValue={value?.status ?? "draft"}
            className="w-full"
          >
            <NativeSelectOption value="draft">Draft</NativeSelectOption>
            <NativeSelectOption value="published">Publicată</NativeSelectOption>
            <NativeSelectOption value="archived">Arhivată</NativeSelectOption>
          </NativeSelect>
        </AdminField>
      </div>
    </AdminActionForm>
  );
}
