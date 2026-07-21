import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Atelier",
    template: "%s | VERIDIAN Atelier",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function AtelierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
