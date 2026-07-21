import type { PublicAccessoryDTO } from "@/data/dto/public-accessory";

export const demoAccessories: readonly PublicAccessoryDTO[] = [
  {
    slug: "set-cutii-laterale-aluminium",
    name: "Set cutii laterale aluminium",
    category: "Bagaje",
    price: 4_290,
    summary:
      "Două cutii robuste pentru călătorii lungi, cu prinderi dedicate gamei Terran.",
    image: "/images/models/terran-900-rally.webp",
    imageAlt: "Set de cutii laterale montat pe VERIDIAN Terran 900 Rally",
    stockState: "in_stock",
    compatibility: ["Terran 650", "Terran 900 Rally"],
    featured: true,
  },
  {
    slug: "sa-comfort-touring",
    name: "Șa Comfort Touring",
    category: "Ergonomie",
    price: 1_190,
    summary:
      "Spumă cu densitate progresivă și profil adaptat pentru zile lungi în șa.",
    image: "/images/models/meridian-900-gt.webp",
    imageAlt: "Șa Comfort Touring pentru modelele VERIDIAN",
    stockState: "low_stock",
    compatibility: ["Terran 650", "Terran 900 Rally", "Meridian 900 GT"],
    featured: true,
  },
  {
    slug: "bare-protectie-motor",
    name: "Bare protecție motor",
    category: "Protecție",
    price: 1_490,
    summary:
      "Protecție tubulară dedicată, finisată pentru a completa cadrul motocicletei.",
    image: "/images/models/terran-650.webp",
    imageAlt: "Bare de protecție montate pe VERIDIAN Terran 650",
    stockState: "in_stock",
    compatibility: ["Terran 650", "Terran 900 Rally"],
    featured: false,
  },
  {
    slug: "suport-telefon-navigatie",
    name: "Suport telefon & navigație",
    category: "Tehnologie",
    price: 490,
    summary:
      "Prindere antivibrații, poziționată în câmpul vizual și pregătită pentru alimentare USB-C.",
    image: "/images/models/rift-700.webp",
    imageAlt: "Suport de navigație pe ghidonul unei motociclete VERIDIAN",
    stockState: "in_stock",
    compatibility: [
      "Terran 650",
      "Terran 900 Rally",
      "Rift 700",
      "Meridian 900 GT",
    ],
    featured: false,
  },
  {
    slug: "top-case-42l",
    name: "Top case 42 L",
    category: "Bagaje",
    price: 1_890,
    summary:
      "Spațiu pentru o cască integrală, închidere cu aceeași cheie și placă dedicată.",
    image: "/images/models/meridian-900-gt.webp",
    imageAlt: "Top case de 42 litri montat pe VERIDIAN Meridian 900 GT",
    stockState: "preorder",
    compatibility: ["Terran 650", "Terran 900 Rally", "Meridian 900 GT"],
    featured: false,
  },
  {
    slug: "stand-paddock-spate",
    name: "Stand paddock spate",
    category: "Atelier",
    price: 690,
    summary:
      "Stand stabil pentru mentenanță și depozitare, cu role și adaptoare incluse.",
    image: "/images/models/apex-675-r.webp",
    imageAlt: "VERIDIAN Apex 675 R ridicat pe stand paddock",
    stockState: "in_stock",
    compatibility: ["Apex 675 R", "Apex 900 RR", "Rift 700", "Foundry 800"],
    featured: false,
  },
];

export const accessoryStockLabels = {
  in_stock: "În stoc",
  low_stock: "Stoc redus",
  preorder: "Precomandă",
  unavailable: "Indisponibil",
} as const;

export type AccessoryFilters = {
  category?: string;
  stock?: string;
  sort?: string;
};

export function filterAccessories(
  filters: AccessoryFilters,
  source: readonly PublicAccessoryDTO[] = demoAccessories,
) {
  return source
    .filter(
      (item) =>
        (!filters.category ||
          filters.category === "toate" ||
          item.category === filters.category) &&
        (!filters.stock ||
          filters.stock === "toate" ||
          item.stockState === filters.stock),
    )
    .toSorted((a, b) => {
      if (filters.sort === "price-desc") return b.price - a.price;
      if (filters.sort === "name") return a.name.localeCompare(b.name, "ro-RO");
      return a.price - b.price;
    });
}
