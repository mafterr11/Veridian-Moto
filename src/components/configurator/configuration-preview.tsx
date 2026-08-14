"use client";

import Image from "next/image";
import { RotateCw } from "lucide-react";
import { useId, useMemo } from "react";

import type {
  ConfigurationState,
  ConfiguratorCatalogue,
} from "@/domain/configurator/types";
import { resolveConfigurationVisuals } from "@/domain/configurator/visuals";
import { cn } from "@/lib/utils";

import styles from "./configuration-preview.module.css";

export type VisualSelectionSignal = {
  choiceIds: readonly string[];
  revision: number;
};

type ConfigurationPreviewProps = {
  catalogue: ConfiguratorCatalogue;
  configuration: ConfigurationState;
  fallbackImage: string;
  fallbackImageAlt: string;
  onViewAngleChange: (viewAngle: string) => void;
  selectionSignal?: VisualSelectionSignal;
  compact?: boolean;
};

const angleLabels: Readonly<Record<string, string>> = {
  front: "Față",
  rear: "Spate",
  side: "Profil",
  left: "Stânga",
  right: "Dreapta",
  "front-three-quarter": "3/4 față",
  "rear-three-quarter": "3/4 spate",
};

function formatViewAngle(viewAngle: string) {
  return angleLabels[viewAngle] ?? viewAngle.replaceAll("-", " ");
}

export function ConfigurationPreview({
  catalogue,
  configuration,
  fallbackImage,
  fallbackImageAlt,
  onViewAngleChange,
  selectionSignal,
  compact = false,
}: ConfigurationPreviewProps) {
  const captionId = useId();
  const angles = useMemo(
    () => [...new Set(catalogue.previewAngles)],
    [catalogue.previewAngles],
  );
  const activeAngle = angles.includes(configuration.previewAngle)
    ? configuration.previewAngle
    : (angles[0] ?? configuration.previewAngle);
  const resolved = resolveConfigurationVisuals(
    catalogue,
    configuration,
    activeAngle,
  );
  const usesLayeredMedia = Boolean(
    catalogue.visualMedia?.length && resolved.base,
  );
  const choiceNames = useMemo(
    () =>
      new Map(
        catalogue.groups.flatMap((group) =>
          group.choices.map((choice) => [choice.id, choice.name] as const),
        ),
      ),
    [catalogue.groups],
  );
  const visualChoiceIds = [
    resolved.base?.optionChoiceId,
    ...resolved.overlays.map((overlay) => overlay.optionChoiceId),
  ].filter((choiceId): choiceId is string => Boolean(choiceId));
  const visualChoiceNames = [...new Set(visualChoiceIds)]
    .map((choiceId) => choiceNames.get(choiceId))
    .filter((name): name is string => Boolean(name));
  const visualSummary = [
    `${catalogue.modelName}, unghi ${formatViewAngle(activeAngle)}`,
    visualChoiceNames.length
      ? `opțiuni vizibile: ${visualChoiceNames.join(", ")}`
      : undefined,
  ]
    .filter(Boolean)
    .join("; ");
  const highlighted = new Set(selectionSignal?.choiceIds ?? []);
  const highlightRevision = selectionSignal?.revision ?? 0;
  const updatedChoiceNames = (selectionSignal?.choiceIds ?? [])
    .map((choiceId) => choiceNames.get(choiceId))
    .filter((name): name is string => Boolean(name));

  return (
    <>
      {usesLayeredMedia ? (
        <figure
          className="absolute inset-0 overflow-hidden"
          aria-label="Previzualizarea configurației"
          aria-describedby={captionId}
        >
          <span
            key={`${resolved.base?.optionChoiceId ?? "generic-base"}:${
              resolved.base?.optionChoiceId &&
              highlighted.has(resolved.base.optionChoiceId)
                ? highlightRevision
                : 0
            }`}
            className={cn(
              "absolute inset-0",
              styles.visualLayer,
              resolved.base?.optionChoiceId &&
                highlighted.has(resolved.base.optionChoiceId) &&
                styles.highlightedLayer,
            )}
            data-visual-role="base"
            data-visual-choice-id={resolved.base?.optionChoiceId}
            data-highlighted={
              resolved.base?.optionChoiceId &&
              highlighted.has(resolved.base.optionChoiceId)
                ? "true"
                : undefined
            }
          >
            <Image
              src={resolved.base!.image}
              alt={resolved.base!.alt || fallbackImageAlt}
              fill
              priority
              loading="eager"
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover object-[67%_center]"
            />
          </span>

          {resolved.overlays.map((overlay, index) => (
            <span
              key={`${overlay.optionChoiceId ?? overlay.image}:${index}:${
                overlay.optionChoiceId &&
                highlighted.has(overlay.optionChoiceId)
                  ? highlightRevision
                  : 0
              }`}
              className={cn(
                "absolute inset-0",
                styles.visualLayer,
                overlay.optionChoiceId &&
                  highlighted.has(overlay.optionChoiceId) &&
                  styles.highlightedLayer,
              )}
              data-visual-role="overlay"
              data-visual-choice-id={overlay.optionChoiceId}
              data-highlighted={
                overlay.optionChoiceId &&
                highlighted.has(overlay.optionChoiceId)
                  ? "true"
                  : undefined
              }
              aria-hidden="true"
            >
              <Image
                src={overlay.image}
                alt=""
                fill
                loading="eager"
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover object-[67%_center]"
              />
            </span>
          ))}

          <figcaption id={captionId} className="sr-only">
            {visualSummary}
          </figcaption>
        </figure>
      ) : (
        <LegacyConfigurationImage
          catalogue={catalogue}
          configuration={configuration}
          fallbackImage={fallbackImage}
          fallbackImageAlt={fallbackImageAlt}
        />
      )}

      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Previzualizare actualizată: {visualSummary}.
      </p>

      {updatedChoiceNames.length ? (
        <div
          key={highlightRevision}
          className={cn(
            "border-veridian/60 absolute top-16 right-4 z-20 max-w-[min(22rem,75vw)] border bg-black/75 px-2 py-1.5 text-right text-[0.625rem] font-semibold tracking-normal text-white shadow-xl backdrop-blur sm:right-6 lg:right-8 lg:px-3 lg:py-2 lg:text-[0.65rem] lg:font-bold lg:tracking-wide lg:uppercase",
            compact && "top-12 right-3 max-w-[70vw] sm:right-4",
            styles.selectionNotice,
          )}
          aria-hidden="true"
        >
          <span className="lg:hidden">Imagine actualizată</span>
          <span className="hidden lg:inline">
            Actualizat în imagine · {updatedChoiceNames.join(", ")}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "absolute top-0 right-0 z-20 p-4 sm:p-6 lg:p-8",
          compact && "p-3 sm:p-4",
        )}
      >
        {catalogue.visualMedia?.length && angles.length > 1 ? (
          <div
            className="flex max-w-[65vw] flex-wrap justify-end gap-1"
            role="group"
            aria-label="Unghiul previzualizării"
          >
            {angles.map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => onViewAngleChange(angle)}
                aria-pressed={angle === activeAngle}
                className={cn(
                  "border px-3 py-2 text-[0.65rem] font-bold tracking-wide uppercase backdrop-blur transition-colors motion-reduce:transition-none",
                  compact && "px-2 py-1.5 text-[0.6rem]",
                  angle === activeAngle
                    ? "border-veridian bg-veridian text-obsidian"
                    : "border-white/20 bg-black/30 text-white hover:border-white/50",
                )}
              >
                {formatViewAngle(angle)}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "border border-white/20 bg-black/30 px-3 py-2 text-[0.65rem] font-bold tracking-wide text-white uppercase backdrop-blur",
                compact && "px-2 py-1.5 text-[0.6rem]",
              )}
            >
              {formatViewAngle(activeAngle)}
            </span>
            {!catalogue.visualMedia?.length ? (
              <span
                className="border border-white/20 bg-black/30 p-2 text-white/45 backdrop-blur"
                role="img"
                aria-label="Un singur unghi disponibil în această etapă"
              >
                <RotateCw className="size-4" aria-hidden="true" />
              </span>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

function LegacyConfigurationImage({
  catalogue,
  configuration,
  fallbackImage,
  fallbackImageAlt,
}: Omit<ConfigurationPreviewProps, "onViewAngleChange" | "selectionSignal">) {
  const finishGroup =
    catalogue.groups.find((group) =>
      group.choices.some((choice) => choice.image || choice.swatch),
    ) ?? catalogue.groups[0];
  const selectedFinishId = finishGroup
    ? configuration.selectedByGroup[finishGroup.id]?.[0]
    : undefined;
  const selectedFinish = finishGroup?.choices.find(
    (choice) => choice.id === selectedFinishId,
  );
  const previewChoices =
    finishGroup?.choices.filter((choice) => choice.image) ?? [];
  const hasDistinctPreviewImages =
    new Set(previewChoices.map((choice) => choice.image)).size > 1;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {hasDistinctPreviewImages ? (
        previewChoices.map((choice) => (
          <Image
            key={choice.id}
            src={choice.image!}
            alt={
              choice.id === selectedFinishId
                ? `VERIDIAN ${catalogue.modelName} în finisaj ${choice.name}`
                : ""
            }
            fill
            priority={choice.id === selectedFinishId}
            loading={choice.id === selectedFinishId ? "eager" : "lazy"}
            sizes="(min-width: 1024px) 62vw, 100vw"
            aria-hidden={choice.id !== selectedFinishId}
            className={cn(
              "object-cover object-[67%_center] transition-opacity duration-300 motion-reduce:transition-none",
              choice.id === selectedFinishId ? "opacity-100" : "opacity-0",
            )}
          />
        ))
      ) : (
        <Image
          src={previewChoices[0]?.image ?? fallbackImage}
          alt={
            selectedFinish
              ? `VERIDIAN ${catalogue.modelName} în finisaj ${selectedFinish.name}`
              : fallbackImageAlt
          }
          fill
          priority
          loading="eager"
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover object-[67%_center]"
        />
      )}
    </div>
  );
}
