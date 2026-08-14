// @vitest-environment node
//
// Exercises the offer pipeline against the checked-in demo catalogue, which is
// also the fallback the routes use when the database is unreachable.
import { beforeEach, describe, expect, it, vi } from "vitest";

const configurationMocks = vi.hoisted(() => ({
  getPublicConfiguration: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((callback: unknown) => callback),
}));
vi.mock("@/data/queries/public-configurations", () => configurationMocks);

import {
  buildOfferFromReference,
  buildOfferFromState,
  OfferUnavailableError,
} from "@/data/queries/public-offers";
import { getDemoConfigurator } from "@/domain/configurator/demo-catalogues";
import { createInitialState, updateChoice } from "@/domain/configurator/engine";
import type { ConfigurationState } from "@/domain/configurator/types";

const issuedAt = new Date("2026-08-14T09:30:00.000Z");

function configure(slug: string, choiceIds: readonly string[]) {
  const catalogue = getDemoConfigurator(slug);
  if (!catalogue) throw new Error(`missing demo catalogue for ${slug}`);

  let state = createInitialState(catalogue);
  for (const choiceId of choiceIds) {
    const result = updateChoice(catalogue, state, choiceId, true);
    if (!result.accepted) throw new Error(`catalogue rejected ${choiceId}`);
    state = result.state;
  }
  return state;
}

describe("buildOfferFromState", () => {
  it("prices the configuration from the catalogue, not from the client", async () => {
    const state = configure("rift-700", [
      "color-graphite",
      "seat-low",
      "touring-pack",
      "urban-pack",
    ]);

    const { offer } = await buildOfferFromState({
      modelSlug: "rift-700",
      state,
      issuedAt,
    });

    expect(offer.modelName).toBe("Rift 700");
    expect(offer.basePriceMinor).toBe(3_899_000);
    expect(offer.optionsTotalMinor).toBe(327_000);
    expect(offer.totalMinor).toBe(4_226_000);
    expect(offer.reference).toBeUndefined();
  });

  it("lists the selected choices under their groups", async () => {
    const state = configure("rift-700", ["color-graphite", "touring-pack"]);

    const { offer } = await buildOfferFromState({
      modelSlug: "rift-700",
      state,
      issuedAt,
    });

    expect(
      offer.groups.map((group) => [
        group.name,
        group.items.map((item) => item.name),
      ]),
    ).toEqual([
      ["Culoare și finisaj", ["Graphite Black"]],
      ["Ergonomie", ["Ergonomie standard"]],
      ["Echipare și bagaje", ["Pachet Touring"]],
    ]);
  });

  it("composites the layered preview into an embeddable image", async () => {
    const state = configure("rift-700", [
      "color-graphite",
      "touring-pack",
      "urban-pack",
    ]);

    const { previewImage } = await buildOfferFromState({
      modelSlug: "rift-700",
      state,
      issuedAt,
    });

    // Overlays must be resized to the composited canvas; when they are not,
    // the compositor throws and the document silently loses its artwork.
    expect(previewImage).toMatch(/^data:image\/jpeg;base64,/);
  });

  it("rejects a model that is not in the configurator", async () => {
    const state = configure("rift-700", []);

    await expect(
      buildOfferFromState({ modelSlug: "nu-exista", state, issuedAt }),
    ).rejects.toBeInstanceOf(OfferUnavailableError);
  });

  it("rejects a configuration that violates the catalogue rules", async () => {
    // Selecting nothing in a required single-choice group is invalid.
    const invalid: ConfigurationState = {
      modelId: "rift-700",
      selectedByGroup: { finish: [], ergonomics: [], touring: [] },
      previewAngle: "front-three-quarter",
    };

    await expect(
      buildOfferFromState({ modelSlug: "rift-700", state: invalid, issuedAt }),
    ).rejects.toBeInstanceOf(OfferUnavailableError);
  });
}, 30_000);

const snapshot = {
  reference: "K7M2QPX9RT4B",
  modelIdentity: { slug: "rift-700", name: "Rift 700", modelYear: 2026 },
  basePriceMinor: 3_899_000,
  totalPriceMinor: 4_226_000,
  currency: "RON",
  createdAt: issuedAt,
  selectedChoices: [
    {
      groupKey: "finish",
      groupName: "Culoare și finisaj",
      choiceCode: "color-graphite",
      choiceName: "Graphite Black",
      priceDeltaMinor: 59_000,
      isCurrentlyAvailable: true,
    },
    {
      groupKey: "touring",
      groupName: "Echipare și bagaje",
      choiceCode: "touring-pack",
      choiceName: "Pachet Touring",
      priceDeltaMinor: 169_000,
      isCurrentlyAvailable: true,
    },
  ],
};

describe("buildOfferFromReference", () => {
  beforeEach(() => {
    configurationMocks.getPublicConfiguration.mockReset();
    configurationMocks.getPublicConfiguration.mockResolvedValue(snapshot);
  });

  it("keeps the snapshot's prices rather than repricing from the catalogue", async () => {
    configurationMocks.getPublicConfiguration.mockResolvedValue({
      ...snapshot,
      // A price the current catalogue no longer charges.
      basePriceMinor: 3_500_000,
      totalPriceMinor: 3_728_000,
    });

    const payload = await buildOfferFromReference("K7M2QPX9RT4B");

    expect(payload?.offer.basePriceMinor).toBe(3_500_000);
    expect(payload?.offer.totalMinor).toBe(3_728_000);
    expect(payload?.offer.reference).toBe("K7M2QPX9RT4B");
    expect(payload?.fileName).toBe("VERIDIAN-RIFT-700-K7M2QPX9RT4B.pdf");
  });

  it("re-renders the artwork by mapping stored codes onto the catalogue", async () => {
    const payload = await buildOfferFromReference("K7M2QPX9RT4B");

    // The snapshot stores `groupKey:choiceCode`, never the catalogue's own
    // identifiers, so the preview depends on that mapping succeeding.
    expect(payload?.previewImage).toMatch(/^data:image\/jpeg;base64,/);
  });

  it("marks choices the published catalogue has since dropped", async () => {
    configurationMocks.getPublicConfiguration.mockResolvedValue({
      ...snapshot,
      selectedChoices: [
        { ...snapshot.selectedChoices[0], isCurrentlyAvailable: false },
      ],
    });

    const payload = await buildOfferFromReference("K7M2QPX9RT4B");

    expect(payload?.offer.hasUnavailableSelections).toBe(true);
    expect(payload?.offer.groups[0].items[0].unavailable).toBe(true);
  });

  it("returns nothing for a reference that does not exist", async () => {
    configurationMocks.getPublicConfiguration.mockResolvedValue(undefined);

    await expect(
      buildOfferFromReference("K7M2QPX9RT4B"),
    ).resolves.toBeUndefined();
  });
}, 30_000);
