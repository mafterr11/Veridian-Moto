import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gauge, Weight } from "lucide-react";

import { AvailabilityBadge } from "@/components/catalogue/availability-badge";
import type { Motorcycle } from "@/data/catalogue";
import { formatPrice } from "@/lib/format";

export function ModelCard({
  model,
  priority = false,
}: {
  model: Motorcycle;
  priority?: boolean;
}) {
  return (
    <article className="border-border bg-card text-card-foreground group flex h-full flex-col border">
      <Link
        href={`/modele/${model.slug}`}
        className="bg-muted relative block aspect-[4/3] overflow-hidden"
        aria-label={`Vezi ${model.name}`}
      >
        <Image
          src={model.image}
          alt={model.imageAlt}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="bg-background/85 absolute top-4 left-4 px-3 py-2 text-xs font-bold tracking-[0.14em] uppercase backdrop-blur">
          {model.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <AvailabilityBadge status={model.availability} />
        <h3 className="font-heading mt-3 text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
          {model.name}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-6">
          {model.description}
        </p>

        <div className="border-border text-muted-foreground mt-6 grid grid-cols-2 gap-3 border-y py-4 text-xs">
          <span className="flex items-center gap-2">
            <Gauge className="text-primary size-4" aria-hidden="true" />
            {model.powerHp} CP
          </span>
          <span className="flex items-center gap-2">
            <Weight className="text-primary size-4" aria-hidden="true" />
            {model.wetWeightKg} kg
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-[0.68rem] tracking-[0.12em] uppercase">
              De la, TVA inclus
            </p>
            <p className="font-heading mt-1 text-2xl font-bold">
              {formatPrice(model.price)}
            </p>
          </div>
          <Link
            href={`/modele/${model.slug}`}
            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground grid size-11 place-items-center border transition-colors"
            aria-label={`Detalii ${model.name}`}
          >
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
