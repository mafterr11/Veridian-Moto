#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const HELP = `
Extract a full-canvas configurator overlay from an aligned base/edit image pair.

Usage:
  node scripts/extract-configurator-overlay.mjs \\
    --base public/images/models/rift-700.webp \\
    --edited tmp/imagegen/rift-700/seat-comfort-full-v1.png \\
    --out tmp/imagegen/rift-700/seat-comfort-overlay.webp \\
    --roi 240,350,590,550 \\
    --core 260,365,570,535 \\
    --low 8 --high 20 --min-strong 1 --diff-blur 0

Required:
  --base PATH                 Original full-frame image.
  --edited PATH               Aligned full-frame edited image.
  --out PATH                  Full-canvas lossless WebP overlay.
  --roi x0,y0,x1,y1          Allowed mask area; repeatable.
  --core x0,y0,x1,y1         Area a kept component must touch; repeatable.

Mask tuning:
  --low N                     Low RGB-difference threshold (default: 10).
  --high N                    Strong RGB-difference threshold (default: 20).
  --min-strong N              Strong pixels required per component (default: 1).
  --min-area N                Pixels required per component (default: 20).
  --diff-blur N               Blur applied before comparison (default: 0).
  --close-radius N            Binary closing radius (default: 2).
  --fill-holes N              Fill enclosed holes up to N pixels (default: 12000).
  --dilate-radius N           Mask dilation radius (default: 2).
  --feather N                 Final alpha blur sigma (default: 1.0).
  --debug-dir PATH            Also write diff.png, mask.png, and composite.webp.

Coordinates use half-open bounds: x0,y0 is included; x1,y1 is excluded.
The overlay always uses pixels from the edited image. This is intentionally
erase-aware: changed background pixels can cover geometry present in the base.
`;

const VALUE_OPTIONS = new Set([
  "base",
  "edited",
  "out",
  "roi",
  "core",
  "low",
  "high",
  "min-strong",
  "min-area",
  "diff-blur",
  "close-radius",
  "fill-holes",
  "dilate-radius",
  "feather",
  "debug-dir",
]);

function parseArgs(argv) {
  const values = { roi: [], core: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (raw === "--help" || raw === "-h") {
      values.help = true;
      continue;
    }
    if (!raw.startsWith("--")) {
      throw new Error(`Unexpected argument: ${raw}`);
    }

    const separator = raw.indexOf("=");
    const key = raw.slice(2, separator === -1 ? undefined : separator);
    if (!VALUE_OPTIONS.has(key)) {
      throw new Error(`Unknown option: --${key}`);
    }

    const value = separator === -1 ? argv[++index] : raw.slice(separator + 1);
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    if (key === "roi" || key === "core") {
      values[key].push(value);
    } else {
      values[key] = value;
    }
  }

  return values;
}

function numberOption(
  values,
  key,
  fallback,
  { integer = false, min = 0 } = {},
) {
  const value = values[key] === undefined ? fallback : Number(values[key]);
  if (
    !Number.isFinite(value) ||
    value < min ||
    (integer && !Number.isInteger(value))
  ) {
    throw new Error(
      `--${key} must be ${integer ? "an integer" : "a number"} >= ${min}.`,
    );
  }
  return value;
}

function parseRect(value, label, width, height) {
  const coordinates = value.split(",").map(Number);
  if (
    coordinates.length !== 4 ||
    coordinates.some((item) => !Number.isInteger(item))
  ) {
    throw new Error(`${label} must have four comma-separated integers.`);
  }

  const [x0, y0, x1, y1] = coordinates;
  if (x0 < 0 || y0 < 0 || x1 <= x0 || y1 <= y0 || x1 > width || y1 > height) {
    throw new Error(
      `${label} ${value} is outside the ${width}x${height} canvas.`,
    );
  }
  return { x0, y0, x1, y1 };
}

async function readRgb(file, blurSigma = 0) {
  let pipeline = sharp(file, { failOn: "error" })
    .rotate()
    .toColourspace("srgb")
    .removeAlpha();
  if (blurSigma > 0) {
    pipeline = pipeline.blur(blurSigma);
  }
  return pipeline.raw().toBuffer({ resolveWithObject: true });
}

function unionMask(width, height, rects) {
  const mask = new Uint8Array(width * height);
  for (const { x0, y0, x1, y1 } of rects) {
    for (let y = y0; y < y1; y += 1) {
      mask.fill(1, y * width + x0, y * width + x1);
    }
  }
  return mask;
}

function rectBounds(rects) {
  return rects.reduce(
    (bounds, rect) => ({
      x0: Math.min(bounds.x0, rect.x0),
      y0: Math.min(bounds.y0, rect.y0),
      x1: Math.max(bounds.x1, rect.x1),
      y1: Math.max(bounds.y1, rect.y1),
    }),
    { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
  );
}

function dilate(source, allowed, width, height, radius, bounds) {
  if (radius === 0) return source.slice();
  const result = new Uint8Array(source.length);

  for (let y = bounds.y0; y < bounds.y1; y += 1) {
    for (let x = bounds.x0; x < bounds.x1; x += 1) {
      const target = y * width + x;
      if (!allowed[target]) continue;

      search: for (let dy = -radius; dy <= radius; dy += 1) {
        const sampleY = y + dy;
        if (sampleY < 0 || sampleY >= height) continue;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sampleX = x + dx;
          if (sampleX < 0 || sampleX >= width) continue;
          if (source[sampleY * width + sampleX]) {
            result[target] = 1;
            break search;
          }
        }
      }
    }
  }

  return result;
}

function erode(source, allowed, width, height, radius, bounds) {
  if (radius === 0) return source.slice();
  const result = new Uint8Array(source.length);

  for (let y = bounds.y0; y < bounds.y1; y += 1) {
    for (let x = bounds.x0; x < bounds.x1; x += 1) {
      const target = y * width + x;
      if (!allowed[target]) continue;
      let keep = true;

      for (let dy = -radius; dy <= radius && keep; dy += 1) {
        const sampleY = y + dy;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sampleX = x + dx;
          if (
            sampleX < 0 ||
            sampleX >= width ||
            sampleY < 0 ||
            sampleY >= height ||
            !allowed[sampleY * width + sampleX] ||
            !source[sampleY * width + sampleX]
          ) {
            keep = false;
            break;
          }
        }
      }

      if (keep) result[target] = 1;
    }
  }

  return result;
}

function keepSeededComponents(
  candidate,
  strong,
  core,
  allowed,
  width,
  height,
  bounds,
  minArea,
  minStrong,
) {
  const visited = new Uint8Array(candidate.length);
  const kept = new Uint8Array(candidate.length);
  const queue = new Int32Array(candidate.length);
  let keptComponents = 0;
  let rejectedComponents = 0;

  for (let y = bounds.y0; y < bounds.y1; y += 1) {
    for (let x = bounds.x0; x < bounds.x1; x += 1) {
      const start = y * width + x;
      if (!candidate[start] || visited[start]) continue;

      let head = 0;
      let tail = 1;
      let strongPixels = 0;
      let touchesCore = false;
      queue[0] = start;
      visited[start] = 1;

      while (head < tail) {
        const current = queue[head++];
        const currentY = Math.floor(current / width);
        const currentX = current - currentY * width;
        if (strong[current]) strongPixels += 1;
        if (core[current]) touchesCore = true;

        for (let dy = -1; dy <= 1; dy += 1) {
          const nextY = currentY + dy;
          if (nextY < 0 || nextY >= height) continue;
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nextX = currentX + dx;
            if (nextX < 0 || nextX >= width) continue;
            const next = nextY * width + nextX;
            if (allowed[next] && candidate[next] && !visited[next]) {
              visited[next] = 1;
              queue[tail++] = next;
            }
          }
        }
      }

      if (tail >= minArea && strongPixels >= minStrong && touchesCore) {
        for (let index = 0; index < tail; index += 1) kept[queue[index]] = 1;
        keptComponents += 1;
      } else {
        rejectedComponents += 1;
      }
    }
  }

  return { mask: kept, keptComponents, rejectedComponents };
}

function fillSmallHoles(source, allowed, width, height, bounds, maximumArea) {
  if (maximumArea === 0) return source;
  const visited = new Uint8Array(source.length);
  const result = source.slice();
  const queue = new Int32Array(source.length);

  for (let y = bounds.y0; y < bounds.y1; y += 1) {
    for (let x = bounds.x0; x < bounds.x1; x += 1) {
      const start = y * width + x;
      if (!allowed[start] || source[start] || visited[start]) continue;

      let head = 0;
      let tail = 1;
      let touchesBoundary = false;
      queue[0] = start;
      visited[start] = 1;

      while (head < tail) {
        const current = queue[head++];
        const currentY = Math.floor(current / width);
        const currentX = current - currentY * width;

        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nextX = currentX + dx;
          const nextY = currentY + dy;
          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
            touchesBoundary = true;
            continue;
          }
          const next = nextY * width + nextX;
          if (!allowed[next]) {
            touchesBoundary = true;
          } else if (!source[next] && !visited[next]) {
            visited[next] = 1;
            queue[tail++] = next;
          }
        }
      }

      if (!touchesBoundary && tail <= maximumArea) {
        for (let index = 0; index < tail; index += 1) result[queue[index]] = 1;
      }
    }
  }

  return result;
}

async function featherMask(binaryMask, allowed, width, height, sigma) {
  let alpha = Buffer.allocUnsafe(binaryMask.length);
  for (let index = 0; index < binaryMask.length; index += 1) {
    alpha[index] = binaryMask[index] ? 255 : 0;
  }
  if (sigma > 0) {
    alpha = await sharp(alpha, { raw: { width, height, channels: 1 } })
      .blur(sigma)
      .extractChannel(0)
      .raw()
      .toBuffer();
  }
  for (let index = 0; index < alpha.length; index += 1) {
    if (!allowed[index]) alpha[index] = 0;
  }
  return alpha;
}

function alphaStats(alpha, width) {
  let pixels = 0;
  let solidPixels = 0;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  for (let index = 0; index < alpha.length; index += 1) {
    if (alpha[index] === 0) continue;
    pixels += 1;
    if (alpha[index] >= 128) solidPixels += 1;
    const y = Math.floor(index / width);
    const x = index - y * width;
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x + 1);
    y1 = Math.max(y1, y + 1);
  }

  return {
    pixels,
    solidPixels,
    bbox: pixels === 0 ? null : { x0, y0, x1, y1 },
  };
}

async function main() {
  const values = parseArgs(process.argv.slice(2));
  if (values.help) {
    process.stdout.write(HELP);
    return;
  }

  for (const required of ["base", "edited", "out"]) {
    if (!values[required])
      throw new Error(`Missing required option --${required}.`);
  }
  if (values.roi.length === 0)
    throw new Error("At least one --roi is required.");
  if (values.core.length === 0)
    throw new Error("At least one --core is required.");

  const low = numberOption(values, "low", 10, { min: 0 });
  const high = numberOption(values, "high", 20, { min: 0 });
  const minStrong = numberOption(values, "min-strong", 1, {
    integer: true,
    min: 1,
  });
  const minArea = numberOption(values, "min-area", 20, {
    integer: true,
    min: 1,
  });
  const diffBlur = numberOption(values, "diff-blur", 0, { min: 0 });
  const closeRadius = numberOption(values, "close-radius", 2, {
    integer: true,
    min: 0,
  });
  const fillHoles = numberOption(values, "fill-holes", 12000, {
    integer: true,
    min: 0,
  });
  const dilateRadius = numberOption(values, "dilate-radius", 2, {
    integer: true,
    min: 0,
  });
  const feather = numberOption(values, "feather", 1, { min: 0 });
  if (high < low)
    throw new Error("--high must be greater than or equal to --low.");

  const basePath = path.resolve(values.base);
  const editedPath = path.resolve(values.edited);
  const outPath = path.resolve(values.out);
  const [base, edited] = await Promise.all([
    readRgb(basePath, diffBlur),
    readRgb(editedPath, diffBlur),
  ]);

  if (
    base.info.width !== edited.info.width ||
    base.info.height !== edited.info.height ||
    base.info.channels !== 3 ||
    edited.info.channels !== 3
  ) {
    throw new Error(
      `Base/edit dimensions must match in RGB; got ${base.info.width}x${base.info.height}x${base.info.channels} and ${edited.info.width}x${edited.info.height}x${edited.info.channels}.`,
    );
  }

  const { width, height } = base.info;
  const rois = values.roi.map((value, index) =>
    parseRect(value, `--roi #${index + 1}`, width, height),
  );
  const cores = values.core.map((value, index) =>
    parseRect(value, `--core #${index + 1}`, width, height),
  );
  const allowed = unionMask(width, height, rois);
  const core = unionMask(width, height, cores);
  const bounds = rectBounds(rois);
  const difference = new Uint8Array(width * height);
  let candidate = new Uint8Array(width * height);
  const strong = new Uint8Array(width * height);

  for (let pixel = 0; pixel < difference.length; pixel += 1) {
    if (!allowed[pixel]) continue;
    const offset = pixel * 3;
    const delta = Math.max(
      Math.abs(base.data[offset] - edited.data[offset]),
      Math.abs(base.data[offset + 1] - edited.data[offset + 1]),
      Math.abs(base.data[offset + 2] - edited.data[offset + 2]),
    );
    difference[pixel] = delta;
    if (delta >= low) candidate[pixel] = 1;
    if (delta >= high) strong[pixel] = 1;
  }

  if (closeRadius > 0) {
    candidate = erode(
      dilate(candidate, allowed, width, height, closeRadius, bounds),
      allowed,
      width,
      height,
      closeRadius,
      bounds,
    );
  }

  const filtered = keepSeededComponents(
    candidate,
    strong,
    core,
    allowed,
    width,
    height,
    bounds,
    minArea,
    minStrong,
  );
  let finalBinary = fillSmallHoles(
    filtered.mask,
    allowed,
    width,
    height,
    bounds,
    fillHoles,
  );
  if (dilateRadius > 0) {
    finalBinary = dilate(
      finalBinary,
      allowed,
      width,
      height,
      dilateRadius,
      bounds,
    );
  }

  const alpha = await featherMask(finalBinary, allowed, width, height, feather);
  const stats = alphaStats(alpha, width);
  if (!stats.bbox) {
    throw new Error(
      "No overlay pixels survived filtering; adjust ROI/core or thresholds.",
    );
  }

  const editedSource = await readRgb(editedPath);
  const rgba = Buffer.allocUnsafe(width * height * 4);
  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    const rgbOffset = pixel * 3;
    const rgbaOffset = pixel * 4;
    rgba[rgbaOffset] = editedSource.data[rgbOffset];
    rgba[rgbaOffset + 1] = editedSource.data[rgbOffset + 1];
    rgba[rgbaOffset + 2] = editedSource.data[rgbOffset + 2];
    rgba[rgbaOffset + 3] = alpha[pixel];
  }

  const overlay = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, alphaQuality: 100 })
    .toBuffer();

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, overlay);

  if (values["debug-dir"]) {
    const debugDir = path.resolve(values["debug-dir"]);
    await mkdir(debugDir, { recursive: true });
    await Promise.all([
      sharp(difference, { raw: { width, height, channels: 1 } })
        .png()
        .toFile(path.join(debugDir, "diff.png")),
      sharp(alpha, { raw: { width, height, channels: 1 } })
        .png()
        .toFile(path.join(debugDir, "mask.png")),
      sharp(basePath, { failOn: "error" })
        .rotate()
        .toColourspace("srgb")
        .composite([{ input: overlay }])
        .webp({ quality: 94 })
        .toFile(path.join(debugDir, "composite.webp")),
    ]);
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        out: outPath,
        canvas: { width, height },
        bbox: stats.bbox,
        alphaPixels: stats.pixels,
        solidPixels: stats.solidPixels,
        keptComponents: filtered.keptComponents,
        rejectedComponents: filtered.rejectedComponents,
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`extract-configurator-overlay: ${error.message}\n`);
  process.exitCode = 1;
});
