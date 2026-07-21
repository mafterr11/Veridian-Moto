export const openingDayKeys = [
  "luni",
  "marti",
  "miercuri",
  "joi",
  "vineri",
  "sambata",
  "duminica",
] as const;

export type OpeningDayKey = (typeof openingDayKeys)[number];

export const openingDayLabels: Record<OpeningDayKey, string> = {
  luni: "Luni",
  marti: "Marți",
  miercuri: "Miercuri",
  joi: "Joi",
  vineri: "Vineri",
  sambata: "Sâmbătă",
  duminica: "Duminică",
};

export type NormalizedOpeningHours = Record<
  OpeningDayKey,
  { closed: boolean; opens?: string; closes?: string }
>;

export function formatOpeningHours(hours: NormalizedOpeningHours) {
  return openingDayKeys
    .map((day) => {
      const value = hours[day];
      return `${openingDayLabels[day]}: ${value.closed ? "închis" : `${value.opens}–${value.closes}`}`;
    })
    .join(" · ");
}

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
