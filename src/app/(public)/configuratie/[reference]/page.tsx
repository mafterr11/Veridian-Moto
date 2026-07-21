import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, LockKeyhole } from "lucide-react";

import { ConfigurationShareButton } from "@/components/configurator/configuration-share-button";
import { buttonVariants } from "@/components/ui/button";
import { getPublicConfiguration } from "@/data/queries/public-configurations";
import { publicReferenceSchema } from "@/domain/enquiries/schemas";
import { formatMinorPrice } from "@/lib/format";

type PageProps = { params: Promise<{ reference: string }> };

export const metadata: Metadata = {
  title: "Configurație salvată",
  description: "Rezumatul unei configurații VERIDIAN Moto salvate.",
  robots: { index: false, follow: false },
};

export default function SavedConfigurationPage({ params }: PageProps) {
  return (
    <Suspense fallback={<SavedConfigurationFallback />}>
      <SavedConfigurationContent params={params} />
    </Suspense>
  );
}

async function SavedConfigurationContent({ params }: PageProps) {
  const parsed = publicReferenceSchema.safeParse((await params).reference);
  if (!parsed.success) notFound();
  const snapshot = await getPublicConfiguration(parsed.data);
  if (!snapshot) notFound();

  return (
    <main className="bg-porcelain text-obsidian py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="border-veridian/40 bg-veridian/5 flex gap-4 border p-5">
          <CheckCircle2 className="text-veridian-dark mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-bold">Configurație salvată și recalculată</p>
            <p className="text-steel mt-1 text-sm leading-6">
              Referință publică: <strong>{snapshot.reference}</strong>. Linkul
              conține doar motocicleta, opțiunile și prețurile — niciodată date
              de contact.
            </p>
          </div>
        </div>

        <header className="mt-10">
          <p className="text-veridian-dark text-xs font-bold tracking-[0.18em] uppercase">
            VERIDIAN · {snapshot.modelIdentity.modelYear}
          </p>
          <h1 className="font-heading mt-3 text-5xl leading-none font-extrabold uppercase sm:text-7xl">
            {snapshot.modelIdentity.name}
          </h1>
          <p className="text-steel mt-4 text-sm">
            Salvată la{" "}
            {snapshot.createdAt.toLocaleString("ro-RO", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </header>

        <section className="border-obsidian/15 mt-10 border">
          <div className="border-obsidian/10 flex flex-col items-start justify-between gap-4 border-b p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-heading text-2xl font-bold uppercase">
                Motocicletă de bază
              </p>
              <p className="text-steel text-xs">TVA inclus</p>
            </div>
            <strong className="font-heading shrink-0 text-2xl">
              {formatMinorPrice(snapshot.basePriceMinor)}
            </strong>
          </div>
          {snapshot.selectedChoices.map((choice, index) => (
            <div
              key={`${choice.groupKey}-${choice.choiceCode}-${index}`}
              className="border-obsidian/10 flex flex-col items-start justify-between gap-3 border-b p-5 last:border-b-0 sm:flex-row sm:gap-5"
            >
              <div>
                <p className="text-steel text-[0.65rem] font-bold tracking-wide uppercase">
                  {choice.groupName}
                </p>
                <p className="mt-1 font-semibold">{choice.choiceName}</p>
                {!choice.isCurrentlyAvailable && (
                  <p className="mt-1 text-xs font-bold text-amber-800 uppercase">
                    Alegere istorică · indisponibilă acum
                  </p>
                )}
              </div>
              <span className="shrink-0 font-semibold">
                {choice.priceDeltaMinor
                  ? `+ ${formatMinorPrice(choice.priceDeltaMinor)}`
                  : "Inclus"}
              </span>
            </div>
          ))}
          <div className="bg-obsidian text-porcelain flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-end sm:gap-5">
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase">
                Total configurat
              </p>
              <p className="text-muted-foreground mt-1 text-xs">TVA inclus</p>
            </div>
            <strong className="font-heading text-4xl font-extrabold">
              {formatMinorPrice(snapshot.totalPriceMinor)}
            </strong>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/contact?configuratie=${snapshot.reference}`}
            className={buttonVariants({ size: "lg" })}
          >
            Cere ofertă pentru configurație
          </Link>
          <ConfigurationShareButton />
        </div>

        <div className="border-obsidian/15 text-steel mt-8 flex gap-3 border p-4 text-sm leading-6">
          <LockKeyhole className="text-veridian-dark mt-0.5 size-5 shrink-0" />
          Aceasta este o copie istorică imuabilă. Modificările ulterioare din
          catalog nu schimbă denumirile sau prețurile salvate aici și nu rezervă
          o motocicletă din stoc.
        </div>
      </div>
    </main>
  );
}

function SavedConfigurationFallback() {
  return (
    <main className="bg-porcelain text-obsidian py-16 sm:py-24">
      <div className="mx-auto max-w-4xl animate-pulse px-5 sm:px-8">
        <div className="bg-veridian/10 h-24" />
        <div className="bg-obsidian/10 mt-10 h-20 w-3/4" />
        <div className="bg-obsidian/5 mt-10 h-96" />
      </div>
    </main>
  );
}
