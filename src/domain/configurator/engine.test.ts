import { describe, expect, it } from "vitest";

import {
  createConfigurationSnapshot,
  createInitialState,
  evaluateConfiguration,
  updateChoice,
  validateCatalogue,
  validateConfiguration,
  verifyClientTotal,
} from "@/domain/configurator/engine";
import { terran900RallyConfigurator } from "@/domain/configurator/terran-900-rally";
import type {
  ConfigurationState,
  ConfiguratorCatalogue,
} from "@/domain/configurator/types";

function select(state: ConfigurationState, choiceId: string) {
  const result = updateChoice(
    terran900RallyConfigurator,
    state,
    choiceId,
    true,
  );
  expect(result.accepted).toBe(true);
  return result.state;
}

describe("configurator engine", () => {
  it("creates every required default selection", () => {
    const state = createInitialState(terran900RallyConfigurator);

    expect(state.selectedByGroup).toMatchObject({
      finish: ["color-veridian"],
      ergonomics: ["seat-standard"],
      technology: ["tech-standard"],
      protection: [],
      luggage: [],
      accessories: [],
    });
    expect(validateConfiguration(terran900RallyConfigurator, state)).toEqual(
      [],
    );
  });

  it("calculates the base price with included defaults", () => {
    const evaluation = evaluateConfiguration(
      terran900RallyConfigurator,
      createInitialState(terran900RallyConfigurator),
    );

    expect(evaluation.totalMinor).toBe(4_999_000);
    expect(evaluation.issues).toEqual([]);
  });

  it("adds multiple integer price deltas", () => {
    let state = createInitialState(terran900RallyConfigurator);
    state = select(state, "color-glacier");
    state = select(state, "tech-rally");
    state = select(state, "engine-bars");

    expect(
      evaluateConfiguration(terran900RallyConfigurator, state).totalMinor,
    ).toBe(5_486_000);
  });

  it("automatically selects direct requirements", () => {
    const initial = createInitialState(terran900RallyConfigurator);
    const result = updateChoice(
      terran900RallyConfigurator,
      initial,
      "rally-protection",
      true,
    );

    expect(result.accepted).toBe(true);
    expect(result.state.selectedByGroup.protection).toEqual([
      "rally-protection",
      "engine-bars",
    ]);
    expect(
      result.notices.some((notice) => notice.code === "required-added"),
    ).toBe(true);
  });

  it("removes an incompatible choice and keeps its shared requirement", () => {
    let state = createInitialState(terran900RallyConfigurator);
    state = select(state, "aluminium-cases");
    const result = updateChoice(
      terran900RallyConfigurator,
      state,
      "soft-bags",
      true,
    );

    expect(result.accepted).toBe(true);
    expect(result.state.selectedByGroup.luggage).toContain("luggage-rack");
    expect(result.state.selectedByGroup.luggage).toContain("soft-bags");
    expect(result.state.selectedByGroup.luggage).not.toContain(
      "aluminium-cases",
    );
    expect(
      result.notices.some((notice) => notice.code === "incompatible-removed"),
    ).toBe(true);
  });

  it("replaces the previous selection in a single-choice group", () => {
    let state = createInitialState(terran900RallyConfigurator);
    state = select(state, "color-glacier");
    const result = updateChoice(
      terran900RallyConfigurator,
      state,
      "color-ember",
      true,
    );

    expect(result.state.selectedByGroup.finish).toEqual(["color-ember"]);
    expect(
      result.notices.some((notice) => notice.code === "choice-replaced"),
    ).toBe(true);
  });

  it("rejects a choice when a multi-select group is already full", () => {
    let state = createInitialState(terran900RallyConfigurator);
    state = select(state, "rally-protection");
    const result = updateChoice(
      terran900RallyConfigurator,
      state,
      "radiator-guard",
      true,
    );

    expect(result.accepted).toBe(false);
    expect(result.state).toBe(state);
    expect(result.notices[0]?.code).toBe("limit-reached");
  });

  it("rejects invalid choice identifiers without changing state", () => {
    const state = createInitialState(terran900RallyConfigurator);
    const result = updateChoice(
      terran900RallyConfigurator,
      state,
      "does-not-exist",
      true,
    );

    expect(result.accepted).toBe(false);
    expect(result.state).toBe(state);
    expect(result.notices[0]?.code).toBe("invalid-choice");
  });

  it("rejects unpublished choices but can validate a historical selection", () => {
    const state = createInitialState(terran900RallyConfigurator);
    const result = updateChoice(
      terran900RallyConfigurator,
      state,
      "archived-heated-seat",
      true,
    );
    const historical: ConfigurationState = {
      ...state,
      selectedByGroup: {
        ...state.selectedByGroup,
        accessories: ["archived-heated-seat"],
      },
    };

    expect(result.accepted).toBe(false);
    expect(result.notices[0]?.code).toBe("unpublished-choice");
    expect(
      validateConfiguration(terran900RallyConfigurator, historical).some(
        (issue) => issue.code === "unpublished-selection",
      ),
    ).toBe(true);
    expect(
      validateConfiguration(terran900RallyConfigurator, historical, {
        allowUnpublishedSelected: true,
      }),
    ).toEqual([]);
  });

  it("rejects dependency cycles during catalogue validation", () => {
    const cyclicCatalogue: ConfiguratorCatalogue = {
      modelId: "cycle-test",
      modelName: "Cycle Test",
      currency: "RON",
      basePriceMinor: 100_000,
      previewAngles: ["front"],
      standardEquipment: [],
      groups: [
        {
          id: "options",
          name: "Options",
          shortName: "Options",
          description: "Cycle fixture",
          mode: "multi",
          required: false,
          maxSelections: 2,
          choices: [
            {
              id: "a",
              name: "A",
              shortDescription: "A",
              priceDeltaMinor: 0,
              published: true,
              requires: ["b"],
            },
            {
              id: "b",
              name: "B",
              shortDescription: "B",
              priceDeltaMinor: 0,
              published: true,
              requires: ["a"],
            },
          ],
        },
      ],
    };

    expect(
      validateCatalogue(cyclicCatalogue).some(
        (issue) => issue.code === "dependency-cycle",
      ),
    ).toBe(true);
  });

  it("detects a browser/server total mismatch", () => {
    const state = createInitialState(terran900RallyConfigurator);
    const verification = verifyClientTotal(
      terran900RallyConfigurator,
      state,
      4_999_001,
    );

    expect(verification.totalMinor).toBe(4_999_000);
    expect(verification.matches).toBe(false);
  });

  it("creates a stable historical snapshot", () => {
    let state = createInitialState(terran900RallyConfigurator);
    state = select(state, "color-glacier");
    const snapshot = createConfigurationSnapshot({
      catalogue: terran900RallyConfigurator,
      state,
      reference: "VRD-TEST-001",
      createdAt: "2026-07-20T12:00:00.000Z",
    });
    const changedCatalogue: ConfiguratorCatalogue = {
      ...terran900RallyConfigurator,
      basePriceMinor: 9_999_000,
    };

    expect(snapshot.totalMinor).toBe(5_078_000);
    expect(snapshot.basePriceMinor).toBe(4_999_000);
    expect(evaluateConfiguration(changedCatalogue, state).totalMinor).toBe(
      10_078_000,
    );
    expect(snapshot.totalMinor).toBe(5_078_000);
  });

  it("does not allow a required single choice to be removed", () => {
    const state = createInitialState(terran900RallyConfigurator);
    const result = updateChoice(
      terran900RallyConfigurator,
      state,
      "color-veridian",
      false,
    );

    expect(result.accepted).toBe(false);
    expect(result.notices[0]?.code).toBe("required-choice");
  });
});
