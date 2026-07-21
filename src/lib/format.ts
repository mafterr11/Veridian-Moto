import { siteConfig } from "@/lib/site";

export function formatPrice(value: number) {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(siteConfig.locale).format(value);
}

export function formatMinorPrice(valueMinor: number) {
  return formatPrice(valueMinor / 100);
}
