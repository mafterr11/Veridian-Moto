import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigurationPreview } from "@/components/configurator/configuration-preview";
import type {
  ConfigurationState,
  ConfiguratorCatalogue,
} from "@/domain/configurator/types";

const catalogue: ConfiguratorCatalogue = {
  modelId: "test-moto",
  modelName: "Test Moto",
  currency: "RON",
  basePriceMinor: 1_000_000,
  previewAngles: ["front-three-quarter", "side"],
  visualMedia: [
    {
      role: "base",
      image: "/base.webp",
      alt: "Test Moto verde",
      viewAngle: "front-three-quarter",
      optionChoiceId: "green",
      sortOrder: 0,
    },
    {
      role: "overlay",
      image: "/screen.webp",
      alt: "Parbriz înalt",
      viewAngle: "front-three-quarter",
      optionChoiceId: "screen",
      sortOrder: 10,
    },
    {
      role: "base",
      image: "/side.webp",
      alt: "Test Moto văzută din profil",
      viewAngle: "side",
      sortOrder: 0,
    },
  ],
  standardEquipment: [],
  groups: [
    {
      id: "finish",
      name: "Finisaj",
      shortName: "Finisaj",
      description: "",
      mode: "single",
      required: true,
      choices: [
        {
          id: "green",
          name: "Veridian Green",
          shortDescription: "",
          priceDeltaMinor: 0,
          published: true,
          default: true,
          image: "/legacy-green.webp",
          swatch: "#007a59",
        },
      ],
    },
    {
      id: "accessories",
      name: "Accesorii",
      shortName: "Accesorii",
      description: "",
      mode: "multi",
      required: false,
      maxSelections: 2,
      choices: [
        {
          id: "screen",
          name: "Parbriz Touring",
          shortDescription: "",
          priceDeltaMinor: 50_000,
          published: true,
        },
      ],
    },
  ],
};

const configuration: ConfigurationState = {
  modelId: "test-moto",
  previewAngle: "front-three-quarter",
  selectedByGroup: {
    finish: ["green"],
    accessories: ["screen"],
  },
};

describe("ConfigurationPreview", () => {
  it("stacks the selected base and decorative overlays and exposes a text summary", () => {
    const { container } = render(
      <ConfigurationPreview
        catalogue={catalogue}
        configuration={configuration}
        fallbackImage="/fallback.webp"
        fallbackImageAlt="Fallback moto"
        onViewAngleChange={vi.fn()}
      />,
    );

    expect(screen.getByAltText("Test Moto verde")).toBeInTheDocument();
    const overlay = container.querySelector('[data-visual-role="overlay"] img');
    expect(overlay).toHaveAttribute("alt", "");
    expect(
      screen.getByLabelText("Previzualizarea configurației"),
    ).toHaveAccessibleDescription(
      /opțiuni vizibile: Veridian Green, Parbriz Touring/i,
    );
  });

  it("shows angle controls only when multiple angles are available", () => {
    const onViewAngleChange = vi.fn();
    const { rerender } = render(
      <ConfigurationPreview
        catalogue={catalogue}
        configuration={configuration}
        fallbackImage="/fallback.webp"
        fallbackImageAlt="Fallback moto"
        onViewAngleChange={onViewAngleChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Profil" }));
    expect(onViewAngleChange).toHaveBeenCalledWith("side");

    rerender(
      <ConfigurationPreview
        catalogue={{ ...catalogue, previewAngles: ["front-three-quarter"] }}
        configuration={configuration}
        fallbackImage="/fallback.webp"
        fallbackImageAlt="Fallback moto"
        onViewAngleChange={onViewAngleChange}
      />,
    );
    expect(
      screen.queryByRole("group", { name: "Unghiul previzualizării" }),
    ).not.toBeInTheDocument();
  });

  it("highlights a newly selected visual layer and announces the update", () => {
    const { container, rerender } = render(
      <ConfigurationPreview
        catalogue={catalogue}
        configuration={configuration}
        fallbackImage="/fallback.webp"
        fallbackImageAlt="Fallback moto"
        onViewAngleChange={vi.fn()}
        selectionSignal={{ choiceIds: ["screen"], revision: 1 }}
      />,
    );

    const firstHighlightedLayer = container.querySelector(
      '[data-visual-choice-id="screen"]',
    );
    expect(firstHighlightedLayer).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByRole("status")).toHaveTextContent(/Parbriz Touring/i);

    rerender(
      <ConfigurationPreview
        catalogue={catalogue}
        configuration={configuration}
        fallbackImage="/fallback.webp"
        fallbackImageAlt="Fallback moto"
        onViewAngleChange={vi.fn()}
        selectionSignal={{ choiceIds: ["screen"], revision: 2 }}
      />,
    );

    expect(
      container.querySelector('[data-visual-choice-id="screen"]'),
    ).not.toBe(firstHighlightedLayer);
  });

  it("preserves the legacy finish-image preview without layered media", () => {
    render(
      <ConfigurationPreview
        catalogue={{ ...catalogue, visualMedia: undefined }}
        configuration={configuration}
        fallbackImage="/fallback.webp"
        fallbackImageAlt="Fallback moto"
        onViewAngleChange={vi.fn()}
      />,
    );

    expect(
      screen.getByAltText("VERIDIAN Test Moto în finisaj Veridian Green"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Unghiul previzualizării" }),
    ).not.toBeInTheDocument();
  });
});
