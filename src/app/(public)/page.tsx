import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  ChevronRight,
  Gauge,
  Map,
  PackageCheck,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ThermometerSun,
} from "lucide-react";

import { ModelCard } from "@/components/catalogue/model-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getPublicArticles } from "@/data/queries/public-editorial";
import {
  getPublicCategories,
  getPublicModels,
} from "@/data/queries/public-models";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Motociclete cu mai mult standard",
  description:
    "Descoperă gama VERIDIAN Moto: adventure, sport, roadster, touring, heritage și electric, cu echipare generoasă inclusă.",
};

const valuePoints = [
  {
    icon: ThermometerSun,
    title: "Confort inclus",
    detail:
      "Mânere încălzite și ergonomie gândită pentru drum, nu pentru listă.",
  },
  {
    icon: Gauge,
    title: "Tehnologie utilă",
    detail: "TFT, USB-C și asistențe de rulare acolo unde chiar își au rostul.",
  },
  {
    icon: ShieldCheck,
    title: "Siguranță standard",
    detail: "ABS și controlul tracțiunii nu ar trebui să fie un lux opțional.",
  },
  {
    icon: PackageCheck,
    title: "Preț transparent",
    detail: "Mai puține pachete artificiale. Vezi de la început ce primești.",
  },
] as const;

export default async function HomePage() {
  const models = await getPublicModels();
  const categories = await getPublicCategories();
  const publicArticles = await getPublicArticles();
  const stories = publicArticles.slice(0, 3);
  const heroModel =
    models.find((model) => model.slug === "terran-900-rally") ?? models[0];
  const featuredModels = models.filter((model) => model.featured).slice(0, 3);
  const preferredHomepageModels = featuredModels.length
    ? [...featuredModels, ...models]
    : models;
  const uniqueHomepageModels = preferredHomepageModels.filter(
    (model, index, catalogue) =>
      catalogue.findIndex((candidate) => candidate.slug === model.slug) ===
      index,
  );
  const modelsWithoutHero = uniqueHomepageModels.filter(
    (model) => model.slug !== heroModel?.slug,
  );
  const homepageModels = (
    modelsWithoutHero.length >= 3 ? modelsWithoutHero : uniqueHomepageModels
  ).slice(0, 3);
  const availableModels = models.filter(
    (model) => model.availability === "available",
  );
  const configuratorVisual =
    models.find((model) => model.slug === "apex-675-r") ?? heroModel;

  return (
    <main>
      <section className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden border-b border-white/10 lg:min-h-[calc(100svh-5rem)]">
        {heroModel && (
          <Image
            src={heroModel.image}
            alt={heroModel.imageAlt}
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="-z-30 object-cover object-[68%_center]"
          />
        )}
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(10,13,12,0.98)_0%,rgba(10,13,12,0.87)_34%,rgba(10,13,12,0.28)_69%,rgba(10,13,12,0.1)_100%)]" />
        <div className="from-background to-background/20 absolute inset-0 -z-10 bg-gradient-to-t via-transparent" />
        <div
          className="technical-grid pointer-events-none absolute inset-0 -z-10 opacity-30"
          aria-hidden="true"
        />

        <div className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-[1440px] flex-col justify-between px-5 py-8 sm:px-8 lg:min-h-[calc(100svh-5rem)] lg:px-12 lg:py-12">
          <div className="flex items-center gap-3 self-start border border-white/15 bg-black/25 px-3 py-2 text-[0.68rem] font-bold tracking-[0.16em] uppercase backdrop-blur">
            <span
              className="bg-primary size-1.5 rounded-full"
              aria-hidden="true"
            />
            {heroModel ? `Noul ${heroModel.name}` : "Gama VERIDIAN Moto"}
          </div>

          <div className="max-w-4xl py-16 sm:py-20">
            <p className="text-primary mb-5 text-xs font-bold tracking-[0.22em] uppercase sm:text-sm">
              Echipat pentru mai departe
            </p>
            <h1 className="font-heading text-[clamp(4.25rem,10.5vw,9.5rem)] leading-[0.78] font-extrabold tracking-[-0.04em] uppercase">
              Mai mult
              <span className="block">standard.</span>
              <span className="text-primary mt-3 block">Mai mult drum.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Tehnologia pe care o folosești ar trebui să vină deja pe
              motocicletă. La VERIDIAN, exact de aici începem.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/modele" className={buttonVariants({ size: "lg" })}>
                Descoperă modelele
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
              <Link
                href={
                  heroModel
                    ? `/configurator/${heroModel.slug}`
                    : "/configurator"
                }
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Configurează
                <SlidersHorizontal data-icon="inline-end" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {heroModel && (
            <div className="grid max-w-2xl grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-5">
              <HeroStat value={`${heroModel.powerHp} CP`} label="Putere" />
              <HeroStat value={`${heroModel.torqueNm} Nm`} label="Cuplu" />
              <HeroStat value={formatPrice(heroModel.price)} label="De la" />
            </div>
          )}
        </div>
      </section>

      <section className="bg-porcelain text-obsidian py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Gama VERIDIAN"
              surface="light"
              title="Alege drumul. Noi am inclus esențialul."
              description={`De la naveta de luni până la pasul montan de duminică. ${models.length || "Nicio"} ${models.length === 1 ? "motocicletă publicată" : "motociclete publicate"}, aceeași regulă: echipare reală la un preț corect.`}
            />
            <Link
              href="/modele"
              className="group inline-flex items-center gap-3 self-start text-sm font-bold lg:self-auto"
            >
              Vezi toate modelele
              <span className="border-obsidian/30 group-hover:bg-obsidian group-hover:text-porcelain grid size-10 place-items-center border transition-colors">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </div>

          {homepageModels.length ? (
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {homepageModels.map((model, index) => (
                <ModelCard
                  key={model.slug}
                  model={model}
                  priority={index === 0}
                />
              ))}
            </div>
          ) : (
            <HomeEmptyPrompt
              title="Gama se pregătește în Atelier."
              description="Nu există încă modele publicate. Poți reveni după prima lansare sau ne poți scrie direct."
              href="/contact"
              action="Contactează-ne"
              surface="light"
            />
          )}
        </div>
      </section>

      <section className="border-border bg-background py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="O motocicletă pentru fiecare ritm"
            title={`${categories.length || "Nicio"} ${categories.length === 1 ? "categorie" : "categorii"}. Nicio etichetă inutilă.`}
          />
          {categories.length ? (
            <div className="border-border bg-border mt-12 grid gap-px border sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => {
                const model = models.find(
                  (item) => item.category === category.name,
                );

                return (
                  <Link
                    key={category.slug}
                    href={`/modele?category=${encodeURIComponent(category.name)}`}
                    className="bg-card hover:bg-muted group relative min-h-56 overflow-hidden p-6 transition-colors sm:min-h-64"
                  >
                    {model && (
                      <Image
                        src={model.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-50 motion-reduce:transition-none"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between text-xs font-bold tracking-[0.15em] text-white/60 uppercase">
                        <span>0{index + 1}</span>
                        <span>
                          {category.modelCount}{" "}
                          {category.modelCount === 1 ? "model" : "modele"}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <h3 className="font-heading text-4xl font-extrabold uppercase sm:text-5xl">
                          {category.name}
                        </h3>
                        <ChevronRight
                          className="text-primary size-6 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <HomeEmptyPrompt
              title="Categoriile vor apărea aici."
              description="Catalogul public este momentan gol, fără a înlocui datele lipsă cu produse administrative sau private."
              href="/modele"
              action="Verifică gama"
            />
          )}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="mb-4 text-xs font-bold tracking-[0.2em] uppercase opacity-85">
                Standard înseamnă standard
              </p>
              <h2 className="font-heading text-5xl leading-[0.9] font-extrabold tracking-[-0.03em] uppercase sm:text-6xl lg:text-7xl">
                Echiparea bună nu stă ascunsă într-un pachet.
              </h2>
              <p className="mt-6 max-w-xl leading-7 opacity-85">
                Am pornit de la ce folosește un motociclist în fiecare zi și am
                construit gama în jurul acelor lucruri.
              </p>
            </div>

            <div className="grid gap-px bg-black/20 sm:grid-cols-2">
              {valuePoints.map(({ icon: Icon, title, detail }) => (
                <article key={title} className="bg-primary p-6 sm:p-8">
                  <Icon
                    className="size-7"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  <h3 className="font-heading mt-8 text-2xl font-bold uppercase">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 opacity-85">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-porcelain text-obsidian py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="În stoc"
              surface="light"
              title="Pleci mai repede decât crezi."
              description="Unități reale din stocul demonstrativ, afișate clar înainte să ne contactezi."
            />
            <p className="text-sm font-semibold">
              {availableModels.reduce(
                (total, model) => total + model.stockCount,
                0,
              )}{" "}
              motociclete disponibile
            </p>
          </div>

          {availableModels.length ? (
            <div className="border-obsidian/15 mt-12 divide-y border-y">
              {availableModels.slice(0, 4).map((model) => (
                <Link
                  key={model.slug}
                  href={`/modele/${model.slug}`}
                  className="group grid gap-4 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="bg-veridian size-2 rounded-full"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-heading text-2xl font-bold uppercase">
                        {model.name}
                      </p>
                      <p className="text-steel text-xs font-semibold uppercase">
                        {model.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {model.stockCount}{" "}
                    {model.stockCount === 1 ? "unitate" : "unități"}
                  </p>
                  <span className="font-heading flex items-center justify-between gap-5 text-xl font-bold sm:justify-end">
                    {formatPrice(model.price)}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <HomeEmptyPrompt
              title="Nicio unitate disponibilă acum."
              description="Modelele publicate pot fi configurate în continuare; disponibilitatea exactă se confirmă printr-o solicitare."
              href="/configurator"
              action="Deschide configuratorul"
              surface="light"
            />
          )}
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-white/10 py-24 sm:py-32 lg:py-40">
        {configuratorVisual && (
          <Image
            src={configuratorVisual.image}
            alt={`${configuratorVisual.name} pregătit pentru configurare`}
            fill
            sizes="100vw"
            className="-z-20 object-cover object-center"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,13,12,0.98),rgba(10,13,12,0.84)_48%,rgba(10,13,12,0.25))]" />
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-primary mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase">
              <Sparkles className="size-4" aria-hidden="true" />
              Al tău, până la ultimul detaliu
            </p>
            <h2 className="font-heading text-5xl leading-[0.88] font-extrabold tracking-[-0.03em] uppercase sm:text-7xl">
              Construiește motocicleta pe care o vezi deja în minte.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              Alege modelul, culoarea, ergonomia și accesoriile. Prețul se
              actualizează clar, fără surprize la ultimul pas.
            </p>
            <Link
              href="/configurator"
              className={cn(buttonVariants({ size: "lg" }), "mt-8")}
            >
              Deschide configuratorul
              <SlidersHorizontal data-icon="inline-end" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Descoperă"
              title="Mai mult decât fișa tehnică."
              description="Ghiduri oneste, tehnologie explicată simplu și drumuri care merită puse pe hartă."
            />
            <Link
              href="/descopera"
              className="text-primary inline-flex items-center gap-2 text-sm font-bold"
            >
              Toate poveștile
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {stories.length ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {stories.map((story) => (
                <article key={story.slug} className="group">
                  <Link href={`/descopera/${story.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={story.image}
                        alt={story.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                      />
                    </div>
                    <div className="pt-5">
                      <div className="text-muted-foreground flex items-center gap-3 text-xs font-bold tracking-wide uppercase">
                        <span className="text-primary">{story.category}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={story.publishedAt.toISOString()}>
                          {story.publishedAt.toLocaleDateString("ro-RO", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                      <h3 className="font-heading group-hover:text-primary mt-3 text-2xl leading-tight font-bold uppercase transition-colors sm:text-3xl">
                        {story.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <HomeEmptyPrompt
              title="Următoarea poveste este încă în lucru."
              description="Articolele draft și cele programate nu sunt expuse înainte de publicare."
              href="/descopera"
              action="Deschide Descoperă"
            />
          )}
        </div>
      </section>

      <section className="border-border bg-card border-t">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
              Hai să vorbim despre următorul drum
            </p>
            <h2 className="font-heading mt-4 max-w-4xl text-4xl leading-[0.95] font-extrabold uppercase sm:text-6xl">
              Vezi motocicleta. Pune întrebările. Programează o întâlnire.
            </h2>
          </div>
          <div className="border-border flex flex-col gap-3 border-t px-5 py-8 sm:flex-row sm:px-8 lg:border-t-0 lg:border-l lg:px-12">
            <Link href="/contact" className={buttonVariants({ size: "lg" })}>
              Contactează-ne
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              href="/modele?availability=available"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Map data-icon="inline-start" aria-hidden="true" />
              Vezi stocul
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 first:pl-0 sm:px-5 sm:first:pl-0">
      <p className="font-heading text-lg font-bold sm:text-2xl">{value}</p>
      <p className="mt-1 text-[0.62rem] font-bold tracking-[0.14em] text-white/50 uppercase sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function HomeEmptyPrompt({
  title,
  description,
  href,
  action,
  surface = "dark",
}: {
  title: string;
  description: string;
  href: Route;
  action: string;
  surface?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "mt-12 border border-dashed px-6 py-12 text-center",
        surface === "light" ? "border-obsidian/20" : "border-border",
      )}
    >
      <h3 className="font-heading text-3xl font-extrabold uppercase">
        {title}
      </h3>
      <p
        className={cn(
          "mx-auto mt-3 max-w-xl text-sm leading-6",
          surface === "light" ? "text-steel" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
      <Link href={href} className={buttonVariants({ className: "mt-6" })}>
        {action}
      </Link>
    </div>
  );
}
