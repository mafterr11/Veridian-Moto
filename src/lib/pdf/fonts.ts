import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Font } from "@react-pdf/renderer";

export const PDF_FONT_DIRECTORY = join("src", "lib", "pdf", "fonts");

const FONT_FILES = [
  {
    family: "Barlow Condensed",
    file: "BarlowCondensed-Bold.ttf",
    fontWeight: 700 as const,
  },
  {
    family: "Barlow Condensed",
    file: "BarlowCondensed-ExtraBold.ttf",
    fontWeight: 800 as const,
  },
  { family: "Manrope", file: "Manrope-Regular.ttf", fontWeight: 400 as const },
  { family: "Manrope", file: "Manrope-Bold.ttf", fontWeight: 700 as const },
];

export class PdfFontError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfFontError";
  }
}

function readFont(file: string) {
  const path = join(process.cwd(), PDF_FONT_DIRECTORY, file);
  try {
    return readFileSync(path);
  } catch {
    // A missing file here almost always means the deployment did not trace the
    // TTFs into the function bundle. Say so instead of surfacing a bare ENOENT.
    throw new PdfFontError(
      `Font file ${file} is missing. Check outputFileTracingIncludes for ${PDF_FONT_DIRECTORY}.`,
    );
  }
}

let registered = false;

/**
 * Registers the brand typefaces with the PDF renderer exactly once per runtime
 * instance. The renderer keeps fonts in a module-level registry, so repeated
 * registration would re-parse the same files on every request.
 */
export function registerOfferFonts() {
  if (registered) return;

  for (const { family, file, fontWeight } of FONT_FILES) {
    Font.register({
      family,
      fontWeight,
      // The renderer decodes `data:` sources in-process. Passing a path instead
      // would make it read the file itself, turning a tracing mistake into an
      // opaque failure deep inside the font parser.
      src: `data:font/ttf;base64,${readFont(file).toString("base64")}`,
    });
  }

  // Romanian copy contains no words this would help, and hyphenation of model
  // codes such as "APEX 900 RR" only creates awkward breaks.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
