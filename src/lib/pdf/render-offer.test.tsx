// @vitest-environment node
//
// The PDF pipeline is Node-only: under jsdom the renderer resolves its browser
// build and `renderToBuffer` disappears.
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildOfferDocumentModel } from "@/domain/offers/offer-model";
import { renderOfferPdf } from "@/lib/pdf/render-offer";

const dealer = {
  contactEmail: "salut@veridian-moto.ro",
  contactPhone: "+40 312 345 678",
  address: "Strada Atelierului 24, Brașov, România",
};

const offer = buildOfferDocumentModel({
  modelName: "RIFT 700",
  category: "Roadster",
  modelYear: 2026,
  currency: "RON",
  basePriceMinor: 3_899_000,
  selections: [
    {
      groupName: "Culoare și finisaj",
      choiceName: "Graphite Black",
      priceDeltaMinor: 59_000,
    },
    { groupName: "Ergonomie", choiceName: "Șa joasă", priceDeltaMinor: 0 },
    {
      groupName: "Echipare și bagaje",
      choiceName: "Pachet Touring",
      priceDeltaMinor: 169_000,
    },
  ],
  standardEquipment: [
    "Frânare ABS pe două canale",
    "Control al tracțiunii în trei trepte",
  ],
  reference: "K7M2QPX9RT4B",
  issuedAt: new Date("2026-08-14T09:30:00.000Z"),
});

describe("renderOfferPdf", () => {
  it("renders a PDF document", async () => {
    const pdf = await renderOfferPdf({ offer, dealer });

    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(10_000);
  });

  it("embeds the brand typefaces so Romanian diacritics survive", async () => {
    const pdf = await renderOfferPdf({ offer, dealer });
    const raw = pdf.toString("latin1");

    // Embedded subsets keep the PostScript name in the font descriptor. Their
    // presence is what proves the document is not falling back to Helvetica,
    // whose WinAnsi encoding has no U+0219 "ș" or U+021B "ț".
    expect(raw).toContain("Manrope");
    expect(raw).toContain("BarlowCondensed");
  });

  it("renders without artwork when no preview resolves", async () => {
    await expect(
      renderOfferPdf({ offer, dealer, previewImage: undefined }),
    ).resolves.toBeInstanceOf(Buffer);
  });
}, 30_000);
