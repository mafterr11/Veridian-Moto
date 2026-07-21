import type { Metadata, Viewport } from "next";

import { getPublicSiteSettings } from "@/data/queries/public-site-settings";
import { env } from "@/env";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    applicationName: "VERIDIAN Moto",
    title: {
      default: settings.defaultSeoTitle,
      template: "%s | VERIDIAN Moto",
    },
    description: settings.defaultSeoDescription,
    creator: "VERIDIAN Moto",
  };
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0A0D0C",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSiteSettings();
  return (
    <html
      lang="ro"
      className="h-full"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col antialiased">
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
      </body>
    </html>
  );
}
