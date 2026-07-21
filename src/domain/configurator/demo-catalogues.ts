import { motorcycles, type Motorcycle } from "@/data/catalogue";
import { terran900RallyConfigurator } from "@/domain/configurator/terran-900-rally";
import type { ConfiguratorCatalogue } from "@/domain/configurator/types";

const finishes = [
  {
    id: "signature",
    name: "Veridian Green",
    swatch: "#007A59",
    priceDeltaMinor: 0,
  },
  {
    id: "graphite",
    name: "Graphite Black",
    swatch: "#262B2A",
    priceDeltaMinor: 59_000,
  },
  {
    id: "glacier",
    name: "Glacier White",
    swatch: "#E8EBE7",
    priceDeltaMinor: 79_000,
  },
] as const;

function genericCatalogue(model: Motorcycle): ConfiguratorCatalogue {
  return {
    modelId: model.slug,
    modelName: model.name,
    currency: "RON",
    basePriceMinor: model.price * 100,
    previewAngles: ["front-three-quarter"],
    standardEquipment: model.highlights,
    groups: [
      {
        id: "finish",
        key: "finish",
        name: "Culoare și finisaj",
        shortName: "Finisaj",
        description:
          "Finisaje atent selectate pentru personalitatea modelului.",
        mode: "single",
        required: true,
        choices: finishes.map((finish, index) => ({
          id: `color-${finish.id}`,
          code: `color-${finish.id}`,
          name: finish.name,
          shortDescription:
            index === 0
              ? "Culoarea semnătură VERIDIAN, inclusă în preț."
              : "Finisaj premium cu detalii contrastante.",
          priceDeltaMinor: finish.priceDeltaMinor,
          published: true,
          default: index === 0,
          image: model.image,
          swatch: finish.swatch,
          badge: index === 0 ? "Standard" : undefined,
        })),
      },
      {
        id: "ergonomics",
        key: "ergonomics",
        name: "Ergonomie",
        shortName: "Ergonomie",
        description: "Adaptează poziția și confortul pentru drumurile tale.",
        mode: "single",
        required: true,
        choices: [
          {
            id: "ergonomics-standard",
            code: "ergonomics-standard",
            name: "Ergonomie standard",
            shortDescription: "Geometria standard omologată pentru model.",
            priceDeltaMinor: 0,
            published: true,
            default: true,
            badge: "Inclus",
          },
          {
            id: "seat-comfort",
            code: "seat-comfort",
            name: "Șa Comfort",
            shortDescription:
              "Spumă cu densitate progresivă pentru etape lungi.",
            priceDeltaMinor: 89_000,
            published: true,
          },
          {
            id: "seat-low",
            code: "seat-low",
            name: "Șa joasă",
            shortDescription: "Acces mai ușor la sol fără improvizații.",
            priceDeltaMinor: 0,
            published: true,
          },
        ],
      },
      {
        id: "touring",
        key: "touring",
        name: "Echipare și bagaje",
        shortName: "Echipare",
        description: "Maximum două opțiuni pentru utilizarea principală.",
        mode: "multi",
        required: false,
        maxSelections: 2,
        choices: [
          {
            id: "touring-pack",
            code: "touring-pack",
            name: "Pachet Touring",
            shortDescription: "Parbriz înalt, suporturi și prize suplimentare.",
            priceDeltaMinor: 169_000,
            published: true,
          },
          {
            id: "luggage-set",
            code: "luggage-set",
            name: "Set bagaje",
            shortDescription: "Sistem de bagaje dedicat și montaj inclus.",
            priceDeltaMinor: 249_000,
            published: true,
          },
          {
            id: "urban-pack",
            code: "urban-pack",
            name: "Pachet Urban",
            shortDescription: "Protecții discrete și suport de navigație.",
            priceDeltaMinor: 99_000,
            published: true,
          },
        ],
      },
    ],
  };
}

export const demoConfiguratorCatalogues: readonly ConfiguratorCatalogue[] =
  motorcycles.map((model) =>
    model.slug === "terran-900-rally"
      ? terran900RallyConfigurator
      : genericCatalogue(model),
  );

export function getDemoConfigurator(slug: string) {
  return demoConfiguratorCatalogues.find(
    (catalogue) => catalogue.modelId === slug,
  );
}
