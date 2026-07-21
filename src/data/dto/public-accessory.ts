export type PublicAccessoryStockState =
  "in_stock" | "low_stock" | "preorder" | "unavailable";

export type PublicAccessoryDTO = {
  slug: string;
  name: string;
  category: string;
  price: number;
  summary: string;
  image?: string;
  imageAlt?: string;
  stockState: PublicAccessoryStockState;
  compatibility: readonly string[];
  featured: boolean;
};

export type PublicAccessoryRecord = {
  slug: string;
  name: string;
  category: string;
  priceMinor: number;
  summary: string;
  stockState: PublicAccessoryStockState;
  featured: boolean;
};

export function toPublicAccessoryDTO(
  accessory: PublicAccessoryRecord,
  media: { path: string; alt: string } | undefined,
  compatibility: readonly string[],
): PublicAccessoryDTO {
  return {
    slug: accessory.slug,
    name: accessory.name,
    category: accessory.category,
    price: accessory.priceMinor / 100,
    summary: accessory.summary,
    image: media?.path,
    imageAlt: media?.alt,
    stockState: accessory.stockState,
    compatibility,
    featured: accessory.featured,
  };
}
