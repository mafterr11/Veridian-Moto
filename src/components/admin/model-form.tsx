import { AdminActionForm } from "@/components/admin/action-form";
import { AdminCheckbox, AdminField } from "@/components/admin/form-field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminFormState } from "@/domain/admin/form-state";

type ModelFormValue = {
  id?: string;
  categoryId?: string;
  name?: string;
  slug?: string;
  tagline?: string;
  summary?: string;
  description?: string;
  modelYear?: number;
  basePriceMinor?: number;
  displacementCc?: number | null;
  powerHp?: number;
  torqueNm?: number;
  wetWeightKg?: number;
  seatHeightMm?: number;
  featured?: boolean;
  configuratorEnabled?: boolean;
};

function moneyInput(minor?: number) {
  return minor === undefined ? "" : (minor / 100).toFixed(2);
}

export function ModelForm({
  action,
  categories,
  value,
  submitLabel,
}: {
  action: (
    state: AdminFormState,
    formData: FormData,
  ) => Promise<AdminFormState>;
  categories: readonly { id: string; name: string; status: string }[];
  value?: ModelFormValue;
  submitLabel: string;
}) {
  const prefix = value?.id ?? "new-model";

  return (
    <AdminActionForm action={action} submitLabel={submitLabel}>
      {value?.id && <input type="hidden" name="id" value={value.id} />}

      <div className="grid gap-5 md:grid-cols-2">
        <AdminField label="Categorie" htmlFor={`${prefix}-category`}>
          <NativeSelect
            id={`${prefix}-category`}
            name="categoryId"
            defaultValue={value?.categoryId}
            required
            className="w-full"
          >
            <NativeSelectOption value="">
              Selectează categoria
            </NativeSelectOption>
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
                {category.status !== "published" ? " — nepublicată" : ""}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </AdminField>
        <AdminField label="An model" htmlFor={`${prefix}-year`}>
          <Input
            id={`${prefix}-year`}
            name="modelYear"
            type="number"
            min={2020}
            max={2100}
            defaultValue={value?.modelYear ?? 2026}
            required
          />
        </AdminField>
        <AdminField label="Nume" htmlFor={`${prefix}-name`}>
          <Input
            id={`${prefix}-name`}
            name="name"
            defaultValue={value?.name}
            maxLength={120}
            required
          />
        </AdminField>
        <AdminField
          label="Slug"
          htmlFor={`${prefix}-slug`}
          hint="Litere mici fără diacritice, cifre și cratime."
        >
          <Input
            id={`${prefix}-slug`}
            name="slug"
            defaultValue={value?.slug}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </AdminField>
      </div>

      <AdminField label="Tagline" htmlFor={`${prefix}-tagline`}>
        <Input
          id={`${prefix}-tagline`}
          name="tagline"
          defaultValue={value?.tagline}
          maxLength={200}
          required
        />
      </AdminField>
      <AdminField label="Rezumat" htmlFor={`${prefix}-summary`}>
        <Textarea
          id={`${prefix}-summary`}
          name="summary"
          defaultValue={value?.summary}
          rows={3}
          maxLength={600}
          required
        />
      </AdminField>
      <AdminField label="Descriere completă" htmlFor={`${prefix}-description`}>
        <Textarea
          id={`${prefix}-description`}
          name="description"
          defaultValue={value?.description}
          rows={7}
          maxLength={10_000}
          required
        />
      </AdminField>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AdminField label="Preț de bază (RON)" htmlFor={`${prefix}-price`}>
          <Input
            id={`${prefix}-price`}
            name="basePrice"
            inputMode="decimal"
            defaultValue={moneyInput(value?.basePriceMinor)}
            placeholder="49990.00"
            required
          />
        </AdminField>
        <AdminField
          label="Cilindree (cm³)"
          htmlFor={`${prefix}-displacement`}
          hint="Lasă gol pentru un model electric."
        >
          <Input
            id={`${prefix}-displacement`}
            name="displacementCc"
            type="number"
            min={1}
            defaultValue={value?.displacementCc ?? ""}
          />
        </AdminField>
        <AdminField label="Putere (CP)" htmlFor={`${prefix}-power`}>
          <Input
            id={`${prefix}-power`}
            name="powerHp"
            type="number"
            min={1}
            defaultValue={value?.powerHp}
            required
          />
        </AdminField>
        <AdminField label="Cuplu (Nm)" htmlFor={`${prefix}-torque`}>
          <Input
            id={`${prefix}-torque`}
            name="torqueNm"
            type="number"
            min={1}
            defaultValue={value?.torqueNm}
            required
          />
        </AdminField>
        <AdminField label="Greutate la plin (kg)" htmlFor={`${prefix}-weight`}>
          <Input
            id={`${prefix}-weight`}
            name="wetWeightKg"
            type="number"
            min={1}
            defaultValue={value?.wetWeightKg}
            required
          />
        </AdminField>
        <AdminField label="Înălțime șa (mm)" htmlFor={`${prefix}-seat`}>
          <Input
            id={`${prefix}-seat`}
            name="seatHeightMm"
            type="number"
            min={1}
            defaultValue={value?.seatHeightMm}
            required
          />
        </AdminField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminCheckbox
          id={`${prefix}-featured`}
          name="featured"
          label="Model recomandat"
          description="Poate apărea în selecțiile editoriale ale paginii principale."
          defaultChecked={value?.featured}
        />
        <AdminCheckbox
          id={`${prefix}-configurator`}
          name="configuratorEnabled"
          label="Configurator activ"
          description="Publicarea va cere grupuri și opțiuni valide."
          defaultChecked={value?.configuratorEnabled}
        />
      </div>
    </AdminActionForm>
  );
}
