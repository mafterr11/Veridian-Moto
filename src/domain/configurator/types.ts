export type SelectionMode = "single" | "multi";

export type ConfiguratorChoice = {
  id: string;
  code?: string;
  name: string;
  shortDescription: string;
  priceDeltaMinor: number;
  published: boolean;
  default?: boolean;
  requires?: readonly string[];
  excludes?: readonly string[];
  image?: string;
  swatch?: string;
  badge?: string;
};

export type ConfiguratorGroup = {
  id: string;
  key?: string;
  name: string;
  shortName: string;
  description: string;
  mode: SelectionMode;
  required: boolean;
  maxSelections?: number;
  choices: readonly ConfiguratorChoice[];
};

export type ConfiguratorCatalogue = {
  modelId: string;
  modelName: string;
  currency: "RON";
  basePriceMinor: number;
  previewAngles: readonly string[];
  standardEquipment: readonly string[];
  groups: readonly ConfiguratorGroup[];
};

export type ConfigurationState = {
  modelId: string;
  selectedByGroup: Record<string, readonly string[]>;
  previewAngle: string;
};

export type RuleNoticeCode =
  | "choice-added"
  | "choice-removed"
  | "choice-replaced"
  | "required-added"
  | "incompatible-removed"
  | "dependent-removed"
  | "limit-reached"
  | "required-choice"
  | "required-by-choice"
  | "invalid-choice"
  | "unpublished-choice"
  | "invalid-result";

export type RuleNotice = {
  code: RuleNoticeCode;
  tone: "info" | "warning" | "error";
  message: string;
  choiceId?: string;
  relatedChoiceId?: string;
};

export type SelectionResult = {
  state: ConfigurationState;
  notices: readonly RuleNotice[];
  accepted: boolean;
};

export type ValidationIssueCode =
  | "duplicate-group"
  | "duplicate-choice"
  | "invalid-price"
  | "invalid-default"
  | "invalid-limit"
  | "unknown-reference"
  | "self-reference"
  | "contradictory-rule"
  | "impossible-single-requirement"
  | "unpublished-requirement"
  | "dependency-cycle"
  | "model-mismatch"
  | "unknown-group"
  | "unknown-choice"
  | "choice-in-wrong-group"
  | "duplicate-selection"
  | "missing-required-selection"
  | "too-many-selections"
  | "unpublished-selection"
  | "missing-requirement"
  | "excluded-selection";

export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
  groupId?: string;
  choiceId?: string;
  relatedChoiceId?: string;
};

export type EvaluatedConfiguration = {
  totalMinor: number;
  selectedChoices: readonly {
    groupId: string;
    groupName: string;
    choiceId: string;
    choiceName: string;
    priceDeltaMinor: number;
  }[];
  issues: readonly ValidationIssue[];
};

export type ConfigurationSnapshot = {
  reference: string;
  createdAt: string;
  modelId: string;
  modelName: string;
  currency: "RON";
  basePriceMinor: number;
  totalMinor: number;
  selections: readonly {
    groupId: string;
    groupName: string;
    choiceId: string;
    choiceName: string;
    priceDeltaMinor: number;
  }[];
};
