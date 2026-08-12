import { describe, expect, it } from "vitest";

import type {
  ConfigurationState,
  ConfiguratorCatalogue,
  ConfiguratorVisualMedia,
} from "@/domain/configurator/types";
import { resolveConfigurationVisuals } from "@/domain/configurator/visuals";

const groups: ConfiguratorCatalogue["groups"] = [
  {
    id: "finish",
    name: "Finisaj",
    shortName: "Finisaj",
    description: "Alege finisajul.",
    mode: "single",
    required: true,
    choices: [
      {
        id: "green",
        name: "Veridian Green",
        shortDescription: "Finisaj standard.",
        priceDeltaMinor: 0,
        published: true,
        default: true,
      },
      {
        id: "white",
        name: "Glacier White",
        shortDescription: "Finisaj opțional.",
        priceDeltaMinor: 79_000,
        published: true,
      },
    ],
  },
  {
    id: "accessories",
    name: "Accesorii",
    shortName: "Accesorii",
    description: "Alege accesoriile.",
    mode: "multi",
    required: false,
    maxSelections: 3,
    choices: [
      {
        id: "screen",
        name: "Parbriz Touring",
        shortDescription: "Parbriz înalt.",
        priceDeltaMinor: 69_000,
        published: true,
      },
      {
        id: "bars",
        name: "Bare protecție motor",
        shortDescription: "Protecție tubulară.",
        priceDeltaMinor: 129_000,
        published: true,
      },
    ],
  },
];

function catalogue(
  visualMedia?: readonly ConfiguratorVisualMedia[],
): ConfiguratorCatalogue {
  return {
    modelId: "terran",
    modelName: "Terran",
    currency: "RON",
    basePriceMinor: 4_999_000,
    previewAngles: ["front", "side"],
    visualMedia,
    standardEquipment: [],
    groups,
  };
}

function state(
  finish: string,
  accessories: readonly string[] = [],
): ConfigurationState {
  return {
    modelId: "terran",
    selectedByGroup: { finish: [finish], accessories },
    previewAngle: "front",
  };
}

describe("resolveConfigurationVisuals", () => {
  it("keeps catalogues without visual media compatible", () => {
    expect(
      resolveConfigurationVisuals(catalogue(), state("green"), "front"),
    ).toEqual({ base: undefined, overlays: [] });
  });

  it("prefers a base assigned to a selected option over the generic base", () => {
    const genericBase: ConfiguratorVisualMedia = {
      role: "base",
      image: "/generic.webp",
      alt: "Motocicletă standard",
      viewAngle: "front",
      sortOrder: 0,
    };
    const whiteBase: ConfiguratorVisualMedia = {
      role: "base",
      image: "/white.webp",
      alt: "Motocicletă albă",
      viewAngle: "front",
      optionChoiceId: "white",
      sortOrder: 10,
    };

    const result = resolveConfigurationVisuals(
      catalogue([
        genericBase,
        whiteBase,
        {
          ...whiteBase,
          image: "/green.webp",
          optionChoiceId: "green",
          sortOrder: 5,
        },
      ]),
      state("white"),
      "front",
    );

    expect(result.base).toBe(whiteBase);
  });

  it("falls back to the generic base for the requested angle", () => {
    const frontBase: ConfiguratorVisualMedia = {
      role: "base",
      image: "/front.webp",
      alt: "Motocicletă din față",
      viewAngle: "front",
      sortOrder: 0,
    };

    expect(
      resolveConfigurationVisuals(
        catalogue([
          frontBase,
          {
            role: "base",
            image: "/side.webp",
            alt: "Motocicletă din lateral",
            viewAngle: "side",
            sortOrder: 0,
          },
        ]),
        state("green"),
        "front",
      ).base,
    ).toBe(frontBase);
  });

  it("returns only selected overlays for the angle in stable layer order", () => {
    const visualMedia: readonly ConfiguratorVisualMedia[] = [
      {
        role: "overlay",
        image: "/screen.webp",
        alt: "Parbriz Touring",
        viewAngle: "front",
        optionChoiceId: "screen",
        sortOrder: 20,
      },
      {
        role: "overlay",
        image: "/bars.webp",
        alt: "Bare protecție motor",
        viewAngle: "front",
        optionChoiceId: "bars",
        sortOrder: 10,
      },
      {
        role: "overlay",
        image: "/screen-detail.webp",
        alt: "Detaliu parbriz Touring",
        viewAngle: "front",
        optionChoiceId: "screen",
        sortOrder: 20,
      },
      {
        role: "overlay",
        image: "/unassigned.webp",
        alt: "Overlay neasociat",
        viewAngle: "front",
        sortOrder: 5,
      },
      {
        role: "overlay",
        image: "/side-screen.webp",
        alt: "Parbriz Touring din lateral",
        viewAngle: "side",
        optionChoiceId: "screen",
        sortOrder: 0,
      },
    ];

    const result = resolveConfigurationVisuals(
      catalogue(visualMedia),
      state("green", ["screen", "bars"]),
      "front",
    );

    expect(result.overlays.map((media) => media.image)).toEqual([
      "/bars.webp",
      "/screen.webp",
      "/screen-detail.webp",
    ]);
    expect(visualMedia.map((media) => media.image)).toEqual([
      "/screen.webp",
      "/bars.webp",
      "/screen-detail.webp",
      "/unassigned.webp",
      "/side-screen.webp",
    ]);
  });
});
