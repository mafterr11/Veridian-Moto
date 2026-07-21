import type { Metadata, Viewport } from "next";

import { defaultSiteSettings } from "@/data/site-settings";
import { env } from "@/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  applicationName: "VERIDIAN Moto",
  title: defaultSiteSettings.defaultSeoTitle,
  description: defaultSiteSettings.defaultSeoDescription,
  creator: "VERIDIAN Moto",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0A0D0C",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ro"
      className="h-full"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
