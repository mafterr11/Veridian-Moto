"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { assertAdmin } from "@/data/auth/admin-session";
import {
  archiveAccessory,
  archiveAccessoryCategory,
  archiveCategory,
  archiveInventoryUnit,
  archiveModel,
  archiveOptionChoice,
  archiveOptionGroup,
  assignAccessoryMedia,
  assignInventoryMedia,
  assignModelMedia,
  createModel,
  deleteModelFeature,
  deleteOptionRule,
  PublicationValidationError,
  publishModel,
  removeAccessoryMedia,
  removeInventoryMedia,
  removeModelMedia,
  saveAccessory,
  saveAccessoryCategory,
  saveCategory,
  saveInventoryUnit,
  saveModelFeature,
  saveOptionChoice,
  saveOptionGroup,
  saveOptionRule,
  updateModel,
} from "@/data/mutations/admin-catalogue";
import {
  uploadAndAssignAccessoryImage,
  uploadAndAssignInventoryImage,
  uploadAndAssignModelImage,
} from "@/data/mutations/admin-media";
import {
  mutationErrorState,
  type AdminFormState,
  validationErrorState,
} from "@/domain/admin/form-state";
import {
  accessoryCategorySchema,
  accessoryMediaAssignmentSchema,
  accessorySchema,
  categorySchema,
  checked,
  inventorySchema,
  inventoryMediaAssignmentSchema,
  modelFeatureSchema,
  modelMediaAssignmentSchema,
  modelSchema,
  optionChoiceSchema,
  optionGroupSchema,
  optionRuleSchema,
  uploadAccessoryImageSchema,
  uploadImageSchema,
  uploadInventoryImageSchema,
} from "@/domain/admin/schemas";

const uuid = z.string().uuid();

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function optionalField(formData: FormData, name: string) {
  const value = field(formData, name).trim();
  return value || undefined;
}

function success(message: string): AdminFormState {
  return { status: "success", message };
}

async function authorizeAction(): Promise<AdminFormState | null> {
  try {
    await assertAdmin();
    return null;
  } catch {
    return {
      status: "error",
      message: "Sesiunea de administrator a expirat. Reîncarcă pagina.",
    };
  }
}

function invalidIdentifier(): AdminFormState {
  return {
    status: "error",
    message: "Identificatorul înregistrării nu este valid.",
  };
}

export async function saveCategoryAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;

  const parsed = categorySchema.safeParse({
    id: optionalField(formData, "id"),
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    description: field(formData, "description"),
    sortOrder: field(formData, "sortOrder"),
    status: field(formData, "status"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveCategory(parsed.data);
    revalidatePath("/atelier/categorii");
    return success(
      parsed.data.id
        ? "Categoria a fost actualizată."
        : "Categoria a fost creată.",
    );
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function archiveCategoryAction(
  id: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success) return invalidIdentifier();

  try {
    await archiveCategory(id);
    revalidatePath("/atelier/categorii");
    return success("Categoria a fost arhivată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

function modelInput(formData: FormData) {
  return modelSchema.safeParse({
    id: optionalField(formData, "id"),
    categoryId: field(formData, "categoryId"),
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    tagline: field(formData, "tagline"),
    summary: field(formData, "summary"),
    description: field(formData, "description"),
    modelYear: field(formData, "modelYear"),
    basePriceMinor: field(formData, "basePrice"),
    displacementCc: field(formData, "displacementCc"),
    powerHp: field(formData, "powerHp"),
    torqueNm: field(formData, "torqueNm"),
    wetWeightKg: field(formData, "wetWeightKg"),
    seatHeightMm: field(formData, "seatHeightMm"),
    featured: checked(formData, "featured"),
    configuratorEnabled: checked(formData, "configuratorEnabled"),
  });
}

export async function createModelAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = modelInput(formData);
  if (!parsed.success) return validationErrorState(parsed.error);

  let id: string;
  try {
    id = await createModel(parsed.data);
  } catch (error) {
    return mutationErrorState(error);
  }

  redirect(`/atelier/modele/${id}`);
}

export async function updateModelAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = modelInput(formData);
  if (!parsed.success) return validationErrorState(parsed.error);
  if (!parsed.data.id) return invalidIdentifier();

  try {
    await updateModel({ ...parsed.data, id: parsed.data.id });
    revalidatePath(`/atelier/modele/${parsed.data.id}`);
    revalidatePath("/atelier/modele");
    return success("Modelul a fost salvat ca draft.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function publishModelAction(
  id: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success) return invalidIdentifier();

  try {
    await publishModel(id);
    revalidatePath(`/atelier/modele/${id}`);
    revalidatePath("/atelier/modele");
    return success("Modelul a fost publicat.");
  } catch (error) {
    if (error instanceof PublicationValidationError) {
      return {
        status: "error",
        message: error.message,
        issues: error.issues.map((issue) => ({
          field: issue.section,
          message: issue.message,
        })),
      };
    }
    return mutationErrorState(error);
  }
}

export async function archiveModelAction(
  id: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success) return invalidIdentifier();

  try {
    await archiveModel(id);
    revalidatePath("/atelier/modele");
    return success("Modelul a fost arhivat.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveModelFeatureAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = modelFeatureSchema.safeParse({
    id: optionalField(formData, "id"),
    modelId: field(formData, "modelId"),
    groupName: field(formData, "groupName"),
    label: field(formData, "label"),
    value: field(formData, "value"),
    isStandard: checked(formData, "isStandard"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveModelFeature(parsed.data);
    revalidatePath(`/atelier/modele/${parsed.data.modelId}`);
    return success("Echiparea a fost salvată; modelul este draft.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function deleteModelFeatureAction(
  id: string,
  modelId: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success || !uuid.safeParse(modelId).success) {
    return invalidIdentifier();
  }
  try {
    await deleteModelFeature(id, modelId);
    revalidatePath(`/atelier/modele/${modelId}`);
    return success("Echiparea a fost eliminată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveOptionGroupAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = optionGroupSchema.safeParse({
    id: optionalField(formData, "id"),
    modelId: field(formData, "modelId"),
    key: field(formData, "key"),
    name: field(formData, "name"),
    description: field(formData, "description"),
    selectionType: field(formData, "selectionType"),
    required: checked(formData, "required"),
    minSelected: field(formData, "minSelected"),
    maxSelected: field(formData, "maxSelected"),
    sortOrder: field(formData, "sortOrder"),
    status: field(formData, "status"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveOptionGroup(parsed.data);
    revalidatePath(`/atelier/modele/${parsed.data.modelId}`);
    return success("Grupul a fost salvat; modelul este draft.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function archiveOptionGroupAction(
  id: string,
  modelId: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success || !uuid.safeParse(modelId).success) {
    return invalidIdentifier();
  }
  try {
    await archiveOptionGroup(id, modelId);
    revalidatePath(`/atelier/modele/${modelId}`);
    return success("Grupul a fost arhivat.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveOptionChoiceAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = optionChoiceSchema.safeParse({
    id: optionalField(formData, "id"),
    modelId: field(formData, "modelId"),
    groupId: field(formData, "groupId"),
    code: field(formData, "code"),
    name: field(formData, "name"),
    description: field(formData, "description"),
    priceDeltaMinor: field(formData, "priceDelta"),
    swatchHex: field(formData, "swatchHex"),
    mediaId: field(formData, "mediaId"),
    accessoryId: field(formData, "accessoryId"),
    isStandard: checked(formData, "isStandard"),
    sortOrder: field(formData, "sortOrder"),
    status: field(formData, "status"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveOptionChoice(parsed.data);
    revalidatePath(`/atelier/modele/${parsed.data.modelId}`);
    return success("Opțiunea a fost salvată; modelul este draft.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function archiveOptionChoiceAction(
  id: string,
  modelId: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success || !uuid.safeParse(modelId).success) {
    return invalidIdentifier();
  }
  try {
    await archiveOptionChoice(id, modelId);
    revalidatePath(`/atelier/modele/${modelId}`);
    return success("Opțiunea a fost arhivată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveOptionRuleAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = optionRuleSchema.safeParse({
    modelId: field(formData, "modelId"),
    sourceChoiceId: field(formData, "sourceChoiceId"),
    targetChoiceId: field(formData, "targetChoiceId"),
    ruleType: field(formData, "ruleType"),
    explanation: field(formData, "explanation"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveOptionRule(parsed.data);
    revalidatePath(`/atelier/modele/${parsed.data.modelId}`);
    return success("Regula a fost adăugată; modelul este draft.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function deleteOptionRuleAction(
  id: string,
  modelId: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success || !uuid.safeParse(modelId).success) {
    return invalidIdentifier();
  }
  try {
    await deleteOptionRule(id, modelId);
    revalidatePath(`/atelier/modele/${modelId}`);
    return success("Regula a fost eliminată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function assignModelMediaAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = modelMediaAssignmentSchema.safeParse({
    modelId: field(formData, "modelId"),
    mediaId: field(formData, "mediaId"),
    role: field(formData, "role"),
    viewAngle: field(formData, "viewAngle"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  try {
    await assignModelMedia(parsed.data);
    revalidatePath(`/atelier/modele/${parsed.data.modelId}`);
    return success("Imaginea a fost asociată; modelul este draft.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function removeModelMediaAction(
  id: string,
  modelId: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success || !uuid.safeParse(modelId).success) {
    return invalidIdentifier();
  }
  try {
    await removeModelMedia(id, modelId);
    revalidatePath(`/atelier/modele/${modelId}`);
    return success("Asocierea imaginii a fost eliminată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function uploadModelMediaAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = uploadImageSchema.safeParse({
    modelId: field(formData, "modelId"),
    altText: field(formData, "altText"),
    role: field(formData, "role"),
    viewAngle: field(formData, "viewAngle"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: "Selectează o imagine validă." };
  }

  try {
    await uploadAndAssignModelImage(parsed.data, file);
    revalidatePath(`/atelier/modele/${parsed.data.modelId}`);
    return success("Imaginea a fost optimizată, încărcată și asociată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveInventoryAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = inventorySchema.safeParse({
    id: optionalField(formData, "id"),
    modelId: field(formData, "modelId"),
    stockCode: field(formData, "stockCode"),
    vin: field(formData, "vin"),
    condition: field(formData, "condition"),
    year: field(formData, "year"),
    mileageKm: field(formData, "mileageKm"),
    colour: field(formData, "colour"),
    priceMinor: field(formData, "price"),
    status: field(formData, "status"),
    isPublic: checked(formData, "isPublic"),
    privateNotes: field(formData, "privateNotes"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);

  try {
    await saveInventoryUnit(parsed.data);
    revalidatePath("/atelier/stoc");
    return success(
      parsed.data.id
        ? "Unitatea a fost actualizată."
        : "Unitatea a fost creată.",
    );
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function archiveInventoryAction(
  id: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success) return invalidIdentifier();
  try {
    await archiveInventoryUnit(id);
    revalidatePath("/atelier/stoc");
    return success("Unitatea a fost arhivată și ascunsă public.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function assignInventoryMediaAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = inventoryMediaAssignmentSchema.safeParse({
    inventoryUnitId: field(formData, "inventoryUnitId"),
    mediaId: field(formData, "mediaId"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  try {
    await assignInventoryMedia(parsed.data);
    revalidatePath("/atelier/stoc");
    return success("Imaginea existentă a fost asociată unității.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function removeInventoryMediaAction(
  id: string,
  inventoryUnitId: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success || !uuid.safeParse(inventoryUnitId).success) {
    return invalidIdentifier();
  }
  try {
    await removeInventoryMedia(id, inventoryUnitId);
    revalidatePath("/atelier/stoc");
    return success("Asocierea imaginii a fost eliminată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function uploadInventoryMediaAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = uploadInventoryImageSchema.safeParse({
    inventoryUnitId: field(formData, "inventoryUnitId"),
    altText: field(formData, "altText"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: "Selectează o imagine validă." };
  }
  try {
    await uploadAndAssignInventoryImage(parsed.data, file);
    revalidatePath("/atelier/stoc");
    return success("Imaginea a fost optimizată, încărcată și asociată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveAccessoryCategoryAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = accessoryCategorySchema.safeParse({
    id: optionalField(formData, "id"),
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    sortOrder: field(formData, "sortOrder"),
    status: field(formData, "status"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  try {
    await saveAccessoryCategory(parsed.data);
    revalidatePath("/atelier/accesorii");
    return success("Categoria de accesorii a fost salvată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function archiveAccessoryCategoryAction(
  id: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success) return invalidIdentifier();
  try {
    await archiveAccessoryCategory(id);
    revalidatePath("/atelier/accesorii");
    return success("Categoria de accesorii a fost arhivată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function saveAccessoryAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = accessorySchema.safeParse({
    id: optionalField(formData, "id"),
    categoryId: field(formData, "categoryId"),
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    sku: field(formData, "sku"),
    summary: field(formData, "summary"),
    description: field(formData, "description"),
    priceMinor: field(formData, "price"),
    stockState: field(formData, "stockState"),
    internalQuantity: field(formData, "internalQuantity"),
    featured: checked(formData, "featured"),
    status: field(formData, "status"),
    compatibleModelIds: formData.getAll("compatibleModelIds").map(String),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  try {
    await saveAccessory(parsed.data);
    revalidatePath("/atelier/accesorii");
    return success(
      parsed.data.id
        ? "Accesoriul a fost actualizat."
        : "Accesoriul a fost creat.",
    );
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function archiveAccessoryAction(
  id: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success) return invalidIdentifier();
  try {
    await archiveAccessory(id);
    revalidatePath("/atelier/accesorii");
    return success("Accesoriul a fost arhivat.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function assignAccessoryMediaAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = accessoryMediaAssignmentSchema.safeParse({
    accessoryId: field(formData, "accessoryId"),
    mediaId: field(formData, "mediaId"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  try {
    await assignAccessoryMedia(parsed.data);
    revalidatePath("/atelier/accesorii");
    return success("Imaginea existentă a fost asociată accesoriului.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function removeAccessoryMediaAction(
  id: string,
  accessoryId: string,
  _state: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  if (!uuid.safeParse(id).success || !uuid.safeParse(accessoryId).success) {
    return invalidIdentifier();
  }
  try {
    await removeAccessoryMedia(id, accessoryId);
    revalidatePath("/atelier/accesorii");
    return success("Asocierea imaginii a fost eliminată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}

export async function uploadAccessoryMediaAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const denied = await authorizeAction();
  if (denied) return denied;
  const parsed = uploadAccessoryImageSchema.safeParse({
    accessoryId: field(formData, "accessoryId"),
    altText: field(formData, "altText"),
    sortOrder: field(formData, "sortOrder"),
  });
  if (!parsed.success) return validationErrorState(parsed.error);
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: "Selectează o imagine validă." };
  }
  try {
    await uploadAndAssignAccessoryImage(parsed.data, file);
    revalidatePath("/atelier/accesorii");
    return success("Imaginea a fost optimizată, încărcată și asociată.");
  } catch (error) {
    return mutationErrorState(error);
  }
}
