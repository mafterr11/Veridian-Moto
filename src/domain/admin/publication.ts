import { validateCatalogue } from "@/domain/configurator/engine";
import type { ConfiguratorCatalogue } from "@/domain/configurator/types";

export type PublicationIssue = {
  code: string;
  section: "identity" | "specifications" | "media" | "configuration";
  message: string;
};

export type ModelPublicationCandidate = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  categoryPublished: boolean;
  summary: string;
  description: string;
  basePriceMinor: number;
  powerHp: number;
  torqueNm: number;
  wetWeightKg: number;
  seatHeightMm: number;
  configuratorEnabled: boolean;
  mediaRoles: readonly string[];
  configurator?: ConfiguratorCatalogue;
  unpublishedGroupNames?: readonly string[];
};

export function validateModelPublication(
  candidate: ModelPublicationCandidate,
): PublicationIssue[] {
  const issues: PublicationIssue[] = [];

  if (!candidate.categoryId || !candidate.categoryPublished) {
    issues.push({
      code: "invalid-category",
      section: "identity",
      message: "Modelul trebuie să aparțină unei categorii publicate.",
    });
  }
  if (!candidate.slug || !candidate.name) {
    issues.push({
      code: "missing-identity",
      section: "identity",
      message: "Numele și slugul sunt obligatorii.",
    });
  }
  if (candidate.summary.length < 20 || candidate.description.length < 40) {
    issues.push({
      code: "incomplete-copy",
      section: "identity",
      message:
        "Rezumatul și descrierea trebuie completate înainte de publicare.",
    });
  }
  if (
    !Number.isInteger(candidate.basePriceMinor) ||
    candidate.basePriceMinor < 0
  ) {
    issues.push({
      code: "invalid-base-price",
      section: "identity",
      message: "Prețul de bază nu este valid.",
    });
  }

  const keySpecs = [
    candidate.powerHp,
    candidate.torqueNm,
    candidate.wetWeightKg,
    candidate.seatHeightMm,
  ];
  if (keySpecs.some((value) => !Number.isInteger(value) || value <= 0)) {
    issues.push({
      code: "missing-key-specifications",
      section: "specifications",
      message: "Puterea, cuplul, greutatea și înălțimea șeii sunt obligatorii.",
    });
  }

  for (const role of ["card", "hero"] as const) {
    if (!candidate.mediaRoles.includes(role)) {
      issues.push({
        code: `missing-${role}-media`,
        section: "media",
        message: `Lipsește imaginea cu rolul ${role}.`,
      });
    }
  }

  if (candidate.configuratorEnabled) {
    if (!candidate.configurator?.groups.length) {
      issues.push({
        code: "missing-configuration",
        section: "configuration",
        message: "Configuratorul este activ, dar nu are grupuri de opțiuni.",
      });
    } else {
      for (const issue of validateCatalogue(candidate.configurator)) {
        issues.push({
          code: issue.code,
          section: "configuration",
          message: issue.message,
        });
      }
    }

    for (const groupName of candidate.unpublishedGroupNames ?? []) {
      issues.push({
        code: "unpublished-option-group",
        section: "configuration",
        message: `Grupul „${groupName}” trebuie publicat sau arhivat.`,
      });
    }
  }

  return issues;
}
