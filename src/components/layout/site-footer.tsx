import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { getPublicSiteSettings } from "@/data/queries/public-site-settings";
import { phoneHref } from "@/domain/site-settings";
import { siteConfig } from "@/lib/site";

const legalLinks = [
  { label: "Confidențialitate", href: "/politica-de-confidentialitate" },
  { label: "Termeni", href: "/termeni-si-conditii" },
  { label: "Cookies", href: "/politica-cookies" },
] as const;

const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};

export async function SiteFooter() {
  const settings = await getPublicSiteSettings();
  const socialLinks = Object.entries(settings.socialLinks).filter(([, href]) =>
    Boolean(href),
  );
  return (
    <footer className="border-border bg-graphite border-t">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <BrandMark />
            <p className="text-muted-foreground mt-5 max-w-md text-sm leading-6">
              Motociclete moderne, echipare generoasă și prețuri directe.
              Construite pentru drumurile pe care chiar le faci.
            </p>
          </div>

          <div>
            <p className="text-muted-foreground mb-4 text-xs font-bold tracking-[0.18em] uppercase">
              Navigare
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-primary text-sm font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/configurator"
                className="text-primary inline-flex items-center gap-1 text-sm font-semibold"
              >
                Configurator
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-4 text-xs font-bold tracking-[0.18em] uppercase">
              Contact
            </p>
            <address className="text-muted-foreground space-y-2 text-sm leading-6 not-italic">
              <p>{settings.address}</p>
              <p>
                <a
                  className="hover:text-primary"
                  href={phoneHref(settings.contactPhone)}
                >
                  {settings.contactPhone}
                </a>
              </p>
              <p>
                <a
                  className="hover:text-primary"
                  href={`mailto:${settings.contactEmail}`}
                >
                  {settings.contactEmail}
                </a>
              </p>
            </address>
            {socialLinks.length ? (
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold">
                {socialLinks.map(([network, href]) => (
                  <a
                    key={network}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary"
                  >
                    {socialLabels[network] ?? network}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-12 flex flex-col gap-4 border-t pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <p>
            © {siteConfig.copyrightYear} VERIDIAN Moto. Brand fictiv — proiect
            demonstrativ.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
