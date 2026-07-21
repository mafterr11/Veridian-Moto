import type { Availability } from "@/data/catalogue";

export type PublicModelDTO = {
  slug: string;
  name: string;
  category: string;
  price: number;
  powerHp: number;
  displacement: string;
  torqueNm: number;
  wetWeightKg: number;
  rangeKm?: number;
  image: string;
  imageAlt: string;
  description: string;
  highlights: readonly string[];
  availability: Availability;
  stockCount: number;
  featured?: boolean;
};

export type PublicModelMediaDTO = {
  path: string;
  alt: string;
  role:
    "card" | "hero" | "gallery" | "configurator_base" | "configurator_overlay";
};

export type PublicInventoryUnitDTO = {
  stockCode: string;
  condition: "new" | "used" | "demo";
  year: number;
  mileageKm: number;
  colour: string;
  price: number;
  status: "incoming" | "available";
  image?: string;
  imageAlt?: string;
};

export type PublicModelDetailDTO = PublicModelDTO & {
  tagline: string;
  fullDescription: string;
  modelYear: number;
  seatHeightMm: number;
  configuratorEnabled: boolean;
  media: readonly PublicModelMediaDTO[];
  inventory: readonly PublicInventoryUnitDTO[];
};

export type PublicModelRecord = {
  slug: string;
  name: string;
  category: string;
  basePriceMinor: number;
  powerHp: number;
  displacementCc: number | null;
  torqueNm: number;
  wetWeightKg: number;
  additionalSpecs: Record<string, string | number | boolean>;
  summary: string;
  featured: boolean;
};

type PublicInventoryAggregate = {
  available: number;
  incoming: number;
};

type PublicMedia = {
  path: string;
  alt: string;
};

function numberFromSpec(
  specs: PublicModelRecord["additionalSpecs"],
  key: string,
) {
  const value = specs[key];
  return typeof value === "number" ? value : undefined;
}

export function toPublicModelDTO(
  model: PublicModelRecord,
  inventory: PublicInventoryAggregate | undefined,
  media: PublicMedia | undefined,
  highlights: readonly string[],
): PublicModelDTO {
  const available = inventory?.available ?? 0;
  const incoming = inventory?.incoming ?? 0;

  return {
    slug: model.slug,
    name: model.name,
    category: model.category,
    price: model.basePriceMinor / 100,
    powerHp: model.powerHp,
    displacement:
      model.displacementCc === null
        ? "Electric"
        : `${model.displacementCc} cm³`,
    torqueNm: model.torqueNm,
    wetWeightKg: model.wetWeightKg,
    rangeKm: numberFromSpec(model.additionalSpecs, "rangeKm"),
    image: media?.path ?? "/images/models/terran-650.webp",
    imageAlt: media?.alt ?? `${model.name}, imagine de prezentare`,
    description: model.summary,
    highlights,
    availability:
      available > 0 ? "available" : incoming > 0 ? "incoming" : "order",
    stockCount: available,
    featured: model.featured,
  };
}
