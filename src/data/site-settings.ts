import {
  openingDayKeys,
  type NormalizedOpeningHours,
} from "@/domain/site-settings";

export type PublicSiteSettings = {
  contactEmail: string;
  contactPhone: string;
  address: string;
  openingHours: NormalizedOpeningHours;
  socialLinks: Record<string, string>;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
};

export const defaultSiteSettings: PublicSiteSettings = {
  contactEmail: "salut@veridian-moto.ro",
  contactPhone: "+40 312 345 678",
  address: "Strada Atelierului 24, Brașov, România",
  openingHours: {
    luni: { closed: false, opens: "09:00", closes: "18:00" },
    marti: { closed: false, opens: "09:00", closes: "18:00" },
    miercuri: { closed: false, opens: "09:00", closes: "18:00" },
    joi: { closed: false, opens: "09:00", closes: "18:00" },
    vineri: { closed: false, opens: "09:00", closes: "18:00" },
    sambata: { closed: false, opens: "10:00", closes: "14:00" },
    duminica: { closed: true },
  },
  socialLinks: {},
  defaultSeoTitle: "VERIDIAN Moto — Mai mult standard. Mai mult drum.",
  defaultSeoDescription:
    "Motociclete moderne, echipare generoasă și prețuri corecte. Descoperă gama VERIDIAN Moto.",
};

export function normalizeOpeningHours(
  value: Record<string, { closed?: boolean; opens?: string; closes?: string }>,
): NormalizedOpeningHours {
  return Object.fromEntries(
    openingDayKeys.map((day) => {
      const input = value[day];
      const fallback = defaultSiteSettings.openingHours[day];
      if (input?.closed) return [day, { closed: true }];
      return [
        day,
        {
          closed: false,
          opens: input?.opens ?? fallback.opens ?? "09:00",
          closes: input?.closes ?? fallback.closes ?? "18:00",
        },
      ];
    }),
  ) as NormalizedOpeningHours;
}

const supportedSocialNetworks = ["instagram", "youtube", "facebook"] as const;

export function sanitizeSocialLinks(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    supportedSocialNetworks.flatMap((network) => {
      const candidate = (value as Record<string, unknown>)[network];
      if (typeof candidate !== "string" || candidate.length === 0) return [];

      try {
        const url = new URL(candidate);
        return url.protocol === "http:" || url.protocol === "https:"
          ? [[network, url.toString()]]
          : [];
      } catch {
        return [];
      }
    }),
  );
}
