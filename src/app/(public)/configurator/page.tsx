import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, SlidersHorizontal } from "lucide-react";

import { PageIntro } from "@/components/marketing/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { getConfigurableModels } from "@/data/queries/public-configurator";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Configurator",
  description: "Alege modelul VERIDIAN de la care începe configurația ta.",
};

export default async function ConfiguratorPage() {
  const models = await getConfigurableModels();
  return (
    <main>
      <PageIntro
        eyebrow="Configurator VERIDIAN"
        title="Începe cu motocicleta potrivită."
        description="Alege modelul, apoi personalizează finisajul, ergonomia, protecția și bagajele într-un flux clar, cu totalul mereu la vedere."
      />

      <section className="bg-porcelain text-obsidian py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SlidersHorizontal
                className="text-veridian-dark size-5"
                aria-hidden="true"
              />
              <p className="text-sm font-bold">Selectează un model</p>
            </div>
            <p className="text-steel text-xs font-semibold uppercase">
              {models.length} modele configurabile
            </p>
          </div>

          {models.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {models.map((model, index) => (
                <article
                  key={model.slug}
                  className="border-obsidian/15 group border bg-white"
                >
                  <Link href={`/configurator/${model.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      <Image
                        src={model.image}
                        alt={model.imageAlt}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
                      />
                      <span className="absolute top-3 left-3 bg-black/75 px-3 py-2 text-[0.65rem] font-bold tracking-wide text-white uppercase backdrop-blur">
                        Configurator activ
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-veridian-dark text-xs font-bold uppercase">
                        {model.category}
                      </p>
                      <h2 className="font-heading mt-2 text-3xl font-extrabold uppercase">
                        {model.name}
                      </h2>
                      <div className="border-obsidian/10 mt-5 flex items-end justify-between border-t pt-4">
                        <div>
                          <p className="text-steel text-[0.65rem] uppercase">
                            De la
                          </p>
                          <p className="font-heading text-xl font-bold">
                            {formatPrice(model.price)}
                          </p>
                        </div>
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-obsidian/20 border border-dashed px-6 py-16 text-center">
              <h2 className="font-heading text-4xl font-extrabold uppercase">
                Niciun configurator publicat
              </h2>
              <p className="text-steel mx-auto mt-3 max-w-xl leading-7">
                Modelele draft și configurațiile incomplete rămân în Atelier
                până trec validarea de publicare.
              </p>
              <Link
                href="/modele"
                className={buttonVariants({ className: "mt-6" })}
              >
                Vezi modelele
              </Link>
            </div>
          )}

          <div className="border-obsidian/15 mt-12 grid gap-5 border-t pt-8 sm:grid-cols-3">
            {[
              "Preț actualizat permanent",
              "Echiparea standard rămâne vizibilă",
              "Configurație gata de distribuit",
            ].map((item) => (
              <p
                key={item}
                className="flex items-center gap-3 text-sm font-semibold"
              >
                <Check
                  className="text-veridian-dark size-4"
                  aria-hidden="true"
                />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
