export const modelCategories = [
  "Adventure",
  "Sport",
  "Roadster",
  "Touring",
  "Heritage",
  "Urban Electric",
] as const;

export type ModelCategory = (typeof modelCategories)[number];
export type Availability = "available" | "incoming" | "order";

export type Motorcycle = {
  slug: string;
  name: string;
  category: string;
  price: number;
  powerHp: number;
  displacement: string;
  torqueNm: number;
  wetWeightKg: number;
  rangeKm?: number;
  image: string;
  imageAlt: string;
  description: string;
  highlights: readonly string[];
  availability: Availability;
  stockCount: number;
  featured?: boolean;
};

export type DemoModelMetadata = {
  seatHeightMm: number;
  modelYear: number;
  tagline: string;
  configuratorEnabled: boolean;
};

export const demoModelMetadata: Record<string, DemoModelMetadata> = {
  "terran-650": {
    seatHeightMm: 835,
    modelYear: 2026,
    tagline: "Echilibru dincolo de asfalt.",
    configuratorEnabled: false,
  },
  "terran-900-rally": {
    seatHeightMm: 870,
    modelYear: 2026,
    tagline: "Echipat pentru mai departe.",
    configuratorEnabled: true,
  },
  "apex-675-r": {
    seatHeightMm: 825,
    modelYear: 2026,
    tagline: "Precizie pentru lumea reală.",
    configuratorEnabled: false,
  },
  "apex-900-rr": {
    seatHeightMm: 830,
    modelYear: 2026,
    tagline: "Performanță fără scuze.",
    configuratorEnabled: false,
  },
  "rift-700": {
    seatHeightMm: 805,
    modelYear: 2026,
    tagline: "Orașul, pe ritmul tău.",
    configuratorEnabled: false,
  },
  "meridian-900-gt": {
    seatHeightMm: 820,
    modelYear: 2026,
    tagline: "Mai mult drum într-o singură zi.",
    configuratorEnabled: false,
  },
  "foundry-800": {
    seatHeightMm: 790,
    modelYear: 2026,
    tagline: "Caracter clasic. Răspuns modern.",
    configuratorEnabled: false,
  },
  "volt-e2": {
    seatHeightMm: 795,
    modelYear: 2026,
    tagline: "Liniște la semafor. Energie după el.",
    configuratorEnabled: false,
  },
};

export const motorcycles: readonly Motorcycle[] = [
  {
    slug: "terran-650",
    name: "Terran 650",
    category: "Adventure",
    price: 36_990,
    powerHp: 71,
    displacement: "649 cm³",
    torqueNm: 63,
    wetWeightKg: 218,
    image: "/images/models/terran-650.webp",
    imageAlt: "VERIDIAN Terran 650 în finisaj Dune Sand",
    description:
      "Un adventure echilibrat pentru navetă, serpentine și primul drum dincolo de asfalt.",
    highlights: ["Mânere încălzite", "TFT 7 inch", "Control tracțiune"],
    availability: "available",
    stockCount: 4,
    featured: true,
  },
  {
    slug: "terran-900-rally",
    name: "Terran 900 Rally",
    category: "Adventure",
    price: 54_990,
    powerHp: 105,
    displacement: "895 cm³",
    torqueNm: 93,
    wetWeightKg: 229,
    image: "/images/models/terran-900-rally.webp",
    imageAlt: "VERIDIAN Terran 900 Rally pe un drum montan",
    description:
      "Flagship-ul pentru distanțe lungi, drumuri rele și zile în care harta rămâne doar o sugestie.",
    highlights: ["Cruise control", "Quickshifter", "ABS în viraj"],
    availability: "available",
    stockCount: 2,
    featured: true,
  },
  {
    slug: "apex-675-r",
    name: "Apex 675 R",
    category: "Sport",
    price: 39_990,
    powerHp: 96,
    displacement: "675 cm³",
    torqueNm: 69,
    wetWeightKg: 188,
    image: "/images/models/apex-675-r.webp",
    imageAlt: "VERIDIAN Apex 675 R în studio",
    description:
      "Precizie de sportivă, ergonomie pentru lumea reală și tehnologie care lucrează cu tine.",
    highlights: ["Quickshifter", "Moduri de rulare", "Manete reglabile"],
    availability: "incoming",
    stockCount: 0,
    featured: true,
  },
  {
    slug: "apex-900-rr",
    name: "Apex 900 RR",
    category: "Sport",
    price: 66_990,
    powerHp: 142,
    displacement: "899 cm³",
    torqueNm: 104,
    wetWeightKg: 194,
    image: "/images/models/apex-900-rr.webp",
    imageAlt: "VERIDIAN Apex 900 RR în finisaj Ember Red",
    description:
      "Performanța fără scuze a gamei VERIDIAN, pregătită pentru circuit și civilizată pe șosea.",
    highlights: ["Launch control", "ABS în viraj", "Moduri Track"],
    availability: "order",
    stockCount: 0,
  },
  {
    slug: "rift-700",
    name: "Rift 700",
    category: "Roadster",
    price: 38_990,
    powerHp: 79,
    displacement: "698 cm³",
    torqueNm: 68,
    wetWeightKg: 191,
    image: "/images/models/rift-700.webp",
    imageAlt: "VERIDIAN Rift 700 într-un decor urban",
    description:
      "Roadster-ul direct și agil care face din fiecare drum prin oraș o alegere, nu o obligație.",
    highlights: ["Mânere încălzite", "USB-C", "Full LED"],
    availability: "available",
    stockCount: 6,
  },
  {
    slug: "meridian-900-gt",
    name: "Meridian 900 GT",
    category: "Touring",
    price: 59_990,
    powerHp: 112,
    displacement: "895 cm³",
    torqueNm: 98,
    wetWeightKg: 241,
    image: "/images/models/meridian-900-gt.webp",
    imageAlt: "VERIDIAN Meridian 900 GT pe un pas montan",
    description:
      "Confort de turer și răspuns sportiv, cu echiparea de drum lung deja inclusă.",
    highlights: ["Șa încălzită", "Cruise control", "TPMS"],
    availability: "incoming",
    stockCount: 0,
  },
  {
    slug: "foundry-800",
    name: "Foundry 800",
    category: "Heritage",
    price: 47_990,
    powerHp: 83,
    displacement: "799 cm³",
    torqueNm: 76,
    wetWeightKg: 205,
    image: "/images/models/foundry-800.webp",
    imageAlt: "VERIDIAN Foundry 800 în curtea unui atelier",
    description:
      "Forme clasice, răspuns modern și detalii pe care le observi înainte să pornești motorul.",
    highlights: ["Ride-by-wire", "USB-C ascuns", "Detalii frezate"],
    availability: "available",
    stockCount: 1,
  },
  {
    slug: "volt-e2",
    name: "Volt E2",
    category: "Urban Electric",
    price: 59_990,
    powerHp: 47,
    displacement: "Electric",
    torqueNm: 82,
    wetWeightKg: 181,
    rangeKm: 190,
    image: "/images/models/volt-e2.webp",
    imageAlt: "VERIDIAN Volt E2 într-o piață urbană modernă",
    description:
      "Mobilitate electrică practică, silențioasă și suficient de vie pentru a nu simți că faci economie.",
    highlights: ["Pornire keyless", "Marșarier asistat", "190 km autonomie"],
    availability: "order",
    stockCount: 0,
  },
] as const;

export const availabilityLabels: Record<Availability, string> = {
  available: "Disponibil acum",
  incoming: "În curând",
  order: "La comandă",
};

export type ModelFilters = {
  category?: string;
  availability?: string;
  sort?: string;
};

export function filterModels(
  filters: ModelFilters,
  source: readonly Motorcycle[] = motorcycles,
) {
  const result = source.filter((model) => {
    const matchesCategory =
      !filters.category ||
      filters.category === "toate" ||
      model.category === filters.category;
    const matchesAvailability =
      !filters.availability ||
      filters.availability === "toate" ||
      model.availability === filters.availability;

    return matchesCategory && matchesAvailability;
  });

  return [...result].sort((a, b) => {
    switch (filters.sort) {
      case "price-desc":
        return b.price - a.price;
      case "power-desc":
        return b.powerHp - a.powerHp;
      case "price-asc":
      default:
        return a.price - b.price;
    }
  });
}

export function getModel(slug: string) {
  return motorcycles.find((model) => model.slug === slug);
}
