import "server-only";

import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";

import sharp, { type OverlayOptions } from "sharp";

/** Width of the rendered preview in the PDF, in pixels. */
const RENDER_WIDTH = 1200;

/** Matches the light panel the preview sits on inside the document. */
const FLATTEN_BACKGROUND = { r: 244, g: 244, b: 242 };

const FETCH_TIMEOUT_MS = 6_000;
const MAX_REMOTE_BYTES = 8 * 1024 * 1024;

export type OfferImageLayer = {
  image: string;
  sortOrder: number;
};

/**
 * Catalogue media is either a path under `public/` or, once an administrator
 * uploads a replacement, an absolute Supabase Storage URL.
 */
async function readLayer(source: string): Promise<Buffer | undefined> {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    return readRemoteLayer(source);
  }

  if (!source.startsWith("/")) return undefined;

  // `source` reaches us from the database, so contain it to the public folder
  // rather than trusting it to stay inside the tree.
  const publicRoot = join(process.cwd(), "public");
  const resolved = normalize(join(publicRoot, source));
  if (!resolved.startsWith(publicRoot)) return undefined;

  try {
    return await readFile(resolved);
  } catch {
    return undefined;
  }
}

async function readRemoteLayer(source: string): Promise<Buffer | undefined> {
  try {
    const response = await fetch(source, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return undefined;

    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > MAX_REMOTE_BYTES) return undefined;

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.byteLength > MAX_REMOTE_BYTES ? undefined : buffer;
  } catch {
    return undefined;
  }
}

/**
 * Flattens the configurator's layered preview into a single JPEG the PDF can
 * embed. The layer order mirrors the on-screen preview, so the document shows
 * the motorcycle exactly as the visitor configured it.
 *
 * Returns `undefined` when no artwork resolves; the document then falls back to
 * a text-only header rather than failing the whole offer.
 */
export async function renderConfiguredMotorcycle(
  base: OfferImageLayer | undefined,
  overlays: readonly OfferImageLayer[],
): Promise<string | undefined> {
  if (!base) return undefined;

  const baseBuffer = await readLayer(base.image);
  if (!baseBuffer) return undefined;

  try {
    // Resize the base first and read the dimensions back off the result.
    // `metadata()` on a pending pipeline still describes the *input* image, and
    // composites larger than the canvas are rejected outright.
    const {
      data: canvasBuffer,
      info: { width, height },
    } = await sharp(baseBuffer)
      .resize({ width: RENDER_WIDTH, withoutEnlargement: true })
      .png()
      .toBuffer({ resolveWithObject: true });

    const ordered = [...overlays].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );
    const composites: OverlayOptions[] = [];
    for (const overlay of ordered) {
      const buffer = await readLayer(overlay.image);
      if (!buffer) continue;

      composites.push({
        // Overlays are authored against the same frame as the base artwork, so
        // matching the resized dimensions keeps every part aligned.
        input: await sharp(buffer)
          .resize({ width, height, fit: "fill" })
          .png()
          .toBuffer(),
      });
    }

    const rendered = await sharp(canvasBuffer)
      .composite(composites)
      .flatten({ background: FLATTEN_BACKGROUND })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${rendered.toString("base64")}`;
  } catch {
    return undefined;
  }
}
