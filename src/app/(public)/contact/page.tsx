import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock3, Mail, MapPin, Phone, Route } from "lucide-react";

import { PageIntro } from "@/components/marketing/page-intro";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { getPublicSiteSettings } from "@/data/queries/public-site-settings";
import { publicReferenceSchema } from "@/domain/enquiries/schemas";
import { formatOpeningHours, phoneHref } from "@/domain/site-settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactează VERIDIAN Moto pentru modele, stoc, accesorii și configurații.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const settings = await getPublicSiteSettings();
  return (
    <main>
      <PageIntro
        eyebrow="Contact"
        title="Întrebările bune pornesc motoarele potrivite."
        description="Spune-ne ce model te interesează, ce fel de drumuri faci și ce vrei să afli. Răspundem direct, fără scenarii de vânzare."
      />
      <section className="bg-porcelain text-obsidian py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="text-veridian-dark text-xs font-bold tracking-[0.18em] uppercase">
              VERIDIAN Moto Hub Brașov
            </p>
            <h2 className="font-heading mt-4 text-5xl font-extrabold uppercase sm:text-6xl">
              Vino să vezi motocicletele de aproape.
            </h2>
            <div className="mt-8 space-y-6">
              <ContactLine
                icon={MapPin}
                label="Adresă"
                value={settings.address}
              />
              <ContactLine
                icon={Phone}
                label="Telefon"
                value={settings.contactPhone}
                href={phoneHref(settings.contactPhone)}
              />
              <ContactLine
                icon={Mail}
                label="Email"
                value={settings.contactEmail}
                href={`mailto:${settings.contactEmail}`}
              />
              <ContactLine
                icon={Clock3}
                label="Program"
                value={formatOpeningHours(settings.openingHours)}
              />
            </div>
          </div>

          <div className="bg-obsidian text-porcelain p-7 sm:p-10">
            <p className="text-veridian text-xs font-bold tracking-[0.18em] uppercase">
              Trimite o solicitare
            </p>
            <h2 className="font-heading mt-3 text-4xl font-extrabold uppercase sm:text-5xl">
              Cu ce te putem ajuta?
            </h2>
            <p className="text-muted-foreground mt-5 max-w-2xl leading-7">
              Formularul este validat pe server și ajunge în inboxul protejat
              VERIDIAN. O configurație salvată poate fi atașată fără să expună
              public datele tale de contact.
            </p>
            <Suspense
              fallback={<div className="mt-8 h-96 animate-pulse bg-white/5" />}
            >
              <ContactFormFromSearchParams searchParams={searchParams} />
            </Suspense>
            <div className="border-border mt-10 grid gap-5 border-t pt-7 sm:grid-cols-2">
              <p className="flex gap-3 text-sm leading-6 text-white/65">
                <Route
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                Parcare moto și acces pentru test ride în curtea interioară.
              </p>
              <p className="flex gap-3 text-sm leading-6 text-white/65">
                <Clock3
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                Recomandăm programare pentru o discuție dedicată.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function ContactFormFromSearchParams({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const parsedReference = publicReferenceSchema.safeParse(
    firstValue(params.configuratie),
  );
  const configurationReference = parsedReference.success
    ? parsedReference.data
    : undefined;
  const subject = firstValue(params.subiect);
  const safeSubject = subject
    ?.replace(/[\u0000-\u001f\u007f]/g, " ")
    .slice(0, 160);
  return (
    <InquiryForm
      configurationReference={configurationReference}
      defaultSubject={
        configurationReference
          ? `Ofertă configurație ${configurationReference}`
          : safeSubject
            ? `Solicitare: ${safeSubject}`
            : undefined
      }
    />
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon
        className="text-veridian-dark mt-0.5 size-5 shrink-0"
        aria-hidden="true"
      />
      <div>
        <p className="text-steel text-xs font-bold uppercase">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value}</p>
      </div>
    </>
  );
  return href ? (
    <a href={href} className="hover:text-veridian-dark flex gap-4">
      {content}
    </a>
  ) : (
    <div className="flex gap-4">{content}</div>
  );
}
