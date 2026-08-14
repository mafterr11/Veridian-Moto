import { describe, expect, it } from "vitest";

import {
  buildOfferDocumentModel,
  offerFileName,
  OFFER_VALIDITY_DAYS,
  type OfferSelection,
} from "@/domain/offers/offer-model";

const issuedAt = new Date("2026-08-14T09:30:00.000Z");

const selections: OfferSelection[] = [
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
  {
    groupName: "Echipare și bagaje",
    choiceName: "Pachet Urban",
    priceDeltaMinor: 99_000,
  },
];

function build(
  overrides: Partial<Parameters<typeof buildOfferDocumentModel>[0]> = {},
) {
  return buildOfferDocumentModel({
    modelName: "RIFT 700",
    currency: "RON",
    basePriceMinor: 3_899_000,
    selections,
    standardEquipment: ["Frânare ABS pe două canale"],
    issuedAt,
    ...overrides,
  });
}

describe("buildOfferDocumentModel", () => {
  it("groups selections under their option group in first-seen order", () => {
    expect(build().groups).toEqual([
      {
        name: "Culoare și finisaj",
        items: [
          {
            name: "Graphite Black",
            priceDeltaMinor: 59_000,
            unavailable: false,
          },
        ],
      },
      {
        name: "Ergonomie",
        items: [{ name: "Șa joasă", priceDeltaMinor: 0, unavailable: false }],
      },
      {
        name: "Echipare și bagaje",
        items: [
          {
            name: "Pachet Touring",
            priceDeltaMinor: 169_000,
            unavailable: false,
          },
          {
            name: "Pachet Urban",
            priceDeltaMinor: 99_000,
            unavailable: false,
          },
        ],
      },
    ]);
  });

  it("sums the option deltas and adds them to the base price", () => {
    const offer = build();

    expect(offer.optionsTotalMinor).toBe(327_000);
    expect(offer.totalMinor).toBe(4_226_000);
  });

  it("keeps an authoritative total instead of recomputing it", () => {
    // A saved snapshot carries the total the server verified at save time; a
    // later catalogue price change must not rewrite it.
    expect(build({ totalMinor: 4_100_000 }).totalMinor).toBe(4_100_000);
  });

  it("derives the validity date from the issue date", () => {
    expect(build().validUntil.toISOString()).toBe("2026-09-13T09:30:00.000Z");
    expect(OFFER_VALIDITY_DAYS).toBe(30);
  });

  it("flags configurations holding choices the catalogue dropped", () => {
    expect(build().hasUnavailableSelections).toBe(false);
    expect(
      build({
        selections: [{ ...selections[0], unavailable: true }],
      }).hasUnavailableSelections,
    ).toBe(true);
  });

  it("handles a configuration with no optional selections", () => {
    const offer = build({ selections: [] });

    expect(offer.groups).toEqual([]);
    expect(offer.optionsTotalMinor).toBe(0);
    expect(offer.totalMinor).toBe(3_899_000);
  });
});

describe("offerFileName", () => {
  it("builds an ASCII file name that survives header encoding", () => {
    expect(
      offerFileName({ modelName: "RIFT 700", reference: "K7M2QPX9RT4B" }),
    ).toBe("VERIDIAN-RIFT-700-K7M2QPX9RT4B.pdf");
  });

  it("transliterates Romanian diacritics rather than dropping them", () => {
    expect(offerFileName({ modelName: "Șoim Țară 900" })).toBe(
      "VERIDIAN-SOIM-TARA-900.pdf",
    );
  });

  it("omits the reference for an unsaved configuration", () => {
    expect(offerFileName({ modelName: "VOLT E2" })).toBe(
      "VERIDIAN-VOLT-E2.pdf",
    );
  });
});
