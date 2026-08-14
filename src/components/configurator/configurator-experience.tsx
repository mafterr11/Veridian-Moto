"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Eye,
  Info,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import {
  ConfigurationPreview,
  type VisualSelectionSignal,
} from "@/components/configurator/configuration-preview";
import { buttonVariants } from "@/components/ui/button";
import {
  saveConfigurationAction,
  type ConfigurationSaveState,
} from "@/app/(public)/configurator/actions";
import {
  createInitialState,
  evaluateConfiguration,
  updateChoice,
} from "@/domain/configurator/engine";
import type {
  ConfiguratorCatalogue,
  ConfiguratorChoice,
  ConfiguratorGroup,
  ConfigurationState,
  RuleNotice,
} from "@/domain/configurator/types";
import { formatMinorPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type ConfiguratorExperienceProps = {
  catalogue: ConfiguratorCatalogue;
  model: {
    slug: string;
    category: string;
    powerHp: number;
    torqueNm: number;
    wetWeightKg: number;
    image: string;
    imageAlt: string;
  };
};

const MOBILE_CONFIGURATOR_QUERY = "(max-width: 63.999rem)";

export function ConfiguratorExperience({
  catalogue,
  model,
}: ConfiguratorExperienceProps) {
  const [configuration, setConfiguration] = useState(() =>
    createInitialState(catalogue),
  );
  const [activeStep, setActiveStep] = useState(0);
  const [notices, setNotices] = useState<readonly RuleNotice[]>([]);
  const [visualSelectionSignal, setVisualSelectionSignal] = useState<
    VisualSelectionSignal | undefined
  >();
  const [mobilePreviewCompact, setMobilePreviewCompact] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const mobileViewport = window.matchMedia(MOBILE_CONFIGURATOR_QUERY);
    let previousCompact = false;
    const syncPreviewState = () => {
      const nextCompact = mobileViewport.matches && window.scrollY > 48;
      if (nextCompact === previousCompact) return;

      previousCompact = nextCompact;
      setMobilePreviewCompact(nextCompact);
    };

    syncPreviewState();
    window.addEventListener("scroll", syncPreviewState, { passive: true });
    mobileViewport.addEventListener("change", syncPreviewState);

    return () => {
      window.removeEventListener("scroll", syncPreviewState);
      mobileViewport.removeEventListener("change", syncPreviewState);
    };
  }, []);
  const visualChoiceIds = useMemo(
    () =>
      new Set(
        (catalogue.visualMedia ?? [])
          .map((media) => media.optionChoiceId)
          .filter((choiceId): choiceId is string => Boolean(choiceId)),
      ),
    [catalogue.visualMedia],
  );
  const steps = useMemo(
    () => [
      ...catalogue.groups.map((group) => ({
        id: group.id,
        label: group.shortName,
        groupIds: [group.id],
      })),
      { id: "summary", label: "Sumar", groupIds: [] as string[] },
    ],
    [catalogue.groups],
  );
  const evaluation = useMemo(
    () => evaluateConfiguration(catalogue, configuration),
    [catalogue, configuration],
  );
  const selectedIds = useMemo(
    () => new Set(Object.values(configuration.selectedByGroup).flat()),
    [configuration],
  );
  const finishGroup = useMemo(
    () =>
      catalogue.groups.find((group) =>
        group.choices.some((choice) => choice.image || choice.swatch),
      ) ?? catalogue.groups[0],
    [catalogue.groups],
  );
  const step = steps[activeStep]!;
  const progress = ((activeStep + 1) / steps.length) * 100;

  function handleChoice(group: ConfiguratorGroup, choice: ConfiguratorChoice) {
    const selected = selectedIds.has(choice.id);
    const shouldSelect = group.mode === "single" ? true : !selected;
    const result = updateChoice(
      catalogue,
      configuration,
      choice.id,
      shouldSelect,
    );

    if (result.accepted) {
      const nextSelectedIds = new Set(
        Object.values(result.state.selectedByGroup).flat(),
      );
      const changedVisualChoiceIds = [
        ...new Set([...selectedIds, ...nextSelectedIds]),
      ].filter(
        (choiceId) =>
          visualChoiceIds.has(choiceId) &&
          selectedIds.has(choiceId) !== nextSelectedIds.has(choiceId),
      );

      setConfiguration(result.state);
      if (changedVisualChoiceIds.length) {
        setVisualSelectionSignal((current) => ({
          choiceIds: changedVisualChoiceIds,
          revision: (current?.revision ?? 0) + 1,
        }));
      }
    }
    setNotices(result.notices);
  }

  function handleViewAngleChange(viewAngle: string) {
    setConfiguration((current) => ({ ...current, previewAngle: viewAngle }));
  }

  function goToStep(index: number) {
    setActiveStep(Math.min(Math.max(index, 0), steps.length - 1));
    setNotices([]);
  }

  return (
    <main className="bg-porcelain text-obsidian [overflow-anchor:none]">
      <div className="lg:grid lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1.45fr)_minmax(25rem,0.9fr)]">
        <section
          data-configurator-preview
          data-preview-state={mobilePreviewCompact ? "compact" : "expanded"}
          className={cn(
            "sticky top-18 z-30 h-[48svh] overflow-hidden bg-[#080a0a] transition-[height] duration-300 ease-out motion-reduce:transition-none lg:top-20 lg:h-[calc(100svh-5rem)]",
            mobilePreviewCompact && "h-[clamp(8rem,28svh,15rem)]",
          )}
        >
          <ConfigurationPreview
            catalogue={catalogue}
            configuration={configuration}
            fallbackImage={model.image}
            fallbackImageAlt={model.imageAlt}
            onViewAngleChange={handleViewAngleChange}
            selectionSignal={visualSelectionSignal}
            compact={mobilePreviewCompact}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35"
            aria-hidden="true"
          />

          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-4 p-4 sm:p-6 lg:p-8",
              mobilePreviewCompact && "p-3 sm:p-4",
            )}
          >
            <Link
              href="/configurator"
              className="pointer-events-auto flex items-center gap-2 text-sm font-bold text-white"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {mobilePreviewCompact ? (
                <span>Modele</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Schimbă modelul</span>
                  <span className="sm:hidden">Modele</span>
                </>
              )}
            </Link>
          </div>

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-4 text-white sm:p-6 lg:p-8",
              mobilePreviewCompact && "p-3 sm:p-4",
            )}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className={cn(
                    "text-primary text-xs font-bold tracking-[0.18em] uppercase",
                    mobilePreviewCompact && "hidden",
                  )}
                >
                  VERIDIAN · {model.category}
                </p>
                <h1
                  className={cn(
                    "font-heading mt-2 text-4xl font-extrabold tracking-tight uppercase sm:text-6xl lg:text-7xl",
                    mobilePreviewCompact && "mt-0 text-2xl sm:text-3xl",
                  )}
                >
                  {catalogue.modelName}
                </h1>
              </div>
              <div
                className={cn(
                  "hidden gap-6 text-right sm:flex",
                  mobilePreviewCompact && "sm:hidden",
                )}
              >
                <PreviewStat value={`${model.powerHp} CP`} label="Putere" />
                <PreviewStat value={`${model.torqueNm} Nm`} label="Cuplu" />
                <PreviewStat
                  value={`${model.wetWeightKg} kg`}
                  label="La plin"
                />
              </div>
            </div>

            <details
              className={cn(
                "group mt-5 border-t border-white/18 pt-4",
                mobilePreviewCompact && "hidden",
              )}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold tracking-[0.12em] uppercase [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <ShieldCheck
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  {catalogue.standardEquipment.length} dotări standard incluse
                </span>
                <ChevronDown
                  className="size-4 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="mt-4 grid gap-2 text-xs text-white/70 sm:grid-cols-2">
                {catalogue.standardEquipment.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </section>

        <section className="flex min-h-[52svh] flex-col bg-white lg:min-h-[calc(100svh-5rem)]">
          <header className="border-obsidian/10 border-b px-5 pt-5 sm:px-8 sm:pt-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-veridian-dark text-xs font-bold tracking-[0.16em] uppercase">
                  Pasul {activeStep + 1} din {steps.length}
                </p>
                <h2 className="font-heading mt-1 text-3xl font-extrabold uppercase sm:text-4xl">
                  {step.label}
                </h2>
              </div>
              <SlidersHorizontal
                className="text-veridian-dark mt-1 size-5"
                aria-hidden="true"
              />
            </div>

            <nav
              aria-label="Pașii configuratorului"
              className="mt-5 flex scrollbar-none gap-1 overflow-x-auto"
            >
              {steps.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={cn(
                    "border-b-2 px-3 py-3 text-xs font-bold whitespace-nowrap transition-colors",
                    index === activeStep
                      ? "border-veridian text-obsidian"
                      : "text-steel hover:text-obsidian border-transparent",
                  )}
                  aria-current={index === activeStep ? "step" : undefined}
                >
                  {index + 1}. {item.label}
                </button>
              ))}
            </nav>
            <div
              className="bg-obsidian/10 h-0.5"
              role="progressbar"
              aria-label="Progresul configurației"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={activeStep + 1}
            >
              <div
                className="bg-veridian h-full transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </header>

          <div className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
            <div aria-live="polite" aria-atomic="false">
              {notices.length ? <RuleFeedback notices={notices} /> : null}
            </div>

            {step.id === "summary" ? (
              <ConfigurationSummary
                evaluation={evaluation}
                catalogue={catalogue}
              />
            ) : (
              <div className="space-y-9">
                {step.groupIds.map((groupId) => {
                  const group = catalogue.groups.find(
                    (item) => item.id === groupId,
                  )!;
                  const selectedCount =
                    configuration.selectedByGroup[group.id]?.length ?? 0;

                  return (
                    <fieldset key={group.id}>
                      <div className="flex items-end justify-between gap-5">
                        <div>
                          <legend className="font-heading text-2xl font-extrabold uppercase">
                            {group.name}
                          </legend>
                          <p className="text-steel mt-1 max-w-xl text-sm leading-6">
                            {group.description}
                          </p>
                        </div>
                        {group.mode === "multi" ? (
                          <p className="text-steel shrink-0 text-xs font-bold uppercase">
                            {selectedCount}/{group.maxSelections}
                          </p>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          "mt-5 grid gap-3",
                          group.id === finishGroup?.id && "sm:grid-cols-3",
                        )}
                      >
                        {group.choices
                          .filter((choice) => choice.published)
                          .map((choice) => (
                            <OptionCard
                              key={choice.id}
                              group={group}
                              choice={choice}
                              selected={selectedIds.has(choice.id)}
                              visual={visualChoiceIds.has(choice.id)}
                              onSelect={() => handleChoice(group, choice)}
                            />
                          ))}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            )}
          </div>

          <footer
            data-configurator-actions
            className="border-obsidian/10 sticky bottom-0 z-40 border-t bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(0,0,0,0.08)] backdrop-blur lg:px-8 lg:py-5"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 lg:block">
              <div className="flex items-end justify-between gap-5 lg:mb-4">
                <div>
                  <p className="text-steel text-[0.6rem] font-bold tracking-wide uppercase lg:text-[0.65rem]">
                    <span className="lg:hidden">Total</span>
                    <span className="hidden lg:inline">
                      Total curent · TVA inclus
                    </span>
                  </p>
                  <p className="font-heading mt-0.5 text-2xl leading-none font-extrabold lg:mt-1 lg:text-3xl lg:leading-normal">
                    {formatMinorPrice(evaluation.totalMinor)}
                  </p>
                </div>
                <p className="text-steel hidden text-right text-xs lg:block">
                  Preț recalculat din {evaluation.selectedChoices.length}{" "}
                  selecții
                </p>
              </div>
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2 lg:gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(activeStep - 1)}
                  disabled={activeStep === 0}
                  className="border-obsidian/20 grid size-11 place-items-center border transition-colors hover:bg-stone-100 disabled:opacity-35 lg:size-12"
                  aria-label="Pasul anterior"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </button>
                {activeStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goToStep(activeStep + 1)}
                    aria-label={`Continuă la ${steps[activeStep + 1]?.label}`}
                    className="bg-veridian text-obsidian flex h-11 min-w-0 items-center justify-center gap-1.5 px-3 text-sm font-bold transition-colors hover:bg-[#16cf98] lg:h-12 lg:gap-2 lg:px-5 lg:text-base"
                  >
                    <span className="lg:hidden">Continuă</span>
                    <span className="hidden lg:inline">
                      Continuă la {steps[activeStep + 1]?.label}
                    </span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                ) : (
                  <ConfigurationSaveForm
                    catalogue={catalogue}
                    configuration={configuration}
                    modelSlug={model.slug}
                    totalMinor={evaluation.totalMinor}
                  />
                )}
              </div>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

const initialSaveState: ConfigurationSaveState = { status: "idle" };

function ConfigurationSaveForm({
  catalogue,
  configuration,
  modelSlug,
  totalMinor,
}: {
  catalogue: ConfiguratorCatalogue;
  configuration: ConfigurationState;
  modelSlug: string;
  totalMinor: number;
}) {
  const [state, formAction, pending] = useActionState(
    saveConfigurationAction,
    initialSaveState,
  );

  return (
    <form action={formAction} className="grid min-w-0 gap-2">
      <input type="hidden" name="modelSlug" value={modelSlug} />
      <input type="hidden" name="state" value={JSON.stringify(configuration)} />
      <input type="hidden" name="clientTotalMinor" value={totalMinor} />
      <button
        type="submit"
        disabled={pending}
        aria-label={
          pending ? "Se validează pe server" : "Salvează și cere ofertă"
        }
        className={buttonVariants({
          className: "h-11 min-w-0 px-2 text-xs lg:h-12 lg:px-4 lg:text-sm",
        })}
      >
        {pending ? (
          <>
            <span className="lg:hidden">Se validează…</span>
            <span className="hidden lg:inline">Se validează pe server…</span>
          </>
        ) : (
          <>
            <span className="lg:hidden">Cere ofertă</span>
            <span className="hidden lg:inline">Salvează și cere ofertă</span>
          </>
        )}
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </button>
      {state.status === "error" && (
        <p className="text-sm text-red-700" role="alert">
          {state.message}
        </p>
      )}
      <span className="sr-only">
        {catalogue.modelName} va fi recalculat înainte de salvare.
      </span>
    </form>
  );
}

function OptionCard({
  group,
  choice,
  selected,
  visual,
  onSelect,
}: {
  group: ConfiguratorGroup;
  choice: ConfiguratorChoice;
  selected: boolean;
  visual: boolean;
  onSelect: () => void;
}) {
  const included = choice.priceDeltaMinor === 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-24 w-full items-start gap-4 border p-4 text-left transition-colors",
        selected
          ? "border-veridian bg-veridian/5"
          : "border-obsidian/15 hover:border-obsidian/35",
        group.choices.some((item) => item.swatch) && "flex-col gap-3",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border",
          group.mode === "single" && "rounded-full",
          selected
            ? "border-veridian bg-veridian text-obsidian"
            : "border-obsidian/30",
          group.choices.some((item) => item.swatch) && "absolute top-3 right-3",
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>

      {choice.swatch ? (
        <span
          className="size-10 rounded-full border border-black/15 shadow-inner"
          style={{ backgroundColor: choice.swatch }}
          aria-hidden="true"
        />
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <strong className="font-heading text-xl font-bold uppercase">
            {choice.name}
          </strong>
          <span
            className={cn(
              "text-xs font-bold",
              included ? "text-veridian-dark" : "text-obsidian",
            )}
          >
            {included
              ? "Inclus"
              : `+ ${formatMinorPrice(choice.priceDeltaMinor)}`}
          </span>
        </span>
        <span className="text-steel mt-1 block text-xs leading-5">
          {choice.shortDescription}
        </span>
        {choice.badge ? (
          <span className="text-veridian-dark mt-2 inline-flex text-[0.65rem] font-bold tracking-wide uppercase">
            {choice.badge}
          </span>
        ) : null}
        {visual ? (
          <span className="text-veridian-dark mt-2 flex items-center gap-1.5 text-[0.65rem] font-bold tracking-wide uppercase">
            <Eye className="size-3.5" aria-hidden="true" />
            Vizibil în imagine
          </span>
        ) : null}
      </span>
    </button>
  );
}

function RuleFeedback({ notices }: { notices: readonly RuleNotice[] }) {
  return (
    <div className="mb-6 space-y-2">
      {notices
        .filter((notice) => notice.code !== "choice-added")
        .map((notice, index) => {
          const Icon =
            notice.tone === "error"
              ? AlertTriangle
              : notice.tone === "warning"
                ? Info
                : CheckCircle2;
          return (
            <div
              key={`${notice.code}-${notice.choiceId}-${index}`}
              className={cn(
                "flex gap-3 border p-3 text-sm leading-5",
                notice.tone === "error" &&
                  "border-red-300 bg-red-50 text-red-900",
                notice.tone === "warning" &&
                  "border-amber-300 bg-amber-50 text-amber-950",
                notice.tone === "info" &&
                  "border-veridian/35 bg-veridian/5 text-obsidian",
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>{notice.message}</p>
            </div>
          );
        })}
    </div>
  );
}

function ConfigurationSummary({
  evaluation,
  catalogue,
}: {
  evaluation: ReturnType<typeof evaluateConfiguration>;
  catalogue: ConfiguratorCatalogue;
}) {
  return (
    <div>
      <div className="flex items-start gap-4 border border-emerald-300 bg-emerald-50 p-4 text-emerald-950">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-bold">Configurație validă</p>
          <p className="mt-1 text-sm leading-6 opacity-75">
            Toate cerințele și incompatibilitățile sunt rezolvate. Totalul va fi
            recalculat pe server înainte de salvare sau ofertare.
          </p>
        </div>
      </div>

      <div className="mt-7">
        <div className="border-obsidian/10 flex items-center justify-between border-b pb-4">
          <div>
            <p className="font-heading text-xl font-bold uppercase">
              {catalogue.modelName}
            </p>
            <p className="text-steel text-xs">Preț de bază</p>
          </div>
          <strong className="font-heading text-xl">
            {formatMinorPrice(catalogue.basePriceMinor)}
          </strong>
        </div>

        {catalogue.groups.map((group) => {
          const selections = evaluation.selectedChoices.filter(
            (choice) => choice.groupId === group.id,
          );
          if (!selections.length) return null;

          return (
            <section
              key={group.id}
              className="border-obsidian/10 border-b py-4"
            >
              <p className="text-steel text-[0.65rem] font-bold tracking-wide uppercase">
                {group.name}
              </p>
              <div className="mt-2 space-y-2">
                {selections.map((choice) => (
                  <div
                    key={choice.choiceId}
                    className="flex items-center justify-between gap-5 text-sm"
                  >
                    <span>{choice.choiceName}</span>
                    <span className="font-semibold">
                      {choice.priceDeltaMinor
                        ? `+ ${formatMinorPrice(choice.priceDeltaMinor)}`
                        : "Inclus"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="mt-6 flex items-end justify-between bg-stone-100 p-5">
          <div>
            <p className="text-steel text-xs font-bold uppercase">
              Total configurat
            </p>
            <p className="text-steel mt-1 text-xs">TVA inclus</p>
          </div>
          <strong className="font-heading text-3xl font-extrabold">
            {formatMinorPrice(evaluation.totalMinor)}
          </strong>
        </div>
      </div>

      <div className="border-obsidian/10 text-steel mt-6 flex gap-3 border p-4 text-sm">
        <CircleGauge
          className="text-veridian-dark mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <p>
          Configurația descrie o comandă posibilă, nu rezervă o unitate din
          stoc. Disponibilitatea exactă va fi confirmată în ofertă.
        </p>
      </div>
    </div>
  );
}

function PreviewStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-heading text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-[0.62rem] font-bold tracking-wide text-white/50 uppercase">
        {label}
      </p>
    </div>
  );
}
