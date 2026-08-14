import "server-only";

import { getPublicConfiguration } from "@/data/queries/public-configurations";
import { getPublicConfigurator } from "@/data/queries/public-configurator";
import { getPublicSiteSettings } from "@/data/queries/public-site-settings";
import { evaluateConfiguration } from "@/domain/configurator/engine";
import type {
  ConfigurationState,
  ConfiguratorCatalogue,
} from "@/domain/configurator/types";
import { resolveConfigurationVisuals } from "@/domain/configurator/visuals";
import {
  buildOfferDocumentModel,
  offerFileName,
  type OfferSelection,
} from "@/domain/offers/offer-model";
import type { OfferDealer } from "@/lib/pdf/offer-document";
import { renderConfiguredMotorcycle } from "@/lib/pdf/offer-image";

export class OfferUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferUnavailableError";
  }
}

export type OfferPayload = {
  offer: ReturnType<typeof buildOfferDocumentModel>;
  dealer: OfferDealer;
  previewImage?: string;
  fileName: string;
};

function resolveAngle(catalogue: ConfiguratorCatalogue, requested?: string) {
  const angles = [...new Set(catalogue.previewAngles)];
  if (requested && angles.includes(requested)) return requested;
  return angles[0] ?? "front-three-quarter";
}

async function renderPreview(
  catalogue: ConfiguratorCatalogue,
  state: ConfigurationState,
) {
  const visuals = resolveConfigurationVisuals(
    catalogue,
    state,
    resolveAngle(catalogue, state.previewAngle),
  );
  return renderConfiguredMotorcycle(visuals.base, visuals.overlays);
}

async function dealerDetails(): Promise<OfferDealer> {
  const settings = await getPublicSiteSettings();
  return {
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    address: settings.address,
  };
}

/**
 * Builds the offer for a configuration the visitor is still editing.
 *
 * The client sends only its selections. Every price, name and total is read
 * from the authoritative catalogue here, so a tampered payload cannot change
 * what the document says.
 */
export async function buildOfferFromState({
  modelSlug,
  state,
  issuedAt = new Date(),
}: {
  modelSlug: string;
  state: ConfigurationState;
  issuedAt?: Date;
}): Promise<OfferPayload> {
  const configurator = await getPublicConfigurator(modelSlug);
  if (!configurator) {
    throw new OfferUnavailableError(
      "Modelul nu mai este disponibil în configurator.",
    );
  }

  const { catalogue, model } = configurator;
  const evaluation = evaluateConfiguration(catalogue, state);
  if (evaluation.issues.length) {
    throw new OfferUnavailableError(
      "Configurația nu mai este validă. Reîncarcă pagina și verifică selecțiile.",
    );
  }

  const selections: OfferSelection[] = evaluation.selectedChoices.map(
    (choice) => ({
      groupName: choice.groupName,
      choiceName: choice.choiceName,
      priceDeltaMinor: choice.priceDeltaMinor,
    }),
  );

  const offer = buildOfferDocumentModel({
    modelName: catalogue.modelName,
    category: model.category,
    currency: catalogue.currency,
    basePriceMinor: catalogue.basePriceMinor,
    selections,
    standardEquipment: catalogue.standardEquipment,
    totalMinor: evaluation.totalMinor,
    issuedAt,
  });

  return {
    offer,
    dealer: await dealerDetails(),
    previewImage: await renderPreview(catalogue, state),
    fileName: offerFileName(offer),
  };
}

/**
 * Builds the offer for a saved configuration. The snapshot is the source of
 * truth for names and prices — a later catalogue edit must not rewrite a
 * document the visitor already received.
 */
export async function buildOfferFromReference(
  reference: string,
): Promise<OfferPayload | undefined> {
  const snapshot = await getPublicConfiguration(reference);
  if (!snapshot) return undefined;

  const selections: OfferSelection[] = snapshot.selectedChoices.map(
    (choice) => ({
      groupName: choice.groupName,
      choiceName: choice.choiceName,
      priceDeltaMinor: choice.priceDeltaMinor,
      unavailable: !choice.isCurrentlyAvailable,
    }),
  );

  const offer = buildOfferDocumentModel({
    modelName: snapshot.modelIdentity.name,
    modelYear: snapshot.modelIdentity.modelYear,
    currency: snapshot.currency,
    basePriceMinor: snapshot.basePriceMinor,
    selections,
    // The snapshot deliberately stores no equipment list; read the current one
    // for context only, and only when the model is still configurable.
    standardEquipment: [],
    reference: snapshot.reference,
    totalMinor: snapshot.totalPriceMinor,
    issuedAt: snapshot.createdAt,
  });

  const configurator = await getPublicConfigurator(
    snapshot.modelIdentity.slug,
  ).catch(() => undefined);

  return {
    offer: configurator
      ? {
          ...offer,
          standardEquipment: configurator.catalogue.standardEquipment,
        }
      : offer,
    dealer: await dealerDetails(),
    previewImage: configurator
      ? await renderPreview(
          configurator.catalogue,
          reconstructState(configurator.catalogue, snapshot.selectedChoices),
        )
      : undefined,
    fileName: offerFileName(offer),
  };
}

/**
 * Maps a snapshot's stable `groupKey:choiceCode` pairs back onto the current
 * catalogue's identifiers so the preview can be re-rendered. Choices the
 * catalogue no longer publishes are skipped, which degrades the artwork rather
 * than the document.
 */
function reconstructState(
  catalogue: ConfiguratorCatalogue,
  selectedChoices: readonly { groupKey: string; choiceCode: string }[],
): ConfigurationState {
  const byCode = new Map<string, { groupId: string; choiceId: string }>();
  for (const group of catalogue.groups) {
    for (const choice of group.choices) {
      byCode.set(`${group.key ?? group.id}:${choice.code ?? choice.id}`, {
        groupId: group.id,
        choiceId: choice.id,
      });
    }
  }

  const selectedByGroup: Record<string, string[]> = {};
  for (const selection of selectedChoices) {
    const match = byCode.get(`${selection.groupKey}:${selection.choiceCode}`);
    if (!match) continue;
    (selectedByGroup[match.groupId] ??= []).push(match.choiceId);
  }

  return {
    modelId: catalogue.modelId,
    selectedByGroup,
    previewAngle: resolveAngle(catalogue),
  };
}
