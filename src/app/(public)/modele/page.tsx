import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Gauge, ImageIcon, Weight, Zap } from "lucide-react";

import { AvailabilityBadge } from "@/components/catalogue/availability-badge";
import { ModelCard } from "@/components/catalogue/model-card";
import { buttonVariants } from "@/components/ui/button";
import {
  getPublicModel,
  getPublicModelIndexEntries,
  getPublicModels,
} from "@/data/queries/public-models";
import { env } from "@/env";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublicModelIndexEntries()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = await getPublicModel(slug);

  if (!model) return {};

  return {
    title: model.name,
    description: model.description,
    alternates: { canonical: `/modele/${model.slug}` },
    openGraph: {
      type: "website",
      title: `${model.name} | VERIDIAN Moto`,
      description: model.description,
      url: `/modele/${model.slug}`,
      images: [{ url: model.image, alt: model.imageAlt }],
    },
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [model, models] = await Promise.all([
    getPublicModel(slug),
    getPublicModels(),
  ]);

  if (!model) notFound();

  const related = models
    .filter(
      (item) => item.slug !== model.slug && item.category === model.category,
    )
    .slice(0, 2);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(model)).replace(/</g, "\\u003c"),
        }}
      />
      <section className="bg-card grid min-h-[calc(100svh-4.5rem)] lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-8 lg:order-1 lg:px-12 xl:pl-[max(3rem,calc((100vw-1440px)/2+3rem))]">
          <AvailabilityBadge status={model.availability} />
          <p className="text-muted-foreground mt-7 text-xs font-bold tracking-[0.2em] uppercase">
            VERIDIAN · {model.category}
          </p>
          <h1 className="font-heading mt-3 text-[clamp(4.5rem,8vw,8.5rem)] leading-[0.78] font-extrabold tracking-[-0.04em] uppercase">
            {model.name}
          </h1>
          <p className="text-muted-foreground mt-7 max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
            {model.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            <Spec icon={Gauge} value={`${model.powerHp} CP`} label="Putere" />
            <Spec icon={Zap} value={`${model.torqueNm} Nm`} label="Cuplu" />
            <Spec
              icon={Weight}
              value={`${model.wetWeightKg} kg`}
              label="Greutate"
            />
          </div>

          <div className="border-border mt-9 flex flex-col gap-5 border-t pt-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
                Preț de pornire · TVA inclus
              </p>
              <p className="font-heading mt-1 text-4xl font-bold">
                {formatPrice(model.price)}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {model.configuratorEnabled && (
                <Link
                  href={`/configurator/${model.slug}`}
                  className={buttonVariants({ size: "lg" })}
                >
                  Configurează
                </Link>
              )}
              <Link
                href="/contact"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Cere o ofertă
              </Link>
            </div>
          </div>
        </div>

        <div className="relative order-1 min-h-[46svh] overflow-hidden lg:order-2 lg:min-h-full">
          <Image
            src={model.image}
            alt={model.imageAlt}
            fill
            priority
            loading="eager"
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
          <div className="lg:from-card/30 absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent lg:bg-gradient-to-r lg:to-transparent" />
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-85">
              Vine standard
            </p>
            <h2 className="font-heading mt-3 text-4xl leading-[0.95] font-extrabold uppercase sm:text-6xl">
              Lucrurile bune sunt deja pe motocicletă.
            </h2>
          </div>
          <ul className="grid gap-px bg-black/20 sm:grid-cols-2">
            {model.highlights.map((highlight) => (
              <li
                key={highlight}
                className="bg-primary flex items-center gap-4 p-5 font-bold"
              >
                <span className="grid size-8 place-items-center border border-black/25">
                  <Check className="size-4" aria-hidden="true" />
                </span>
                {highlight}
              </li>
            ))}
            <li className="bg-primary flex items-center gap-4 p-5 font-bold">
              <span className="grid size-8 place-items-center border border-black/25">
                <Check className="size-4" aria-hidden="true" />
              </span>
              Garanție 4 ani
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-porcelain text-obsidian py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="bg-obsidian/15 border-obsidian/15 grid gap-px border sm:grid-cols-2 lg:grid-cols-3">
            <TechnicalItem label="Motor" value={model.displacement} />
            <TechnicalItem
              label="Putere maximă"
              value={`${model.powerHp} CP`}
            />
            <TechnicalItem label="Cuplu maxim" value={`${model.torqueNm} Nm`} />
            <TechnicalItem
              label="Greutate la plin"
              value={`${model.wetWeightKg} kg`}
            />
            <TechnicalItem
              label="Înălțime șa"
              value={`${model.seatHeightMm} mm`}
            />
            <TechnicalItem label="An model" value={String(model.modelYear)} />
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-veridian-dark text-xs font-bold tracking-[0.2em] uppercase">
                {model.configuratorEnabled
                  ? "Fă-l al tău"
                  : "Vezi-l de aproape"}
              </p>
              <h2 className="font-heading mt-4 text-5xl leading-[0.9] font-extrabold uppercase sm:text-7xl">
                {model.configuratorEnabled
                  ? "Culoare, ergonomie, protecție și bagaje."
                  : "Stoc real, preț clar și ajutor direct."}
              </h2>
              <p className="text-steel mt-6 max-w-xl leading-7">
                {model.configuratorEnabled
                  ? "Configuratorul păstrează echiparea standard la vedere și îți arată fiecare modificare de preț înainte să continui."
                  : model.fullDescription}
              </p>
              <Link
                href={
                  model.configuratorEnabled
                    ? `/configurator/${model.slug}`
                    : `/contact?subiect=${encodeURIComponent(model.name)}`
                }
                className={cn(buttonVariants({ size: "lg" }), "mt-8")}
              >
                {model.configuratorEnabled
                  ? "Începe configurația"
                  : "Întreabă despre model"}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </div>
            <div className="border-obsidian/15 bg-obsidian text-porcelain p-6 sm:p-8">
              <p className="text-veridian text-xs font-bold tracking-[0.16em] uppercase">
                Configurația de bază
              </p>
              <div className="mt-6 space-y-4">
                {model.highlights.map((item) => (
                  <div
                    key={item}
                    className="border-border flex items-center justify-between border-b pb-4 text-sm"
                  >
                    <span>{item}</span>
                    <span className="text-primary font-bold">Inclus</span>
                  </div>
                ))}
                <div className="flex items-end justify-between pt-2">
                  <span className="text-muted-foreground text-xs font-bold uppercase">
                    Total de bază
                  </span>
                  <strong className="font-heading text-3xl">
                    {formatPrice(model.price)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-border bg-background border-t py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
                Inventar public
              </p>
              <h2 className="font-heading mt-3 text-4xl font-extrabold uppercase sm:text-6xl">
                Unități reale pentru {model.name}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              VIN-ul și notele interne nu sunt publicate.
            </p>
          </div>

          {model.inventory.length ? (
            <div className="border-border mt-9 grid gap-px border bg-white/10 lg:grid-cols-2">
              {model.inventory.map((unit) => (
                <article
                  key={unit.stockCode}
                  className="bg-card grid gap-5 p-5 sm:grid-cols-[8rem_1fr] sm:p-6"
                >
                  <div className="bg-muted relative aspect-[4/3] overflow-hidden sm:aspect-square">
                    {unit.image ? (
                      <Image
                        src={unit.image}
                        alt={unit.imageAlt ?? `${model.name}, ${unit.colour}`}
                        fill
                        sizes="8rem"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground absolute inset-0 grid place-items-center text-center text-[0.65rem] font-bold tracking-wide uppercase">
                        <span>
                          <ImageIcon
                            className="mx-auto mb-2 size-5"
                            aria-hidden="true"
                          />
                          Fotografie în curând
                        </span>
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-primary text-xs font-bold uppercase">
                          {unit.status === "available"
                            ? "Disponibilă"
                            : "În tranzit"}
                        </p>
                        <h3 className="font-heading mt-1 text-2xl font-bold uppercase">
                          {unit.colour}
                        </h3>
                      </div>
                      <strong className="font-heading text-xl">
                        {formatPrice(unit.price)}
                      </strong>
                    </div>
                    <p className="text-muted-foreground mt-3 text-xs leading-5">
                      {unit.condition === "new"
                        ? "Nouă"
                        : unit.condition === "demo"
                          ? "Demo"
                          : "Rulată"}{" "}
                      · {unit.year} · {unit.mileageKm.toLocaleString("ro-RO")}{" "}
                      km · cod {unit.stockCode}
                    </p>
                    <Link
                      href={`/contact?subiect=${encodeURIComponent(`${model.name} ${unit.stockCode}`)}`}
                      className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-bold"
                    >
                      Cere detalii
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-border mt-9 border p-7">
              <p className="text-muted-foreground">
                Nu există momentan unități publice. Modelul poate fi comandat
                prin echipa VERIDIAN.
              </p>
              <Link
                href={`/contact?subiect=${encodeURIComponent(model.name)}`}
                className={cn(buttonVariants({ size: "lg" }), "mt-5")}
              >
                Solicită termen de livrare
              </Link>
            </div>
          )}
        </div>
      </section>

      {related.length ? (
        <section className="border-border bg-background border-t py-20">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <h2 className="font-heading text-4xl font-extrabold uppercase sm:text-5xl">
              Tot din familia {model.category}
            </h2>
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {related.map((item) => (
                <ModelCard key={item.slug} model={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function productJsonLd(model: Awaited<ReturnType<typeof getPublicModel>>) {
  if (!model) return {};

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `VERIDIAN ${model.name}`,
    description: model.description,
    image: model.media.length
      ? model.media.map(
          (media) => new URL(media.path, env.NEXT_PUBLIC_APP_URL).href,
        )
      : [new URL(model.image, env.NEXT_PUBLIC_APP_URL).href],
    sku: model.slug,
    brand: { "@type": "Brand", name: "VERIDIAN Moto" },
    model: model.name,
    category: model.category,
    url: new URL(`/modele/${model.slug}`, env.NEXT_PUBLIC_APP_URL).href,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RON",
      lowPrice: model.price,
      offerCount: Math.max(model.inventory.length, 1),
      availability:
        model.availability === "available"
          ? "https://schema.org/InStock"
          : model.availability === "incoming"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/BackOrder",
    },
  };
}

function Spec({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Gauge;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-primary size-5" aria-hidden="true" />
      <div>
        <p className="font-heading text-xl font-bold">{value}</p>
        <p className="text-muted-foreground text-[0.65rem] font-bold tracking-wide uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}

function TechnicalItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-porcelain p-6">
      <p className="text-steel text-xs font-bold tracking-wide uppercase">
        {label}
      </p>
      <p className="font-heading mt-2 text-3xl font-bold uppercase">{value}</p>
    </div>
  );
}
