import type { Metadata } from "next";
import { Suspense } from "react";

import {
  archiveInventoryAction,
  saveInventoryAction,
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
import { getAdminInventoryWorkspace } from "@/data/queries/admin-catalogue";

export const metadata: Metadata = { title: "Stoc" };

export default function AdminInventoryPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Inventar"
        title="Stoc"
        description="Administrează unitățile fizice, inclusiv datele private. Doar înregistrările în tranzit sau disponibile pot fi afișate public."
      />
      <Suspense fallback={<p className="mt-10 text-sm">Se încarcă…</p>}>
        <InventoryWorkspace />
      </Suspense>
    </main>
  );
}

async function InventoryWorkspace() {
  const workspace = await getAdminInventoryWorkspace();

  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
      <AdminSection title="Unitate nouă">
        {workspace.models.length ? (
          <InventoryForm models={workspace.models} />
        ) : (
          <AdminEmptyState>
            Creează mai întâi un model ne-arhivat.
          </AdminEmptyState>
        )}
      </AdminSection>

      <AdminSection
        title="Unități existente"
        description={`${workspace.units.length} înregistrări`}
      >
        {workspace.units.length === 0 ? (
          <AdminEmptyState>Inventarul este gol.</AdminEmptyState>
        ) : (
          <div className="grid gap-3">
            {workspace.units.map((unit) => (
              <details key={unit.id} className="border-obsidian/15 border">
                <summary className="cursor-pointer list-none p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{unit.stockCode}</p>
                    <AdminStatusBadge status={unit.status} />
                    {unit.isPublic && (
                      <span className="text-veridian-dark text-xs font-bold">
                        public
                      </span>
                    )}
                  </div>
                  <p className="text-steel mt-1 text-xs">
                    {unit.modelName} · {unit.colour} · {unit.year} ·{" "}
                    {(unit.priceMinor / 100).toFixed(2)} RON
                  </p>
                </summary>
                <div className="border-obsidian/10 border-t p-4">
                  <InventoryForm models={workspace.models} unit={unit} />
                  <EntityMediaEditor
                    kind="inventory"
                    entityId={unit.id}
                    attached={workspace.media.filter(
                      (media) => media.inventoryUnitId === unit.id,
                    )}
                    mediaLibrary={workspace.mediaLibrary}
                  />
                  {unit.status !== "archived" && (
                    <AdminActionForm
                      action={archiveInventoryAction.bind(null, unit.id)}
                      submitLabel="Arhivează și ascunde"
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

type ModelOption = { id: string; name: string; basePriceMinor: number };
type InventoryValue = {
  id: string;
  modelId: string;
  stockCode: string;
  vin: string | null;
  condition: "new" | "used" | "demo";
  year: number;
  mileageKm: number;
  colour: string;
  priceMinor: number;
  status: "incoming" | "available" | "reserved" | "sold" | "archived";
  isPublic: boolean;
  privateNotes: string | null;
};

function InventoryForm({
  models,
  unit,
}: {
  models: readonly ModelOption[];
  unit?: InventoryValue;
}) {
  const prefix = unit?.id ?? "new-inventory";
  const defaultModel =
    models.find((model) => model.id === unit?.modelId) ?? models[0];

  return (
    <AdminActionForm
      action={saveInventoryAction}
      submitLabel={unit ? "Actualizează unitatea" : "Creează unitatea"}
    >
      {unit && <input type="hidden" name="id" value={unit.id} />}
      <AdminField label="Model" htmlFor={`${prefix}-model`}>
        <NativeSelect
          id={`${prefix}-model`}
          name="modelId"
          defaultValue={unit?.modelId ?? defaultModel?.id}
          className="w-full"
          required
        >
          {models.map((model) => (
            <NativeSelectOption key={model.id} value={model.id}>
              {model.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Cod stoc" htmlFor={`${prefix}-stock-code`}>
          <Input
            id={`${prefix}-stock-code`}
            name="stockCode"
            defaultValue={unit?.stockCode}
            required
          />
        </AdminField>
        <AdminField
          label="VIN privat"
          htmlFor={`${prefix}-vin`}
          hint="Opțional; 17 caractere; nu intră în DTO-ul public."
        >
          <Input
            id={`${prefix}-vin`}
            name="vin"
            defaultValue={unit?.vin ?? ""}
            maxLength={17}
          />
        </AdminField>
        <AdminField label="Condiție" htmlFor={`${prefix}-condition`}>
          <NativeSelect
            id={`${prefix}-condition`}
            name="condition"
            defaultValue={unit?.condition ?? "new"}
            className="w-full"
          >
            <NativeSelectOption value="new">Nouă</NativeSelectOption>
            <NativeSelectOption value="used">Rulată</NativeSelectOption>
            <NativeSelectOption value="demo">Demo</NativeSelectOption>
          </NativeSelect>
        </AdminField>
        <AdminField label="Stare" htmlFor={`${prefix}-status`}>
          <NativeSelect
            id={`${prefix}-status`}
            name="status"
            defaultValue={unit?.status ?? "incoming"}
            className="w-full"
          >
            <NativeSelectOption value="incoming">În tranzit</NativeSelectOption>
            <NativeSelectOption value="available">
              Disponibilă
            </NativeSelectOption>
            <NativeSelectOption value="reserved">Rezervată</NativeSelectOption>
            <NativeSelectOption value="sold">Vândută</NativeSelectOption>
            <NativeSelectOption value="archived">Arhivată</NativeSelectOption>
          </NativeSelect>
        </AdminField>
        <AdminField label="An" htmlFor={`${prefix}-year`}>
          <Input
            id={`${prefix}-year`}
            name="year"
            type="number"
            min={1990}
            max={2100}
            defaultValue={unit?.year ?? 2026}
            required
          />
        </AdminField>
        <AdminField label="Kilometraj" htmlFor={`${prefix}-mileage`}>
          <Input
            id={`${prefix}-mileage`}
            name="mileageKm"
            type="number"
            min={0}
            defaultValue={unit?.mileageKm ?? 0}
            required
          />
        </AdminField>
        <AdminField label="Culoare" htmlFor={`${prefix}-colour`}>
          <Input
            id={`${prefix}-colour`}
            name="colour"
            defaultValue={unit?.colour}
            required
          />
        </AdminField>
        <AdminField label="Preț real (RON)" htmlFor={`${prefix}-price`}>
          <Input
            id={`${prefix}-price`}
            name="price"
            inputMode="decimal"
            defaultValue={
              unit
                ? (unit.priceMinor / 100).toFixed(2)
                : defaultModel
                  ? (defaultModel.basePriceMinor / 100).toFixed(2)
                  : ""
            }
            required
          />
        </AdminField>
      </div>
      <AdminCheckbox
        id={`${prefix}-public`}
        name="isPublic"
        label="Vizibilă public"
        description="Permis doar pentru stările în tranzit și disponibilă."
        defaultChecked={unit?.isPublic}
      />
      <AdminField label="Note private" htmlFor={`${prefix}-notes`}>
        <Textarea
          id={`${prefix}-notes`}
          name="privateNotes"
          rows={3}
          defaultValue={unit?.privateNotes ?? ""}
        />
      </AdminField>
    </AdminActionForm>
  );
}
