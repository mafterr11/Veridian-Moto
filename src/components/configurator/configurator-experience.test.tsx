import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(public)/configurator/actions", () => ({
  saveConfigurationAction: vi.fn(async () => ({ status: "idle" })),
}));

import { ConfiguratorExperience } from "@/components/configurator/configurator-experience";
import { terran900RallyConfigurator } from "@/domain/configurator/terran-900-rally";

const props = {
  catalogue: terran900RallyConfigurator,
  model: {
    slug: "terran-900-rally",
    category: "Adventure",
    powerHp: 105,
    torqueNm: 93,
    wetWeightKg: 229,
    image: "/images/models/terran-900-rally.webp",
    imageAlt: "VERIDIAN Terran 900 Rally",
  },
};

describe("ConfiguratorExperience", () => {
  it("changes the complete render and total when a finish is selected", () => {
    render(<ConfiguratorExperience {...props} />);

    expect(
      screen.getByAltText(
        "VERIDIAN Terran 900 Rally în finisaj Veridian Green",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Glacier White/i }));

    expect(
      screen.getByAltText("VERIDIAN Terran 900 Rally în finisaj Glacier White"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Glacier White/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/50\.780/)).toBeInTheDocument();
  });

  it("surfaces an automatically selected requirement", () => {
    render(<ConfiguratorExperience {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /4\. Protecție/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Kit protecție Rally/i }),
    );

    expect(
      screen.getByText(
        /Bare protecție motor a fost adăugată automat deoarece este necesară/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Bare protecție motor/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("explains an exclusion and swaps incompatible luggage", () => {
    render(<ConfiguratorExperience {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /5\. Bagaje/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Cutii laterale aluminium/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Genți laterale Adventure/i }),
    );

    expect(
      screen.getByText(/Cutii laterale aluminium a fost eliminată/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cutii laterale aluminium/i }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: /Genți laterale Adventure/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
