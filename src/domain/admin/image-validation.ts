export const MAX_CATALOGUE_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_CATALOGUE_IMAGE_PIXELS = 24_000_000;
export const ALLOWED_CATALOGUE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type CatalogueImageMime = (typeof ALLOWED_CATALOGUE_IMAGE_TYPES)[number];

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function hasMatchingImageSignature(
  bytes: Uint8Array,
  mimeType: CatalogueImageMime,
) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      ascii(bytes, 1, 3) === "PNG" &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP";
  }

  return (
    ascii(bytes, 4, 4) === "ftyp" &&
    ["avif", "avis"].includes(ascii(bytes, 8, 4))
  );
}

export function isAllowedCatalogueImageType(
  value: string,
): value is CatalogueImageMime {
  return (ALLOWED_CATALOGUE_IMAGE_TYPES as readonly string[]).includes(value);
}
