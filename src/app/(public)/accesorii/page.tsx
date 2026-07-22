import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleGauge,
  Luggage,
  PackageSearch,
  Shield,
  Sofa,
  Wrench,
} from "lucide-react";

import { PageIntro } from "@/components/marketing/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { accessoryStockLabels, filterAccessories } from "@/data/accessories";
import { getPublicAccessories } from "@/data/queries/public-accessories";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Accesorii",
  description:
    "Accesorii originale VERIDIAN pentru protecție, confort, bagaje și utilizare zilnică.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const categoryIcons = {
  Bagaje: Luggage,
  Ergonomie: Sofa,
  Protecție: Shield,
  Tehnologie: CircleGauge,
  Atelier: Wrench,
} as const;

export default function AccessoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main>
      <PageIntro
        eyebrow="Accesorii originale"
        title="Mai pregătit. Nu mai încărcat."
        description="Protecție, ergonomie și bagaje dezvoltate pentru modelele VERIDIAN. Fiecare accesoriu afișează clar unde se potrivește."
      />
      <AccessoriesCatalogue searchParams={searchParams} />
    </main>
  );
}

async function AccessoriesCatalogue({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = firstValue(params.category) ?? "toate";
  const stock = firstValue(params.stock) ?? "toate";
  const sort = firstValue(params.sort) ?? "price-asc";
  const allAccessories = await getPublicAccessories();
  const categories = [...new Set(allAccessories.map((item) => item.category))];
  const accessories = filterAccessories(
    { category, stock, sort },
    allAccessories,
  );

  return (
    <section className="bg-porcelain text-obsidian py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <form
          action="/accesorii"
          className="border-obsidian/15 mb-8 grid gap-4 border-y py-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
        >
          <FilterSelect
            name="category"
            label="Categorie"
            defaultValue={category}
            options={[
              { value: "toate", label: "Toate categoriile" },
              ...categories.map((item) => ({ value: item, label: item })),
            ]}
          />
          <FilterSelect
            name="stock"
            label="Disponibilitate"
            defaultValue={stock}
            options={[
              { value: "toate", label: "Orice stare" },
              ...Object.entries(accessoryStockLabels).map(([value, label]) => ({
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
              { value: "name", label: "Nume A–Z" },
            ]}
          />
          <button
            type="submit"
            className="bg-obsidian text-porcelain hover:bg-veridian hover:text-obsidian h-11 px-6 text-sm font-bold transition-colors"
          >
            Aplică filtrele
          </button>
        </form>

        <p className="mb-6 text-sm font-semibold" aria-live="polite">
          {accessories.length}{" "}
          {accessories.length === 1 ? "accesoriu găsit" : "accesorii găsite"}
        </p>

        {accessories.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {accessories.map((accessory, index) => {
              const Icon =
                categoryIcons[
                  accessory.category as keyof typeof categoryIcons
                ] ?? BriefcaseBusiness;
              return (
                <article
                  key={accessory.slug}
                  className="border-obsidian/15 group hover:border-obsidian/35 flex min-h-[31rem] flex-col overflow-hidden border transition-[border-color,transform] duration-300 hover:-translate-y-1 motion-reduce:transform-none"
                >
                  <div className="bg-obsidian/5 relative aspect-[3/2] overflow-hidden">
                    {accessory.image ? (
                      <Image
                        src={accessory.image}
                        alt={accessory.imageAlt ?? accessory.name}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
                      />
                    ) : (
                      <Icon
                        className="text-veridian-dark absolute top-1/2 left-1/2 size-12 -translate-1/2"
                        aria-hidden="true"
                      />
                    )}
                    {accessory.featured ? (
                      <span className="bg-veridian text-obsidian absolute top-4 left-4 px-3 py-2 text-[0.65rem] font-extrabold tracking-[0.14em] uppercase">
                        Recomandat
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="bg-veridian/10 text-veridian-dark grid size-10 place-items-center">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="text-right">
                        <p className="text-steel text-xs font-bold uppercase">
                          {accessory.category}
                        </p>
                        <p className="text-veridian-dark mt-1 text-[11px] font-bold uppercase">
                          {accessoryStockLabels[accessory.stockState]}
                        </p>
                      </div>
                    </div>
                    <h2 className="font-heading mt-6 text-3xl font-extrabold uppercase">
                      {accessory.name}
                    </h2>
                    <p className="text-steel mt-3 line-clamp-3 text-sm leading-6">
                      {accessory.summary}
                    </p>
                    <p className="text-steel mt-3 text-xs leading-5">
                      Compatibil cu:{" "}
                      {accessory.compatibility.length
                        ? accessory.compatibility.join(" · ")
                        : "Solicită verificarea compatibilității"}
                    </p>
                    <div className="border-obsidian/10 mt-auto flex items-end justify-between border-t pt-5">
                      <div>
                        <p className="text-steel text-[0.65rem] uppercase">
                          TVA inclus
                        </p>
                        <p className="font-heading text-2xl font-bold">
                          {formatPrice(accessory.price)}
                        </p>
                      </div>
                      <Link
                        href={`/contact?subiect=${encodeURIComponent(accessory.name)}`}
                        aria-label={`Întreabă despre ${accessory.name}`}
                        className="border-obsidian/20 hover:bg-obsidian hover:text-porcelain grid size-10 place-items-center border transition-colors"
                      >
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border-obsidian/15 grid min-h-72 place-items-center border px-5 text-center">
            <div>
              <PackageSearch className="text-veridian-dark mx-auto size-9" />
              <h2 className="font-heading mt-4 text-3xl font-bold uppercase">
                Niciun accesoriu nu corespunde
              </h2>
              <Link
                href="/accesorii"
                className={buttonVariants({ className: "mt-5" })}
              >
                Resetează filtrele
              </Link>
            </div>
          </div>
        )}

        <div className="bg-obsidian text-porcelain mt-12 flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div>
            <p className="text-veridian text-xs font-bold uppercase">
              Nu ești sigur de compatibilitate?
            </p>
            <h2 className="font-heading mt-2 text-3xl font-bold uppercase">
              Spune-ne modelul și te ajutăm.
            </h2>
          </div>
          <Link href="/contact" className={buttonVariants({ size: "lg" })}>
            Întreabă un specialist
          </Link>
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
