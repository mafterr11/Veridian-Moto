import type {
  ConfigurationSnapshot,
  ConfigurationState,
  ConfiguratorCatalogue,
  ConfiguratorChoice,
  ConfiguratorGroup,
  EvaluatedConfiguration,
  RuleNotice,
  SelectionResult,
  ValidationIssue,
} from "@/domain/configurator/types";

type IndexedChoice = {
  choice: ConfiguratorChoice;
  group: ConfiguratorGroup;
};

function indexCatalogue(catalogue: ConfiguratorCatalogue) {
  const groups = new Map(catalogue.groups.map((group) => [group.id, group]));
  const choices = new Map<string, IndexedChoice>();

  for (const group of catalogue.groups) {
    for (const choice of group.choices) {
      choices.set(choice.id, { choice, group });
    }
  }

  return { groups, choices };
}

function cloneState(state: ConfigurationState): ConfigurationState {
  return {
    ...state,
    selectedByGroup: Object.fromEntries(
      Object.entries(state.selectedByGroup).map(([groupId, choices]) => [
        groupId,
        [...choices],
      ]),
    ),
  };
}

function selectedIds(state: ConfigurationState) {
  return new Set(Object.values(state.selectedByGroup).flat());
}

function removeChoice(
  state: ConfigurationState,
  groupId: string,
  choiceId: string,
) {
  state.selectedByGroup[groupId] = (
    state.selectedByGroup[groupId] ?? []
  ).filter((selectedId) => selectedId !== choiceId);
}

export function validateCatalogue(catalogue: ConfiguratorCatalogue) {
  const issues: ValidationIssue[] = [];
  const groupIds = new Set<string>();
  const choiceIds = new Set<string>();
  const indexed = indexCatalogue(catalogue);

  if (
    !Number.isInteger(catalogue.basePriceMinor) ||
    catalogue.basePriceMinor < 0
  ) {
    issues.push({
      code: "invalid-price",
      message: "Prețul de bază trebuie să fie un număr întreg pozitiv în bani.",
    });
  }

  for (const group of catalogue.groups) {
    if (groupIds.has(group.id)) {
      issues.push({
        code: "duplicate-group",
        groupId: group.id,
        message: `Grupul ${group.id} este definit de mai multe ori.`,
      });
    }
    groupIds.add(group.id);

    const defaults = group.choices.filter((choice) => choice.default);
    if (
      (group.mode === "single" && group.required && defaults.length !== 1) ||
      (group.mode === "single" && defaults.length > 1)
    ) {
      issues.push({
        code: "invalid-default",
        groupId: group.id,
        message: `Grupul ${group.name} are o configurație implicită invalidă.`,
      });
    }

    if (
      group.mode === "multi" &&
      (!group.maxSelections || group.maxSelections < 1)
    ) {
      issues.push({
        code: "invalid-limit",
        groupId: group.id,
        message: `Grupul ${group.name} trebuie să aibă o limită pozitivă.`,
      });
    }

    if (
      group.mode === "multi" &&
      group.maxSelections &&
      defaults.length > group.maxSelections
    ) {
      issues.push({
        code: "invalid-default",
        groupId: group.id,
        message: `Grupul ${group.name} are prea multe opțiuni implicite.`,
      });
    }

    for (const choice of group.choices) {
      if (choiceIds.has(choice.id)) {
        issues.push({
          code: "duplicate-choice",
          groupId: group.id,
          choiceId: choice.id,
          message: `Opțiunea ${choice.id} este definită de mai multe ori.`,
        });
      }
      choiceIds.add(choice.id);

      if (!Number.isInteger(choice.priceDeltaMinor)) {
        issues.push({
          code: "invalid-price",
          groupId: group.id,
          choiceId: choice.id,
          message: `Prețul opțiunii ${choice.name} trebuie stocat în bani.`,
        });
      }
    }
  }

  for (const group of catalogue.groups) {
    for (const choice of group.choices) {
      const requirements = new Set(choice.requires ?? []);
      const exclusions = new Set(choice.excludes ?? []);

      for (const targetId of [...requirements, ...exclusions]) {
        const target = indexed.choices.get(targetId);
        if (!target) {
          issues.push({
            code: "unknown-reference",
            groupId: group.id,
            choiceId: choice.id,
            relatedChoiceId: targetId,
            message: `${choice.name} indică o opțiune inexistentă: ${targetId}.`,
          });
          continue;
        }

        if (targetId === choice.id) {
          issues.push({
            code: "self-reference",
            groupId: group.id,
            choiceId: choice.id,
            relatedChoiceId: targetId,
            message: `${choice.name} nu se poate referi la propria opțiune.`,
          });
        }
      }

      for (const targetId of requirements) {
        const target = indexed.choices.get(targetId);
        if (exclusions.has(targetId)) {
          issues.push({
            code: "contradictory-rule",
            groupId: group.id,
            choiceId: choice.id,
            relatedChoiceId: targetId,
            message: `${choice.name} nu poate cere și exclude aceeași opțiune.`,
          });
        }
        if (target && !target.choice.published && choice.published) {
          issues.push({
            code: "unpublished-requirement",
            groupId: group.id,
            choiceId: choice.id,
            relatedChoiceId: targetId,
            message: `${choice.name} depinde de o opțiune nepublicată.`,
          });
        }
        if (
          target &&
          target.group.id === group.id &&
          group.mode === "single" &&
          targetId !== choice.id
        ) {
          issues.push({
            code: "impossible-single-requirement",
            groupId: group.id,
            choiceId: choice.id,
            relatedChoiceId: targetId,
            message: `${choice.name} cere o altă opțiune din același grup exclusiv.`,
          });
        }
      }
    }
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(choiceId: string, path: readonly string[]) {
    if (visiting.has(choiceId)) {
      issues.push({
        code: "dependency-cycle",
        choiceId,
        message: `Dependență circulară detectată: ${[...path, choiceId].join(" → ")}.`,
      });
      return;
    }
    if (visited.has(choiceId)) return;

    visiting.add(choiceId);
    const indexedChoice = indexed.choices.get(choiceId);
    for (const requirement of indexedChoice?.choice.requires ?? []) {
      if (indexed.choices.has(requirement)) {
        visit(requirement, [...path, choiceId]);
      }
    }
    visiting.delete(choiceId);
    visited.add(choiceId);
  }

  for (const choiceId of indexed.choices.keys()) visit(choiceId, []);

  return issues;
}

export function createInitialState(
  catalogue: ConfiguratorCatalogue,
): ConfigurationState {
  const catalogueIssues = validateCatalogue(catalogue);
  if (catalogueIssues.length) {
    throw new Error(catalogueIssues.map((issue) => issue.message).join(" "));
  }

  const state: ConfigurationState = {
    modelId: catalogue.modelId,
    selectedByGroup: Object.fromEntries(
      catalogue.groups.map((group) => [
        group.id,
        group.choices
          .filter((choice) => choice.default)
          .map((choice) => choice.id),
      ]),
    ),
    previewAngle: catalogue.previewAngles[0] ?? "front-three-quarter",
  };

  const configurationIssues = validateConfiguration(catalogue, state);
  if (configurationIssues.length) {
    throw new Error(
      configurationIssues.map((issue) => issue.message).join(" "),
    );
  }

  return state;
}

export function updateChoice(
  catalogue: ConfiguratorCatalogue,
  state: ConfigurationState,
  choiceId: string,
  shouldSelect: boolean,
): SelectionResult {
  const indexed = indexCatalogue(catalogue);
  const target = indexed.choices.get(choiceId);

  if (!target) {
    return rejected(state, {
      code: "invalid-choice",
      tone: "error",
      choiceId,
      message: "Opțiunea selectată nu există în catalogul curent.",
    });
  }

  if (!target.choice.published && shouldSelect) {
    return rejected(state, {
      code: "unpublished-choice",
      tone: "error",
      choiceId,
      message: `${target.choice.name} nu este disponibilă pentru selecții noi.`,
    });
  }

  const currentlySelected = selectedIds(state).has(choiceId);
  if (currentlySelected === shouldSelect) {
    return { state, notices: [], accepted: true };
  }

  if (!shouldSelect) {
    if (target.group.required && target.group.mode === "single") {
      return rejected(state, {
        code: "required-choice",
        tone: "warning",
        choiceId,
        message: `Alege o altă opțiune pentru ${target.group.name} înainte să o elimini pe aceasta.`,
      });
    }

    const dependent = [...indexed.choices.values()].find(
      ({ choice }) =>
        selectedIds(state).has(choice.id) &&
        (choice.requires ?? []).includes(choiceId),
    );
    if (dependent) {
      return rejected(state, {
        code: "required-by-choice",
        tone: "warning",
        choiceId,
        relatedChoiceId: dependent.choice.id,
        message: `${target.choice.name} este necesară pentru ${dependent.choice.name}.`,
      });
    }

    const draft = cloneState(state);
    removeChoice(draft, target.group.id, choiceId);
    return {
      state: draft,
      notices: [
        {
          code: "choice-removed",
          tone: "info",
          choiceId,
          message: `${target.choice.name} a fost eliminată.`,
        },
      ],
      accepted: true,
    };
  }

  const draft = cloneState(state);
  const notices: RuleNotice[] = [];
  const resolving = new Set<string>();

  function ensureSelected(requiredChoiceId: string, isRequirement: boolean) {
    if (selectedIds(draft).has(requiredChoiceId)) return true;
    if (resolving.has(requiredChoiceId)) return false;

    const entry = indexed.choices.get(requiredChoiceId);
    if (!entry || !entry.choice.published) return false;
    resolving.add(requiredChoiceId);

    const selected = selectedIds(draft);
    const conflicts = [...selected].filter((selectedId) => {
      const existing = indexed.choices.get(selectedId)?.choice;
      return (
        (entry.choice.excludes ?? []).includes(selectedId) ||
        (existing?.excludes ?? []).includes(requiredChoiceId)
      );
    });

    for (const conflictingId of conflicts) {
      const conflicting = indexed.choices.get(conflictingId);
      if (!conflicting) continue;
      removeChoice(draft, conflicting.group.id, conflictingId);
      notices.push({
        code: "incompatible-removed",
        tone: "warning",
        choiceId: conflictingId,
        relatedChoiceId: requiredChoiceId,
        message: `${conflicting.choice.name} a fost eliminată deoarece nu este compatibilă cu ${entry.choice.name}.`,
      });
    }

    const groupSelections = draft.selectedByGroup[entry.group.id] ?? [];
    if (entry.group.mode === "single") {
      for (const previousId of groupSelections) {
        if (previousId === requiredChoiceId) continue;
        const previous = indexed.choices.get(previousId);
        removeChoice(draft, entry.group.id, previousId);
        if (previous) {
          notices.push({
            code: "choice-replaced",
            tone: "info",
            choiceId: previousId,
            relatedChoiceId: requiredChoiceId,
            message: `${previous.choice.name} a fost înlocuită cu ${entry.choice.name}.`,
          });
        }
      }
    } else if (
      entry.group.maxSelections &&
      (draft.selectedByGroup[entry.group.id] ?? []).length >=
        entry.group.maxSelections
    ) {
      resolving.delete(requiredChoiceId);
      return false;
    }

    draft.selectedByGroup[entry.group.id] = [
      ...(draft.selectedByGroup[entry.group.id] ?? []),
      requiredChoiceId,
    ];

    for (const dependencyId of entry.choice.requires ?? []) {
      if (!ensureSelected(dependencyId, true)) {
        resolving.delete(requiredChoiceId);
        return false;
      }
    }

    notices.push({
      code: isRequirement ? "required-added" : "choice-added",
      tone: "info",
      choiceId: requiredChoiceId,
      message: isRequirement
        ? `${entry.choice.name} a fost adăugată automat deoarece este necesară.`
        : `${entry.choice.name} a fost selectată.`,
    });
    resolving.delete(requiredChoiceId);
    return true;
  }

  if (!ensureSelected(choiceId, false)) {
    return rejected(state, {
      code: "limit-reached",
      tone: "warning",
      choiceId,
      message: `Nu putem adăuga ${target.choice.name}; verifică limita și opțiunile necesare.`,
    });
  }

  let removedDependent = true;
  while (removedDependent) {
    removedDependent = false;
    const selected = selectedIds(draft);
    for (const selectedId of selected) {
      const entry = indexed.choices.get(selectedId);
      if (!entry) continue;
      const missingRequirement = (entry.choice.requires ?? []).find(
        (requirementId) => !selected.has(requirementId),
      );
      if (missingRequirement) {
        removeChoice(draft, entry.group.id, selectedId);
        notices.push({
          code: "dependent-removed",
          tone: "warning",
          choiceId: selectedId,
          relatedChoiceId: missingRequirement,
          message: `${entry.choice.name} a fost eliminată deoarece cerința sa nu mai este selectată.`,
        });
        removedDependent = true;
      }
    }
  }

  const issues = validateConfiguration(catalogue, draft);
  if (issues.length || !selectedIds(draft).has(choiceId)) {
    return rejected(state, {
      code: "invalid-result",
      tone: "error",
      choiceId,
      message:
        issues[0]?.message ?? "Selecția ar produce o configurație invalidă.",
    });
  }

  return { state: draft, notices, accepted: true };
}

function rejected(
  state: ConfigurationState,
  notice: RuleNotice,
): SelectionResult {
  return { state, notices: [notice], accepted: false };
}

export function validateConfiguration(
  catalogue: ConfiguratorCatalogue,
  state: ConfigurationState,
  options: { allowUnpublishedSelected?: boolean } = {},
) {
  const issues: ValidationIssue[] = [];
  const indexed = indexCatalogue(catalogue);

  if (state.modelId !== catalogue.modelId) {
    issues.push({
      code: "model-mismatch",
      message: "Configurația aparține altui model.",
    });
  }

  for (const groupId of Object.keys(state.selectedByGroup)) {
    if (!indexed.groups.has(groupId)) {
      issues.push({
        code: "unknown-group",
        groupId,
        message: `Configurația conține grupul necunoscut ${groupId}.`,
      });
    }
  }

  for (const group of catalogue.groups) {
    const selections = state.selectedByGroup[group.id] ?? [];
    const uniqueSelections = new Set(selections);

    if (uniqueSelections.size !== selections.length) {
      issues.push({
        code: "duplicate-selection",
        groupId: group.id,
        message: `${group.name} conține aceeași opțiune de mai multe ori.`,
      });
    }
    if (group.required && selections.length === 0) {
      issues.push({
        code: "missing-required-selection",
        groupId: group.id,
        message: `${group.name} necesită o selecție.`,
      });
    }
    if (group.mode === "single" && selections.length > 1) {
      issues.push({
        code: "too-many-selections",
        groupId: group.id,
        message: `${group.name} acceptă o singură opțiune.`,
      });
    }
    if (
      group.mode === "multi" &&
      group.maxSelections &&
      selections.length > group.maxSelections
    ) {
      issues.push({
        code: "too-many-selections",
        groupId: group.id,
        message: `${group.name} acceptă maximum ${group.maxSelections} opțiuni.`,
      });
    }

    for (const choiceId of selections) {
      const entry = indexed.choices.get(choiceId);
      if (!entry) {
        issues.push({
          code: "unknown-choice",
          groupId: group.id,
          choiceId,
          message: `Opțiunea ${choiceId} nu există.`,
        });
        continue;
      }
      if (entry.group.id !== group.id) {
        issues.push({
          code: "choice-in-wrong-group",
          groupId: group.id,
          choiceId,
          message: `${entry.choice.name} este salvată în grupul greșit.`,
        });
      }
      if (!entry.choice.published && !options.allowUnpublishedSelected) {
        issues.push({
          code: "unpublished-selection",
          groupId: group.id,
          choiceId,
          message: `${entry.choice.name} nu mai este disponibilă.`,
        });
      }
    }
  }

  const selected = selectedIds(state);
  for (const choiceId of selected) {
    const entry = indexed.choices.get(choiceId);
    if (!entry) continue;

    for (const requirementId of entry.choice.requires ?? []) {
      if (!selected.has(requirementId)) {
        issues.push({
          code: "missing-requirement",
          groupId: entry.group.id,
          choiceId,
          relatedChoiceId: requirementId,
          message: `${entry.choice.name} necesită ${indexed.choices.get(requirementId)?.choice.name ?? requirementId}.`,
        });
      }
    }

    for (const excludedId of entry.choice.excludes ?? []) {
      if (selected.has(excludedId)) {
        issues.push({
          code: "excluded-selection",
          groupId: entry.group.id,
          choiceId,
          relatedChoiceId: excludedId,
          message: `${entry.choice.name} nu este compatibilă cu ${indexed.choices.get(excludedId)?.choice.name ?? excludedId}.`,
        });
      }
    }
  }

  return issues;
}

export function evaluateConfiguration(
  catalogue: ConfiguratorCatalogue,
  state: ConfigurationState,
): EvaluatedConfiguration {
  const indexed = indexCatalogue(catalogue);
  const selectedChoices = catalogue.groups.flatMap((group) =>
    (state.selectedByGroup[group.id] ?? []).flatMap((choiceId) => {
      const entry = indexed.choices.get(choiceId);
      if (!entry) return [];
      return [
        {
          groupId: group.id,
          groupName: group.name,
          choiceId,
          choiceName: entry.choice.name,
          priceDeltaMinor: entry.choice.priceDeltaMinor,
        },
      ];
    }),
  );

  return {
    totalMinor:
      catalogue.basePriceMinor +
      selectedChoices.reduce(
        (total, choice) => total + choice.priceDeltaMinor,
        0,
      ),
    selectedChoices,
    issues: validateConfiguration(catalogue, state),
  };
}

export function verifyClientTotal(
  catalogue: ConfiguratorCatalogue,
  state: ConfigurationState,
  clientTotalMinor: number,
) {
  const evaluation = evaluateConfiguration(catalogue, state);
  return {
    ...evaluation,
    clientTotalMinor,
    matches:
      evaluation.issues.length === 0 &&
      evaluation.totalMinor === clientTotalMinor,
  };
}

export function createConfigurationSnapshot({
  catalogue,
  state,
  reference,
  createdAt,
}: {
  catalogue: ConfiguratorCatalogue;
  state: ConfigurationState;
  reference: string;
  createdAt: string;
}): ConfigurationSnapshot {
  const evaluation = evaluateConfiguration(catalogue, state);
  if (evaluation.issues.length) {
    throw new Error(evaluation.issues.map((issue) => issue.message).join(" "));
  }

  return {
    reference,
    createdAt,
    modelId: catalogue.modelId,
    modelName: catalogue.modelName,
    currency: catalogue.currency,
    basePriceMinor: catalogue.basePriceMinor,
    totalMinor: evaluation.totalMinor,
    selections: evaluation.selectedChoices.map((choice) => ({ ...choice })),
  };
}
