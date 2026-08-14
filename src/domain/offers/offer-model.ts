/**
 * Pure shaping of a configuration into the commercial offer document model.
 *
 * Kept framework-independent so both offer sources — a saved snapshot and a
 * configuration that only exists in the visitor's browser — produce byte-identical
 * documents for identical selections.
 */

export const OFFER_VALIDITY_DAYS = 30;

export type OfferSelection = {
  groupName: string;
  choiceName: string;
  priceDeltaMinor: number;
  /** A snapshot choice that the published catalogue no longer offers. */
  unavailable?: boolean;
};

export type OfferInput = {
  modelName: string;
  modelYear?: number;
  category?: string;
  currency: string;
  basePriceMinor: number;
  selections: readonly OfferSelection[];
  standardEquipment: readonly string[];
  /** Present only for a configuration that was persisted server-side. */
  reference?: string;
  issuedAt: Date;
  /** Authoritative total when the caller already verified one; recomputed otherwise. */
  totalMinor?: number;
  validityDays?: number;
};

export type OfferGroup = {
  name: string;
  items: readonly {
    name: string;
    priceDeltaMinor: number;
    unavailable: boolean;
  }[];
};

export type OfferDocumentModel = {
  modelName: string;
  modelYear?: number;
  category?: string;
  currency: string;
  basePriceMinor: number;
  groups: readonly OfferGroup[];
  optionsTotalMinor: number;
  totalMinor: number;
  standardEquipment: readonly string[];
  reference?: string;
  issuedAt: Date;
  validUntil: Date;
  hasUnavailableSelections: boolean;
};

function addDays(date: Date, days: number) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Groups selections under their option group, preserving first-seen order so the
 * document reads in the same sequence the visitor stepped through the configurator.
 */
function groupSelections(
  selections: readonly OfferSelection[],
): readonly OfferGroup[] {
  const order: string[] = [];
  const byGroup = new Map<string, OfferGroup["items"][number][]>();

  for (const selection of selections) {
    if (!byGroup.has(selection.groupName)) {
      byGroup.set(selection.groupName, []);
      order.push(selection.groupName);
    }
    byGroup.get(selection.groupName)?.push({
      name: selection.choiceName,
      priceDeltaMinor: selection.priceDeltaMinor,
      unavailable: selection.unavailable === true,
    });
  }

  return order.map((name) => ({ name, items: byGroup.get(name) ?? [] }));
}

export function buildOfferDocumentModel(input: OfferInput): OfferDocumentModel {
  const optionsTotalMinor = input.selections.reduce(
    (total, selection) => total + selection.priceDeltaMinor,
    0,
  );

  return {
    modelName: input.modelName,
    modelYear: input.modelYear,
    category: input.category,
    currency: input.currency,
    basePriceMinor: input.basePriceMinor,
    groups: groupSelections(input.selections),
    optionsTotalMinor,
    totalMinor: input.totalMinor ?? input.basePriceMinor + optionsTotalMinor,
    standardEquipment: input.standardEquipment,
    reference: input.reference,
    issuedAt: input.issuedAt,
    validUntil: addDays(
      input.issuedAt,
      input.validityDays ?? OFFER_VALIDITY_DAYS,
    ),
    hasUnavailableSelections: input.selections.some(
      (selection) => selection.unavailable === true,
    ),
  };
}

/**
 * File name for the download. Kept ASCII-only: `Content-Disposition` filenames
 * travel through header encodings that mangle Romanian diacritics.
 */
export function offerFileName(model: {
  modelName: string;
  reference?: string;
}) {
  const slug = model.modelName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();

  return `VERIDIAN-${slug}${model.reference ? `-${model.reference}` : ""}.pdf`;
}
