import {
  archiveOptionChoiceAction,
  archiveOptionGroupAction,
  deleteOptionRuleAction,
  saveOptionChoiceAction,
  saveOptionGroupAction,
  saveOptionRuleAction,
} from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminCheckbox, AdminField } from "@/components/admin/form-field";
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

type Group = {
  id: string;
  modelId: string;
  key: string;
  name: string;
  description: string;
  selectionType: "single" | "multiple";
  required: boolean;
  minSelected: number;
  maxSelected: number;
  sortOrder: number;
  status: "draft" | "published" | "archived";
};

type Choice = {
  id: string;
  groupId: string;
  code: string;
  name: string;
  description: string;
  priceDeltaMinor: number;
  swatchHex: string | null;
  accessoryId: string | null;
  mediaId: string | null;
  isStandard: boolean;
  sortOrder: number;
  status: "draft" | "published" | "archived";
};

type Rule = {
  id: string;
  sourceChoiceId: string;
  targetChoiceId: string;
  ruleType: "requires" | "excludes";
  explanation: string;
};

type Accessory = { id: string; name: string; sku: string };
type MediaItem = { id: string; altText: string };

export function ModelConfigurationEditor({
  modelId,
  groups,
  choices,
  rules,
  accessories,
  mediaLibrary,
}: {
  modelId: string;
  groups: readonly Group[];
  choices: readonly Choice[];
  rules: readonly Rule[];
  accessories: readonly Accessory[];
  mediaLibrary: readonly MediaItem[];
}) {
  const choiceNames = new Map(
    choices.map((choice) => [choice.id, choice.name]),
  );

  return (
    <div className="grid gap-6">
      {groups.length === 0 ? (
        <AdminEmptyState>
          Configuratorul nu are grupuri. Creează primul grup înainte de
          publicare.
        </AdminEmptyState>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => {
            const groupChoices = choices.filter(
              (choice) => choice.groupId === group.id,
            );
            return (
              <details
                key={group.id}
                className="border-obsidian/15 border"
                open={groups.length === 1}
              >
                <summary className="cursor-pointer list-none p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-xl font-bold uppercase">
                      {group.name}
                    </p>
                    <AdminStatusBadge status={group.status} />
                  </div>
                  <p className="text-steel mt-1 text-xs">
                    {group.selectionType === "single"
                      ? "Alegere unică"
                      : "Alegere multiplă"}
                    {group.required ? " · obligatoriu" : " · opțional"} ·{" "}
                    {groupChoices.length} opțiuni
                  </p>
                </summary>
                <div className="border-obsidian/10 grid gap-6 border-t p-4">
                  <OptionGroupForm modelId={modelId} group={group} />
                  {group.status !== "archived" && (
                    <AdminActionForm
                      action={archiveOptionGroupAction.bind(
                        null,
                        group.id,
                        modelId,
                      )}
                      submitLabel="Arhivează grupul"
                      buttonVariant="destructive"
                    />
                  )}

                  <div className="border-obsidian/10 border-t pt-5">
                    <h3 className="font-heading text-xl font-bold uppercase">
                      Opțiuni
                    </h3>
                    <div className="mt-3 grid gap-3">
                      {groupChoices.map((choice) => (
                        <details
                          key={choice.id}
                          className="border-obsidian/15 border"
                        >
                          <summary className="cursor-pointer list-none p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold">
                                {choice.name}
                              </span>
                              <AdminStatusBadge status={choice.status} />
                              {choice.isStandard && (
                                <span className="text-veridian-dark text-xs font-bold">
                                  implicit
                                </span>
                              )}
                            </div>
                            <p className="text-steel mt-1 text-xs">
                              {choice.code} · +
                              {(choice.priceDeltaMinor / 100).toFixed(2)} RON
                            </p>
                          </summary>
                          <div className="border-obsidian/10 border-t p-3">
                            <OptionChoiceForm
                              modelId={modelId}
                              groupId={group.id}
                              choice={choice}
                              accessories={accessories}
                              mediaLibrary={mediaLibrary}
                            />
                            {choice.status !== "archived" && (
                              <AdminActionForm
                                action={archiveOptionChoiceAction.bind(
                                  null,
                                  choice.id,
                                  modelId,
                                )}
                                submitLabel="Arhivează opțiunea"
                                buttonVariant="destructive"
                                className="border-obsidian/10 mt-5 border-t pt-5"
                              />
                            )}
                          </div>
                        </details>
                      ))}
                    </div>

                    {group.status !== "archived" && (
                      <details className="border-veridian-dark/30 mt-3 border">
                        <summary className="text-veridian-dark cursor-pointer list-none p-3 text-sm font-bold">
                          Adaugă opțiune în {group.name}
                        </summary>
                        <div className="border-veridian-dark/20 border-t p-3">
                          <OptionChoiceForm
                            modelId={modelId}
                            groupId={group.id}
                            accessories={accessories}
                            mediaLibrary={mediaLibrary}
                          />
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      <details className="border-veridian-dark/30 border" open={!groups.length}>
        <summary className="text-veridian-dark cursor-pointer list-none p-4 text-sm font-bold">
          Adaugă grup de configurare
        </summary>
        <div className="border-veridian-dark/20 border-t p-4">
          <OptionGroupForm modelId={modelId} />
        </div>
      </details>

      <div className="border-obsidian/15 border p-4">
        <h3 className="font-heading text-xl font-bold uppercase">
          Reguli de compatibilitate
        </h3>
        {rules.length ? (
          <div className="mt-3 grid gap-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="border-obsidian/10 grid gap-3 border p-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <p className="text-sm">
                  <strong>
                    {choiceNames.get(rule.sourceChoiceId) ?? "Opțiune"}
                  </strong>{" "}
                  {rule.ruleType === "requires" ? "necesită" : "exclude"}{" "}
                  <strong>
                    {choiceNames.get(rule.targetChoiceId) ?? "opțiune"}
                  </strong>
                  <span className="text-steel block text-xs leading-5">
                    {rule.explanation}
                  </span>
                </p>
                <AdminActionForm
                  action={deleteOptionRuleAction.bind(null, rule.id, modelId)}
                  submitLabel="Elimină"
                  buttonVariant="destructive"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-steel mt-2 text-sm">Nu există reguli.</p>
        )}

        {choices.length >= 2 && (
          <details className="border-veridian-dark/30 mt-4 border">
            <summary className="text-veridian-dark cursor-pointer list-none p-3 text-sm font-bold">
              Adaugă regulă
            </summary>
            <div className="border-veridian-dark/20 border-t p-3">
              <AdminActionForm
                action={saveOptionRuleAction}
                submitLabel="Adaugă regula"
              >
                <input type="hidden" name="modelId" value={modelId} />
                <div className="grid gap-4 md:grid-cols-3">
                  <ChoiceSelect
                    id={`${modelId}-rule-source`}
                    name="sourceChoiceId"
                    label="Opțiunea sursă"
                    choices={choices}
                  />
                  <AdminField label="Relație" htmlFor={`${modelId}-rule-type`}>
                    <NativeSelect
                      id={`${modelId}-rule-type`}
                      name="ruleType"
                      className="w-full"
                    >
                      <NativeSelectOption value="requires">
                        Necesită
                      </NativeSelectOption>
                      <NativeSelectOption value="excludes">
                        Exclude
                      </NativeSelectOption>
                    </NativeSelect>
                  </AdminField>
                  <ChoiceSelect
                    id={`${modelId}-rule-target`}
                    name="targetChoiceId"
                    label="Opțiunea țintă"
                    choices={choices}
                  />
                </div>
                <AdminField
                  label="Explicație pentru utilizator"
                  htmlFor={`${modelId}-rule-explanation`}
                >
                  <Input
                    id={`${modelId}-rule-explanation`}
                    name="explanation"
                    required
                  />
                </AdminField>
              </AdminActionForm>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function OptionGroupForm({
  modelId,
  group,
}: {
  modelId: string;
  group?: Group;
}) {
  const prefix = group?.id ?? `${modelId}-new-group`;
  return (
    <AdminActionForm
      action={saveOptionGroupAction}
      submitLabel={group ? "Actualizează grupul" : "Creează grupul"}
    >
      <input type="hidden" name="modelId" value={modelId} />
      {group && <input type="hidden" name="id" value={group.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Cheie" htmlFor={`${prefix}-key`}>
          <Input
            id={`${prefix}-key`}
            name="key"
            defaultValue={group?.key}
            placeholder="culoare"
            required
          />
        </AdminField>
        <AdminField label="Nume" htmlFor={`${prefix}-name`}>
          <Input
            id={`${prefix}-name`}
            name="name"
            defaultValue={group?.name}
            required
          />
        </AdminField>
      </div>
      <AdminField label="Descriere" htmlFor={`${prefix}-description`}>
        <Textarea
          id={`${prefix}-description`}
          name="description"
          defaultValue={group?.description}
          rows={2}
          required
        />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminField label="Tip" htmlFor={`${prefix}-type`}>
          <NativeSelect
            id={`${prefix}-type`}
            name="selectionType"
            defaultValue={group?.selectionType ?? "single"}
            className="w-full"
          >
            <NativeSelectOption value="single">Unică</NativeSelectOption>
            <NativeSelectOption value="multiple">Multiplă</NativeSelectOption>
          </NativeSelect>
        </AdminField>
        <AdminField label="Minim" htmlFor={`${prefix}-min`}>
          <Input
            id={`${prefix}-min`}
            name="minSelected"
            type="number"
            min={0}
            defaultValue={group?.minSelected ?? 0}
            required
          />
        </AdminField>
        <AdminField label="Maxim" htmlFor={`${prefix}-max`}>
          <Input
            id={`${prefix}-max`}
            name="maxSelected"
            type="number"
            min={1}
            defaultValue={group?.maxSelected ?? 1}
            required
          />
        </AdminField>
        <AdminField label="Ordine" htmlFor={`${prefix}-sort`}>
          <Input
            id={`${prefix}-sort`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={group?.sortOrder ?? 0}
            required
          />
        </AdminField>
        <AdminField label="Stare" htmlFor={`${prefix}-status`}>
          <StatusSelect
            id={`${prefix}-status`}
            defaultValue={group?.status ?? "draft"}
          />
        </AdminField>
      </div>
      <AdminCheckbox
        id={`${prefix}-required`}
        name="required"
        label="Grup obligatoriu"
        description="Minimul trebuie să fie cel puțin 1."
        defaultChecked={group?.required}
      />
    </AdminActionForm>
  );
}

function OptionChoiceForm({
  modelId,
  groupId,
  choice,
  accessories,
  mediaLibrary,
}: {
  modelId: string;
  groupId: string;
  choice?: Choice;
  accessories: readonly Accessory[];
  mediaLibrary: readonly MediaItem[];
}) {
  const prefix = choice?.id ?? `${groupId}-new-choice`;
  return (
    <AdminActionForm
      action={saveOptionChoiceAction}
      submitLabel={choice ? "Actualizează opțiunea" : "Adaugă opțiunea"}
    >
      <input type="hidden" name="modelId" value={modelId} />
      <input type="hidden" name="groupId" value={groupId} />
      {choice && <input type="hidden" name="id" value={choice.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Cod" htmlFor={`${prefix}-code`}>
          <Input
            id={`${prefix}-code`}
            name="code"
            defaultValue={choice?.code}
            placeholder="verde-veridian"
            required
          />
        </AdminField>
        <AdminField label="Nume" htmlFor={`${prefix}-name`}>
          <Input
            id={`${prefix}-name`}
            name="name"
            defaultValue={choice?.name}
            required
          />
        </AdminField>
      </div>
      <AdminField label="Descriere" htmlFor={`${prefix}-description`}>
        <Textarea
          id={`${prefix}-description`}
          name="description"
          defaultValue={choice?.description}
          rows={2}
          required
        />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminField label="Preț suplimentar (RON)" htmlFor={`${prefix}-price`}>
          <Input
            id={`${prefix}-price`}
            name="priceDelta"
            inputMode="decimal"
            defaultValue={
              choice ? (choice.priceDeltaMinor / 100).toFixed(2) : "0.00"
            }
            required
          />
        </AdminField>
        <AdminField label="Culoare #RRGGBB" htmlFor={`${prefix}-swatch`}>
          <Input
            id={`${prefix}-swatch`}
            name="swatchHex"
            defaultValue={choice?.swatchHex ?? ""}
            placeholder="#00B884"
          />
        </AdminField>
        <AdminField label="Ordine" htmlFor={`${prefix}-sort`}>
          <Input
            id={`${prefix}-sort`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={choice?.sortOrder ?? 0}
            required
          />
        </AdminField>
        <AdminField label="Stare" htmlFor={`${prefix}-status`}>
          <StatusSelect
            id={`${prefix}-status`}
            defaultValue={choice?.status ?? "draft"}
          />
        </AdminField>
      </div>
      <AdminField label="Accesoriu conectat" htmlFor={`${prefix}-accessory`}>
        <NativeSelect
          id={`${prefix}-accessory`}
          name="accessoryId"
          defaultValue={choice?.accessoryId ?? ""}
          className="w-full"
        >
          <NativeSelectOption value="">Fără accesoriu</NativeSelectOption>
          {accessories.map((accessory) => (
            <NativeSelectOption key={accessory.id} value={accessory.id}>
              {accessory.name} · {accessory.sku}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>
      <AdminField label="Imagine opțiune" htmlFor={`${prefix}-media`}>
        <NativeSelect
          id={`${prefix}-media`}
          name="mediaId"
          defaultValue={choice?.mediaId ?? ""}
          className="w-full"
        >
          <NativeSelectOption value="">Imaginea de bază</NativeSelectOption>
          {mediaLibrary.map((media) => (
            <NativeSelectOption key={media.id} value={media.id}>
              {media.altText}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>
      <AdminCheckbox
        id={`${prefix}-standard`}
        name="isStandard"
        label="Alegere implicită / standard"
        defaultChecked={choice?.isStandard}
      />
    </AdminActionForm>
  );
}

function StatusSelect({
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
      <NativeSelectOption value="published">Publicată</NativeSelectOption>
      <NativeSelectOption value="archived">Arhivată</NativeSelectOption>
    </NativeSelect>
  );
}

function ChoiceSelect({
  id,
  name,
  label,
  choices,
}: {
  id: string;
  name: string;
  label: string;
  choices: readonly Choice[];
}) {
  return (
    <AdminField label={label} htmlFor={id}>
      <NativeSelect id={id} name={name} className="w-full" required>
        <NativeSelectOption value="">Selectează</NativeSelectOption>
        {choices.map((choice) => (
          <NativeSelectOption key={choice.id} value={choice.id}>
            {choice.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </AdminField>
  );
}
