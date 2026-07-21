import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RotateCcw, SearchX } from "lucide-react";

import { ModelCard } from "@/components/catalogue/model-card";
import { buttonVariants } from "@/components/ui/button";
import { availabilityLabels, filterModels } from "@/data/catalogue";
import {
  getPublicCategories,
  getPublicModels,
} from "@/data/queries/public-models";

export const metadata: Metadata = {
  title: "Modele",
  description:
    "Compară gama completă VERIDIAN Moto după categorie, disponibilitate, preț și putere.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ModelsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main>
      <section className="border-border relative isolate overflow-hidden border-b py-18 sm:py-24 lg:py-28">
        <div
          className="technical-grid pointer-events-none absolute inset-0 -z-20 opacity-60"
          aria-hidden="true"
        />
        <div
          className="bg-primary/10 pointer-events-none absolute -top-60 right-0 -z-10 size-[34rem] rounded-full blur-[120px]"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
            Gama VERIDIAN
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <h1 className="font-heading text-6xl leading-[0.82] font-extrabold tracking-[-0.035em] uppercase sm:text-8xl lg:text-9xl">
              Făcută pentru
              <span className="text-primary block">drumul tău.</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-base leading-7 lg:pb-2 lg:text-lg">
              Motociclete cu personalități diferite și aceeași bază: echipare
              utilă inclusă, preț transparent și tehnologie pe care o înțelegi.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<ModelsLoading />}>
        <ModelsCatalogue searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ModelsCatalogue({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = firstValue(params.category) ?? "toate";
  const availability = firstValue(params.availability) ?? "toate";
  const sort = firstValue(params.sort) ?? "price-asc";
  const [allModels, categories] = await Promise.all([
    getPublicModels(),
    getPublicCategories(),
  ]);
  const models = filterModels({ category, availability, sort }, allModels);

  return (
    <section className="bg-porcelain text-obsidian py-10 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <form
          action="/modele"
          className="border-obsidian/15 grid gap-4 border-y py-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
        >
          <FilterSelect
            name="category"
            label="Categorie"
            defaultValue={category}
            options={[
              { value: "toate", label: "Toate categoriile" },
              ...categories.map((item) => ({
                value: item.name,
                label: `${item.name} (${item.modelCount})`,
              })),
            ]}
          />
          <FilterSelect
            name="availability"
            label="Disponibilitate"
            defaultValue={availability}
            options={[
              { value: "toate", label: "Orice disponibilitate" },
              ...Object.entries(availabilityLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <FilterSelect
            name="sort"
            label="Sortează"
            defaultValue={sort}
            options={[
              { value: "price-asc", label: "Preț crescător" },
              { value: "price-desc", label: "Preț descrescător" },
              { value: "power-desc", label: "Putere descrescător" },
            ]}
          />
          <button
            type="submit"
            className="bg-obsidian text-porcelain hover:bg-veridian hover:text-obsidian h-11 px-6 text-sm font-bold transition-colors"
          >
            Aplică filtrele
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold" aria-live="polite">
            {models.length}{" "}
            {models.length === 1 ? "model găsit" : "modele găsite"}
          </p>
          {(category !== "toate" ||
            availability !== "toate" ||
            sort !== "price-asc") && (
            <Link
              href="/modele"
              className="inline-flex items-center gap-2 text-sm font-bold"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Resetează
            </Link>
          )}
        </div>

        {models.length ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {models.map((model, index) => (
              <ModelCard
                key={model.slug}
                model={model}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="border-obsidian/15 mt-7 flex min-h-80 flex-col items-center justify-center border px-5 text-center">
            <SearchX className="text-veridian-dark size-9" aria-hidden="true" />
            <h2 className="font-heading mt-5 text-3xl font-bold uppercase">
              Niciun model nu corespunde
            </h2>
            <p className="text-steel mt-2 max-w-md text-sm leading-6">
              Încearcă o altă categorie sau afișează toate stările de
              disponibilitate.
            </p>
            <Link
              href="/modele"
              className={buttonVariants({ className: "mt-6" })}
            >
              Resetează filtrele
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ModelsLoading() {
  return (
    <section
      className="bg-porcelain text-obsidian py-12"
      aria-label="Se încarcă modelele"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="border-obsidian/15 h-24 animate-pulse border" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="bg-obsidian/10 h-[32rem] animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-2 text-xs font-bold tracking-[0.12em] uppercase">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="border-obsidian/25 bg-porcelain focus:border-veridian h-11 border px-3 text-sm font-semibold tracking-normal normal-case outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
