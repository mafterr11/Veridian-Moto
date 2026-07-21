import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { getPublicSiteSettings } from "@/data/queries/public-site-settings";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    title: {
      default: settings.defaultSeoTitle,
      template: "%s | VERIDIAN Moto",
    },
    description: settings.defaultSeoDescription,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSiteSettings();

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MotorcycleDealer",
            name: "VERIDIAN Moto",
            url: env.NEXT_PUBLIC_APP_URL,
            slogan: "Mai mult standard. Mai mult drum.",
            email: settings.contactEmail,
            telephone: settings.contactPhone,
            address: settings.address,
            areaServed: { "@type": "Country", name: "România" },
          }).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </PublicShell>
  );
}
