import type { Metadata } from "next";
import { Suspense } from "react";

import {
  archiveAccessoryAction,
  archiveAccessoryCategoryAction,
  saveAccessoryAction,
  saveAccessoryCategoryAction,
} from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminCheckbox, AdminField } from "@/components/admin/form-field";
import { EntityMediaEditor } from "@/components/admin/entity-media-editor";
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
import { getAdminAccessoryWorkspace } from "@/data/queries/admin-catalogue";

export const metadata: Metadata = { title: "Accesorii" };

export default function AdminAccessoriesPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Accesorii"
        description="Administrează categoriile, prețurile, stocul intern și compatibilitatea cu modelele. Cantitățile interne nu părăsesc atelierul."
      />
      <Suspense fallback={<p className="mt-10 text-sm">Se încarcă…</p>}>
        <AccessoryWorkspace />
      </Suspense>
    </main>
  );
}

async function AccessoryWorkspace() {
  const workspace = await getAdminAccessoryWorkspace();

  return (
    <div className="mt-10 grid gap-8">
      <AdminSection
        title="Categorii de accesorii"
        description="O categorie trebuie publicată înaintea accesoriilor sale."
      >
        <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
          <AccessoryCategoryForm prefix="new-accessory-category" />
          {workspace.categories.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {workspace.categories.map((category) => (
                <details
                  key={category.id}
                  className="border-obsidian/15 border"
                >
                  <summary className="cursor-pointer list-none p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{category.name}</span>
                      <AdminStatusBadge status={category.status} />
                    </div>
                    <p className="text-steel mt-1 text-xs">/{category.slug}</p>
                  </summary>
                  <div className="border-obsidian/10 border-t p-3">
                    <AccessoryCategoryForm
                      prefix={category.id}
                      value={category}
                    />
                    {category.status !== "archived" && (
                      <AdminActionForm
                        action={archiveAccessoryCategoryAction.bind(
                          null,
                          category.id,
                        )}
                        submitLabel="Arhivează categoria"
                        buttonVariant="destructive"
                        className="border-obsidian/10 mt-5 border-t pt-5"
                      />
                    )}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <AdminEmptyState>Nu există categorii de accesorii.</AdminEmptyState>
          )}
        </div>
      </AdminSection>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr] xl:items-start">
        <AdminSection title="Accesoriu nou">
          {workspace.categories.length ? (
            <AccessoryForm
              categories={workspace.categories}
              models={workspace.models}
            />
          ) : (
            <AdminEmptyState>
              Creează mai întâi o categorie de accesorii.
            </AdminEmptyState>
          )}
        </AdminSection>

        <AdminSection
          title="Accesorii existente"
          description={`${workspace.accessories.length} înregistrări`}
        >
          {workspace.accessories.length ? (
            <div className="grid gap-3">
              {workspace.accessories.map((accessory) => {
                const compatibleIds = workspace.compatibility
                  .filter((item) => item.accessoryId === accessory.id)
                  .map((item) => item.modelId);
                return (
                  <details
                    key={accessory.id}
                    className="border-obsidian/15 border"
                  >
                    <summary className="cursor-pointer list-none p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{accessory.name}</p>
                        <AdminStatusBadge status={accessory.status} />
                        <AdminStatusBadge status={accessory.stockState} />
                      </div>
                      <p className="text-steel mt-1 text-xs">
                        {accessory.sku} · {accessory.categoryName} ·{" "}
                        {(accessory.priceMinor / 100).toFixed(2)} RON ·{" "}
                        {compatibleIds.length} modele compatibile
                      </p>
                    </summary>
                    <div className="border-obsidian/10 border-t p-4">
                      <AccessoryForm
                        categories={workspace.categories}
                        models={workspace.models}
                        accessory={accessory}
                        compatibleIds={compatibleIds}
                      />
                      <EntityMediaEditor
                        kind="accessory"
                        entityId={accessory.id}
                        attached={workspace.media.filter(
                          (media) => media.accessoryId === accessory.id,
                        )}
                        mediaLibrary={workspace.mediaLibrary}
                      />
                      {accessory.status !== "archived" && (
                        <AdminActionForm
                          action={archiveAccessoryAction.bind(
                            null,
                            accessory.id,
                          )}
                          submitLabel="Arhivează accesoriul"
                          buttonVariant="destructive"
                          className="border-obsidian/10 mt-5 border-t pt-5"
                        />
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <AdminEmptyState>Nu există accesorii.</AdminEmptyState>
          )}
        </AdminSection>
      </div>
    </div>
  );
}

type AccessoryCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  status: "draft" | "published" | "archived";
};

function AccessoryCategoryForm({
  prefix,
  value,
}: {
  prefix: string;
  value?: AccessoryCategory;
}) {
  return (
    <AdminActionForm
      action={saveAccessoryCategoryAction}
      submitLabel={value ? "Actualizează" : "Creează categoria"}
    >
      {value && <input type="hidden" name="id" value={value.id} />}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Ordine" htmlFor={`${prefix}-sort`}>
          <Input
            id={`${prefix}-sort`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={value?.sortOrder ?? 0}
          />
        </AdminField>
        <AdminField label="Stare" htmlFor={`${prefix}-status`}>
          <ContentStatusSelect
            id={`${prefix}-status`}
            defaultValue={value?.status ?? "draft"}
          />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

type AccessoryValue = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  summary: string;
  description: string;
  priceMinor: number;
  stockState: "in_stock" | "low_stock" | "preorder" | "unavailable";
  internalQuantity: number | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
};

function AccessoryForm({
  categories,
  models,
  accessory,
  compatibleIds = [],
}: {
  categories: readonly AccessoryCategory[];
  models: readonly { id: string; name: string }[];
  accessory?: AccessoryValue;
  compatibleIds?: readonly string[];
}) {
  const prefix = accessory?.id ?? "new-accessory";

  return (
    <AdminActionForm
      action={saveAccessoryAction}
      submitLabel={accessory ? "Actualizează accesoriul" : "Creează accesoriul"}
    >
      {accessory && <input type="hidden" name="id" value={accessory.id} />}
      <AdminField label="Categorie" htmlFor={`${prefix}-category`}>
        <NativeSelect
          id={`${prefix}-category`}
          name="categoryId"
          defaultValue={accessory?.categoryId ?? categories[0]?.id}
          className="w-full"
          required
        >
          {categories.map((category) => (
            <NativeSelectOption key={category.id} value={category.id}>
              {category.name}
              {category.status !== "published" ? " — nepublicată" : ""}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Nume" htmlFor={`${prefix}-name`}>
          <Input
            id={`${prefix}-name`}
            name="name"
            defaultValue={accessory?.name}
            required
          />
        </AdminField>
        <AdminField label="SKU" htmlFor={`${prefix}-sku`}>
          <Input
            id={`${prefix}-sku`}
            name="sku"
            defaultValue={accessory?.sku}
            required
          />
        </AdminField>
        <AdminField label="Slug" htmlFor={`${prefix}-slug`}>
          <Input
            id={`${prefix}-slug`}
            name="slug"
            defaultValue={accessory?.slug}
            required
          />
        </AdminField>
        <AdminField label="Preț (RON)" htmlFor={`${prefix}-price`}>
          <Input
            id={`${prefix}-price`}
            name="price"
            inputMode="decimal"
            defaultValue={
              accessory ? (accessory.priceMinor / 100).toFixed(2) : "0.00"
            }
            required
          />
        </AdminField>
      </div>
      <AdminField label="Rezumat" htmlFor={`${prefix}-summary`}>
        <Textarea
          id={`${prefix}-summary`}
          name="summary"
          rows={2}
          defaultValue={accessory?.summary}
          required
        />
      </AdminField>
      <AdminField label="Descriere" htmlFor={`${prefix}-description`}>
        <Textarea
          id={`${prefix}-description`}
          name="description"
          rows={4}
          defaultValue={accessory?.description}
          required
        />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminField label="Stoc" htmlFor={`${prefix}-stock-state`}>
          <NativeSelect
            id={`${prefix}-stock-state`}
            name="stockState"
            defaultValue={accessory?.stockState ?? "unavailable"}
            className="w-full"
          >
            <NativeSelectOption value="in_stock">În stoc</NativeSelectOption>
            <NativeSelectOption value="low_stock">
              Stoc redus
            </NativeSelectOption>
            <NativeSelectOption value="preorder">Precomandă</NativeSelectOption>
            <NativeSelectOption value="unavailable">
              Indisponibil
            </NativeSelectOption>
          </NativeSelect>
        </AdminField>
        <AdminField label="Cantitate internă" htmlFor={`${prefix}-quantity`}>
          <Input
            id={`${prefix}-quantity`}
            name="internalQuantity"
            type="number"
            min={0}
            defaultValue={accessory?.internalQuantity ?? ""}
          />
        </AdminField>
        <AdminField label="Stare editorială" htmlFor={`${prefix}-status`}>
          <ContentStatusSelect
            id={`${prefix}-status`}
            defaultValue={accessory?.status ?? "draft"}
          />
        </AdminField>
      </div>
      <AdminCheckbox
        id={`${prefix}-featured`}
        name="featured"
        label="Accesoriu recomandat"
        defaultChecked={accessory?.featured}
      />
      <fieldset className="border-obsidian/15 border p-4">
        <legend className="px-2 text-sm font-semibold">
          Modele compatibile
        </legend>
        {models.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {models.map((model) => (
              <AdminCheckbox
                key={model.id}
                id={`${prefix}-model-${model.id}`}
                name="compatibleModelIds"
                value={model.id}
                label={model.name}
                defaultChecked={compatibleIds.includes(model.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-steel text-sm">Nu există modele active.</p>
        )}
      </fieldset>
    </AdminActionForm>
  );
}

function ContentStatusSelect({
  id,
  defaultValue,
}: {
  id: string;
  defaultValue: string;
}) {
  return (
    <NativeSelect
      id={id}
      name="status"
      defaultValue={defaultValue}
      className="w-full"
    >
      <NativeSelectOption value="draft">Draft</NativeSelectOption>
      <NativeSelectOption value="published">Publicat</NativeSelectOption>
      <NativeSelectOption value="archived">Arhivat</NativeSelectOption>
    </NativeSelect>
  );
}
