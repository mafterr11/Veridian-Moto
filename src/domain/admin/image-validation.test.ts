import { describe, expect, it } from "vitest";

import {
  hasMatchingImageSignature,
  MAX_CATALOGUE_IMAGE_BYTES,
  MAX_CATALOGUE_IMAGE_PIXELS,
} from "@/domain/admin/image-validation";

describe("catalogue image signatures", () => {
  it("keeps upload and decode limits bounded", () => {
    expect(MAX_CATALOGUE_IMAGE_BYTES).toBe(5 * 1024 * 1024);
    expect(MAX_CATALOGUE_IMAGE_PIXELS).toBeLessThanOrEqual(24_000_000);
  });
  it("recognizes supported image headers", () => {
    expect(
      hasMatchingImageSignature(
        new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
        "image/jpeg",
      ),
    ).toBe(true);
    expect(
      hasMatchingImageSignature(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        "image/png",
      ),
    ).toBe(true);
    expect(
      hasMatchingImageSignature(
        new TextEncoder().encode("RIFF0000WEBP"),
        "image/webp",
      ),
    ).toBe(true);
    expect(
      hasMatchingImageSignature(
        new Uint8Array([0, 0, 0, 0, ...new TextEncoder().encode("ftypavif")]),
        "image/avif",
      ),
    ).toBe(true);
  });

  it("rejects a declared image type when the bytes do not match", () => {
    expect(
      hasMatchingImageSignature(
        new TextEncoder().encode("<script>alert(1)</script>"),
        "image/png",
      ),
    ).toBe(false);
  });
});
