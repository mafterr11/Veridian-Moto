import {
  assignAccessoryMediaAction,
  assignInventoryMediaAction,
  removeAccessoryMediaAction,
  removeInventoryMediaAction,
  uploadAccessoryMediaAction,
  uploadInventoryMediaAction,
} from "@/app/atelier/(protected)/catalogue-actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminField } from "@/components/admin/form-field";
import { AdminEmptyState } from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type EntityKind = "accessory" | "inventory";
type AttachedMedia = {
  id: string;
  mediaId: string;
  storagePath: string;
  altText: string;
  sortOrder: number;
};
type LibraryMedia = { id: string; altText: string };

export function EntityMediaEditor({
  kind,
  entityId,
  attached,
  mediaLibrary,
}: {
  kind: EntityKind;
  entityId: string;
  attached: readonly AttachedMedia[];
  mediaLibrary: readonly LibraryMedia[];
}) {
  const isAccessory = kind === "accessory";
  const entityField = isAccessory ? "accessoryId" : "inventoryUnitId";
  const uploadAction = isAccessory
    ? uploadAccessoryMediaAction
    : uploadInventoryMediaAction;
  const assignAction = isAccessory
    ? assignAccessoryMediaAction
    : assignInventoryMediaAction;
  const removeAction = isAccessory
    ? removeAccessoryMediaAction
    : removeInventoryMediaAction;
  const availableMedia = mediaLibrary.filter(
    (item) => !attached.some((placed) => placed.mediaId === item.id),
  );

  return (
    <div className="border-obsidian/10 mt-6 grid gap-5 border-t pt-5">
      <div>
        <h3 className="font-heading text-lg font-bold uppercase">Imagini</h3>
        <p className="text-steel mt-1 text-xs leading-5">
          JPEG, PNG, WebP sau AVIF, maximum 5 MB. Fișierul este verificat,
          redimensionat și convertit în WebP.
        </p>
      </div>

      {attached.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {attached.map((media) => (
            <div key={media.id} className="border-obsidian/15 border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.storagePath}
                alt={media.altText}
                className="aspect-[4/3] w-full object-cover"
              />
              <p className="mt-2 line-clamp-2 text-xs">{media.altText}</p>
              <p className="text-steel text-[11px]">
                Ordine: {media.sortOrder}
              </p>
              <AdminActionForm
                action={removeAction.bind(null, media.id, entityId)}
                submitLabel="Elimină asocierea"
                buttonVariant="destructive"
                className="mt-3"
              />
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState>Nu există imagini asociate.</AdminEmptyState>
      )}

      <details className="border-veridian-dark/30 border">
        <summary className="text-veridian-dark cursor-pointer list-none p-3 text-sm font-bold">
          Încarcă imagine nouă
        </summary>
        <div className="border-veridian-dark/20 border-t p-3">
          <AdminActionForm
            action={uploadAction}
            submitLabel="Optimizează și încarcă"
          >
            <input type="hidden" name={entityField} value={entityId} />
            <AdminField label="Fișier" htmlFor={`${kind}-${entityId}-file`}>
              <Input
                id={`${kind}-${entityId}-file`}
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
              />
            </AdminField>
            <AdminField
              label="Text alternativ"
              htmlFor={`${kind}-${entityId}-alt`}
            >
              <Input
                id={`${kind}-${entityId}-alt`}
                name="altText"
                minLength={5}
                maxLength={500}
                required
              />
            </AdminField>
            <AdminField label="Ordine" htmlFor={`${kind}-${entityId}-sort`}>
              <Input
                id={`${kind}-${entityId}-sort`}
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={attached.length}
                required
              />
            </AdminField>
          </AdminActionForm>
        </div>
      </details>

      {availableMedia.length > 0 && (
        <details className="border-obsidian/15 border">
          <summary className="cursor-pointer list-none p-3 text-sm font-bold">
            Folosește o imagine existentă
          </summary>
          <div className="border-obsidian/10 border-t p-3">
            <AdminActionForm
              action={assignAction}
              submitLabel="Asociază imaginea"
            >
              <input type="hidden" name={entityField} value={entityId} />
              <AdminField
                label="Imagine din bibliotecă"
                htmlFor={`${kind}-${entityId}-library`}
              >
                <NativeSelect
                  id={`${kind}-${entityId}-library`}
                  name="mediaId"
                  className="w-full"
                  required
                >
                  {availableMedia.map((media) => (
                    <NativeSelectOption key={media.id} value={media.id}>
                      {media.altText}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </AdminField>
              <AdminField
                label="Ordine"
                htmlFor={`${kind}-${entityId}-library-sort`}
              >
                <Input
                  id={`${kind}-${entityId}-library-sort`}
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={attached.length}
                  required
                />
              </AdminField>
            </AdminActionForm>
          </div>
        </details>
      )}
    </div>
  );
}
