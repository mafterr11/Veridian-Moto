import type {
  ConfigurationState,
  ConfiguratorCatalogue,
  ConfiguratorVisualMedia,
} from "@/domain/configurator/types";

export type ResolvedConfigurationVisuals = {
  base?: ConfiguratorVisualMedia;
  overlays: readonly ConfiguratorVisualMedia[];
};

function selectedChoiceIds(state: ConfigurationState) {
  return new Set(Object.values(state.selectedByGroup).flat());
}

function stableSortByOrder(media: readonly ConfiguratorVisualMedia[]) {
  return media
    .map((item, index) => ({ item, index }))
    .sort(
      (left, right) =>
        left.item.sortOrder - right.item.sortOrder || left.index - right.index,
    )
    .map(({ item }) => item);
}

export function resolveConfigurationVisuals(
  catalogue: ConfiguratorCatalogue,
  state: ConfigurationState,
  viewAngle: string,
): ResolvedConfigurationVisuals {
  const selected = selectedChoiceIds(state);
  const mediaForAngle = stableSortByOrder(
    (catalogue.visualMedia ?? []).filter(
      (media) => media.viewAngle === viewAngle,
    ),
  );
  const bases = mediaForAngle.filter((media) => media.role === "base");
  const optionBase = bases.find(
    (media) =>
      media.optionChoiceId !== undefined && selected.has(media.optionChoiceId),
  );
  const genericBase = bases.find((media) => media.optionChoiceId === undefined);

  return {
    base: optionBase ?? genericBase,
    overlays: mediaForAngle.filter(
      (media) =>
        media.role === "overlay" &&
        media.optionChoiceId !== undefined &&
        selected.has(media.optionChoiceId),
    ),
  };
}
