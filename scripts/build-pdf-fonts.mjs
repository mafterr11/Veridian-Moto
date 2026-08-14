// Regenerates the subset TTF files embedded in offer PDFs.
//
// The offer document cannot use the WOFF2 files shipped by Fontsource: the PDF
// font pipeline reads TTF/OTF only. The PDF standard fonts are not an option
// either, because their WinAnsi encoding has no U+0219/U+021B, so Romanian
// "ș" and "ț" would render as blanks.
//
// Requires Python with fonttools (`pip install fonttools`) and network access.
// Run it only when the brand typefaces change; the output is committed.
//
//   node scripts/build-pdf-fonts.mjs

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, copyFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts/main/ofl";

// Latin, Latin Extended-A/B (Romanian comma-below diacritics live at
// U+0218-U+021B), general punctuation and currency symbols.
const UNICODES = [
  "U+0020-007E",
  "U+00A0-00FF",
  "U+0100-017F",
  "U+0180-024F",
  "U+2000-206F",
  "U+20A0-20BF",
  "U+2212",
].join(",");

const OUTPUT_DIRECTORY = new URL("../src/lib/pdf/fonts/", import.meta.url)
  .pathname;

const sources = [
  {
    output: "BarlowCondensed-Bold.ttf",
    url: `${GOOGLE_FONTS}/barlowcondensed/BarlowCondensed-Bold.ttf`,
  },
  {
    output: "BarlowCondensed-ExtraBold.ttf",
    url: `${GOOGLE_FONTS}/barlowcondensed/BarlowCondensed-ExtraBold.ttf`,
  },
  {
    output: "Manrope-Regular.ttf",
    url: `${GOOGLE_FONTS}/manrope/Manrope%5Bwght%5D.ttf`,
    // Manrope ships only as a variable font, so pin a static instance first.
    weight: 400,
  },
  {
    output: "Manrope-Bold.ttf",
    url: `${GOOGLE_FONTS}/manrope/Manrope%5Bwght%5D.ttf`,
    weight: 700,
  },
];

const licences = [
  {
    output: "OFL-BarlowCondensed.txt",
    url: `${GOOGLE_FONTS}/barlowcondensed/OFL.txt`,
  },
  { output: "OFL-Manrope.txt", url: `${GOOGLE_FONTS}/manrope/OFL.txt` },
];

// Every glyph the Romanian offer copy needs beyond plain ASCII.
const REQUIRED_CHARACTERS = "ĂăÂâÎîȘșȚț–—…•";

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const { writeFileSync } = await import("node:fs");
  writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

function python(module, args) {
  execFileSync("python3", ["-m", module, ...args], { stdio: "inherit" });
}

async function main() {
  const workspace = mkdtempSync(join(tmpdir(), "veridian-fonts-"));
  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

  try {
    for (const source of sources) {
      const downloaded = join(workspace, `raw-${source.output}`);
      await download(source.url, downloaded);

      let instance = downloaded;
      if (source.weight) {
        instance = join(workspace, `instance-${source.output}`);
        python("fontTools.varLib.instancer", [
          downloaded,
          `wght=${source.weight}`,
          "-o",
          instance,
        ]);
      }

      python("fontTools.subset", [
        instance,
        `--unicodes=${UNICODES}`,
        "--layout-features=*",
        "--no-hinting",
        "--desubroutinize",
        `--output-file=${join(OUTPUT_DIRECTORY, source.output)}`,
      ]);

      assertCoverage(join(OUTPUT_DIRECTORY, source.output));
      console.log(`Built ${source.output}`);
    }

    for (const licence of licences) {
      const downloaded = join(workspace, licence.output);
      await download(licence.url, downloaded);
      copyFileSync(downloaded, join(OUTPUT_DIRECTORY, licence.output));
    }
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

function assertCoverage(fontPath) {
  const script = [
    "import sys",
    "from fontTools.ttLib import TTFont",
    "cmap = TTFont(sys.argv[1]).getBestCmap()",
    "missing = [c for c in sys.argv[2] if ord(c) not in cmap]",
    "sys.exit('Missing glyphs: ' + ''.join(missing)) if missing else None",
  ].join("\n");
  execFileSync("python3", ["-c", script, fontPath, REQUIRED_CHARACTERS], {
    stdio: "inherit",
  });
}

await main();
