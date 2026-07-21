import {
  deleteModelFeatureAction,
  saveModelFeatureAction,
} from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminCheckbox, AdminField } from "@/components/admin/form-field";
import { AdminEmptyState } from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";

type Feature = {
  id: string;
  modelId: string;
  groupName: string;
  label: string;
  value: string | null;
  isStandard: boolean;
  sortOrder: number;
};

export function ModelFeatureEditor({
  modelId,
  features,
}: {
  modelId: string;
  features: readonly Feature[];
}) {
  return (
    <div className="grid gap-5">
      {features.length === 0 ? (
        <AdminEmptyState>
          Nu există încă echipări sau specificații editoriale.
        </AdminEmptyState>
      ) : (
        <div className="grid gap-3">
          {features.map((feature) => (
            <details key={feature.id} className="border-obsidian/15 border">
              <summary className="cursor-pointer list-none p-4">
                <p className="font-semibold">{feature.label}</p>
                <p className="text-steel mt-1 text-xs">
                  {feature.groupName}
                  {feature.value ? ` · ${feature.value}` : ""}
                  {feature.isStandard ? " · standard" : ""}
                </p>
              </summary>
              <div className="border-obsidian/10 border-t p-4">
                <FeatureForm modelId={modelId} feature={feature} />
                <AdminActionForm
                  action={deleteModelFeatureAction.bind(
                    null,
                    feature.id,
                    modelId,
                  )}
                  submitLabel="Elimină echiparea"
                  buttonVariant="destructive"
                  className="border-obsidian/10 mt-5 border-t pt-5"
                />
              </div>
            </details>
          ))}
        </div>
      )}

      <details
        className="border-veridian-dark/30 border"
        open={!features.length}
      >
        <summary className="text-veridian-dark cursor-pointer list-none p-4 text-sm font-bold">
          Adaugă echipare sau specificație
        </summary>
        <div className="border-veridian-dark/20 border-t p-4">
          <FeatureForm modelId={modelId} />
        </div>
      </details>
    </div>
  );
}

function FeatureForm({
  modelId,
  feature,
}: {
  modelId: string;
  feature?: Feature;
}) {
  const prefix = feature?.id ?? `${modelId}-new-feature`;

  return (
    <AdminActionForm
      action={saveModelFeatureAction}
      submitLabel={feature ? "Actualizează echiparea" : "Adaugă echiparea"}
    >
      <input type="hidden" name="modelId" value={modelId} />
      {feature && <input type="hidden" name="id" value={feature.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Grup" htmlFor={`${prefix}-group`}>
          <Input
            id={`${prefix}-group`}
            name="groupName"
            defaultValue={feature?.groupName ?? "Echipare standard"}
            required
          />
        </AdminField>
        <AdminField label="Ordine" htmlFor={`${prefix}-sort`}>
          <Input
            id={`${prefix}-sort`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={feature?.sortOrder ?? 0}
            required
          />
        </AdminField>
        <AdminField label="Etichetă" htmlFor={`${prefix}-label`}>
          <Input
            id={`${prefix}-label`}
            name="label"
            defaultValue={feature?.label}
            required
          />
        </AdminField>
        <AdminField label="Valoare opțională" htmlFor={`${prefix}-value`}>
          <Input
            id={`${prefix}-value`}
            name="value"
            defaultValue={feature?.value ?? ""}
          />
        </AdminField>
      </div>
      <AdminCheckbox
        id={`${prefix}-standard`}
        name="isStandard"
        label="Echipare standard"
        defaultChecked={feature?.isStandard ?? true}
      />
    </AdminActionForm>
  );
}
