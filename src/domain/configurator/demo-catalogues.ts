import { motorcycles, type Motorcycle } from "@/data/catalogue";
import { terran900RallyConfigurator } from "@/domain/configurator/terran-900-rally";
import type {
  ConfiguratorCatalogue,
  ConfiguratorVisualMedia,
} from "@/domain/configurator/types";

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

type FinishId = (typeof finishes)[number]["id"];

const finishImagesByModel: Record<string, Record<FinishId, string>> = {
  "terran-650": {
    signature:
      "/images/configurator/terran-650/color-signature-front-three-quarter.webp",
    graphite:
      "/images/configurator/terran-650/color-graphite-front-three-quarter.webp",
    glacier:
      "/images/configurator/terran-650/color-glacier-front-three-quarter.webp",
  },
  "apex-675-r": {
    signature: "/images/models/apex-675-r.webp",
    graphite:
      "/images/configurator/apex-675-r/color-graphite-front-three-quarter.webp",
    glacier:
      "/images/configurator/apex-675-r/color-glacier-front-three-quarter.webp",
  },
  "apex-900-rr": {
    signature:
      "/images/configurator/apex-900-rr/color-signature-front-three-quarter.webp",
    graphite:
      "/images/configurator/apex-900-rr/color-graphite-front-three-quarter.webp",
    glacier:
      "/images/configurator/apex-900-rr/color-glacier-front-three-quarter.webp",
  },
  "rift-700": {
    signature: "/images/models/rift-700.webp",
    graphite:
      "/images/configurator/rift-700/color-graphite-front-three-quarter.webp",
    glacier:
      "/images/configurator/rift-700/color-glacier-front-three-quarter.webp",
  },
  "meridian-900-gt": {
    signature:
      "/images/configurator/meridian-900-gt/color-signature-front-three-quarter.webp",
    graphite:
      "/images/configurator/meridian-900-gt/color-graphite-front-three-quarter.webp",
    glacier: "/images/models/meridian-900-gt.webp",
  },
  "foundry-800": {
    signature:
      "/images/configurator/foundry-800/color-signature-front-three-quarter.webp",
    graphite: "/images/models/foundry-800.webp",
    glacier:
      "/images/configurator/foundry-800/color-glacier-front-three-quarter.webp",
  },
  "volt-e2": {
    signature:
      "/images/configurator/volt-e2/color-signature-front-three-quarter.webp",
    graphite:
      "/images/configurator/volt-e2/color-graphite-front-three-quarter.webp",
    glacier: "/images/models/volt-e2.webp",
  },
};

const overlayChoices = [
  { id: "seat-low", label: "șa joasă", sortOrder: 20 },
  { id: "seat-comfort", label: "șa Comfort", sortOrder: 21 },
  { id: "touring-pack", label: "pachet Touring", sortOrder: 40 },
  { id: "urban-pack", label: "pachet Urban", sortOrder: 50 },
  { id: "luggage-set", label: "set bagaje", sortOrder: 60 },
] as const;

function getFinishImages(model: Motorcycle) {
  return (
    finishImagesByModel[model.slug] ?? {
      signature: model.image,
      graphite: model.image,
      glacier: model.image,
    }
  );
}

function buildVisualMedia(model: Motorcycle): ConfiguratorVisualMedia[] {
  const finishImages = getFinishImages(model);
  const bases = finishes.map((finish, index) => ({
    role: "base" as const,
    image: finishImages[finish.id],
    alt: `${model.name} în finisaj ${finish.name}`,
    viewAngle: "front-three-quarter",
    optionChoiceId: `color-${finish.id}`,
    sortOrder: index,
  }));
  const overlays = overlayChoices.map((choice) => ({
    role: "overlay" as const,
    image: `/images/configurator/${model.slug}/${choice.id}-front-three-quarter.webp`,
    alt: `${model.name} cu ${choice.label}`,
    viewAngle: "front-three-quarter",
    optionChoiceId: choice.id,
    sortOrder: choice.sortOrder,
  }));

  return [...bases, ...overlays];
}

function genericCatalogue(model: Motorcycle): ConfiguratorCatalogue {
  const finishImages = getFinishImages(model);

  return {
    modelId: model.slug,
    modelName: model.name,
    currency: "RON",
    basePriceMinor: model.price * 100,
    previewAngles: ["front-three-quarter"],
    visualMedia: buildVisualMedia(model),
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
          image: finishImages[finish.id],
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
