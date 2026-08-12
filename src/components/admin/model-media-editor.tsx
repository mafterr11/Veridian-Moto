import {
  assignModelMediaAction,
  removeModelMediaAction,
  uploadModelMediaAction,
} from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminField } from "@/components/admin/form-field";
import {
  MediaPlacementFields,
  type ConfiguratorChoiceItem,
} from "@/components/admin/media-placement-fields";
import {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type AssignedMedia = {
  id: string;
  mediaId: string;
  role: string;
  optionChoiceId: string | null;
  viewAngle: string | null;
  sortOrder: number;
  storagePath: string;
  altText: string;
  width: number;
  height: number;
};

type MediaLibraryItem = {
  id: string;
  storagePath: string;
  altText: string;
  width: number;
  height: number;
};

export function ModelMediaEditor({
  modelId,
  assigned,
  library,
  choices,
}: {
  modelId: string;
  assigned: readonly AssignedMedia[];
  library: readonly MediaLibraryItem[];
  choices: readonly ConfiguratorChoiceItem[];
}) {
  const availableChoices = choices.filter(
    (choice) =>
      choice.status !== "archived" && choice.groupStatus !== "archived",
  );
  const choiceNames = new Map(
    choices.map((choice) => [choice.id, choice.name] as const),
  );

  return (
    <div className="grid gap-6">
      {assigned.length === 0 ? (
        <AdminEmptyState>
          Modelul nu are media. Sunt obligatorii cel puțin rolurile card și
          hero.
        </AdminEmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {assigned.map((media) => (
            <article key={media.id} className="border-obsidian/15 border">
              {/* Admin previews may come from the configured Supabase host. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.storagePath}
                alt={media.altText}
                className="bg-obsidian aspect-[4/3] w-full object-cover"
              />
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge status={media.role} />
                  <span className="text-steel text-xs">
                    {media.width} × {media.height}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5">
                  {media.altText}
                </p>
                <p className="text-steel mt-1 text-xs">
                  {media.viewAngle || "fără unghi"} · ordinea {media.sortOrder}
                </p>
                {media.optionChoiceId ? (
                  <p className="text-steel mt-1 text-xs">
                    Opțiune:{" "}
                    {choiceNames.get(media.optionChoiceId) ?? "indisponibilă"}
                  </p>
                ) : null}
                <AdminActionForm
                  action={removeModelMediaAction.bind(null, media.id, modelId)}
                  submitLabel="Elimină asocierea"
                  buttonVariant="destructive"
                  className="mt-4"
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <details
          className="border-veridian-dark/30 border"
          open={!assigned.length}
        >
          <summary className="text-veridian-dark cursor-pointer list-none p-4 text-sm font-bold">
            Încarcă și asociază o imagine
          </summary>
          <div className="border-veridian-dark/20 border-t p-4">
            <AdminActionForm
              action={uploadModelMediaAction}
              submitLabel="Optimizează și încarcă"
              pendingLabel="Se procesează imaginea"
            >
              <input type="hidden" name="modelId" value={modelId} />
              <AdminField
                label="Fișier"
                htmlFor={`${modelId}-upload-file`}
                hint="JPEG, PNG, WebP sau AVIF; maximum 5 MB; minimum 320 × 240 px."
              >
                <Input
                  id={`${modelId}-upload-file`}
                  name="file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  required
                />
              </AdminField>
              <AdminField
                label="Text alternativ"
                htmlFor={`${modelId}-upload-alt`}
              >
                <Input
                  id={`${modelId}-upload-alt`}
                  name="altText"
                  maxLength={500}
                  required
                />
              </AdminField>
              <MediaPlacementFields
                prefix={`${modelId}-upload`}
                choices={availableChoices}
              />
            </AdminActionForm>
          </div>
        </details>

        <details className="border-obsidian/15 border">
          <summary className="cursor-pointer list-none p-4 text-sm font-bold">
            Asociază din biblioteca existentă
          </summary>
          <div className="border-obsidian/10 border-t p-4">
            {library.length ? (
              <AdminActionForm
                action={assignModelMediaAction}
                submitLabel="Asociază imaginea"
              >
                <input type="hidden" name="modelId" value={modelId} />
                <AdminField
                  label="Imagine"
                  htmlFor={`${modelId}-existing-media`}
                >
                  <NativeSelect
                    id={`${modelId}-existing-media`}
                    name="mediaId"
                    className="w-full"
                    required
                  >
                    <NativeSelectOption value="">Selectează</NativeSelectOption>
                    {library.map((media) => (
                      <NativeSelectOption key={media.id} value={media.id}>
                        {media.altText} · {media.width}×{media.height}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </AdminField>
                <MediaPlacementFields
                  prefix={`${modelId}-existing`}
                  choices={availableChoices}
                />
              </AdminActionForm>
            ) : (
              <AdminEmptyState>Biblioteca media este goală.</AdminEmptyState>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
