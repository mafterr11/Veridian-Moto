import type { PublicAccessoryDTO } from "@/data/dto/public-accessory";

export const demoAccessories: readonly PublicAccessoryDTO[] = [
  {
    slug: "set-cutii-laterale-aluminium",
    name: "Set cutii laterale aluminium",
    category: "Bagaje",
    price: 4_390,
    summary:
      "Două cutii de 37 L din aluminiu periat, cu închidere comună și prinderi dedicate gamei Terran.",
    image: "/images/accessories/set-cutii-laterale-aluminium.webp",
    imageAlt:
      "Set VERIDIAN de două cutii laterale din aluminiu cu protecții negre",
    stockState: "in_stock",
    compatibility: ["Terran 650", "Terran 900 Rally"],
    featured: true,
  },
  {
    slug: "sa-comfort-touring",
    name: "Șa Comfort Touring",
    category: "Ergonomie",
    price: 1_290,
    summary:
      "Spumă cu densitate progresivă, material antiderapant și profil gândit pentru zile lungi în șa.",
    image: "/images/accessories/sa-comfort-touring.webp",
    imageAlt: "Șa VERIDIAN Comfort Touring neagră cu cusături verzi discrete",
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
      "Structură tubulară din oțel, cu puncte de prindere dedicate și finisaj negru rezistent la impact.",
    image: "/images/accessories/bare-protectie-motor.webp",
    imageAlt:
      "Set VERIDIAN de bare negre pentru protecția motorului cu elemente de montaj",
    stockState: "in_stock",
    compatibility: ["Terran 650", "Terran 900 Rally"],
    featured: false,
  },
  {
    slug: "suport-telefon-navigatie",
    name: "Suport telefon & navigație",
    category: "Tehnologie",
    price: 590,
    summary:
      "Prindere antivibrații din aluminiu, reglaj multiplu și alimentare USB-C protejată la intemperii.",
    image: "/images/accessories/suport-telefon-navigatie.webp",
    imageAlt:
      "Suport VERIDIAN negru pentru telefon și navigație cu braț articulat și cablu USB-C",
    stockState: "in_stock",
    compatibility: [
      "Terran 650",
      "Terran 900 Rally",
      "Apex 675 R",
      "Apex 900 RR",
      "Rift 700",
      "Meridian 900 GT",
      "Foundry 800",
      "Volt E2",
    ],
    featured: false,
  },
  {
    slug: "top-case-42l",
    name: "Top case 42 L",
    category: "Bagaje",
    price: 1_590,
    summary:
      "Spațiu pentru o cască integrală, capac ranforsat, placă dedicată și închidere cu aceeași cheie.",
    image: "/images/accessories/top-case-42l.webp",
    imageAlt:
      "Top case VERIDIAN de 42 de litri negru cu panou din aluminiu și placă de montaj",
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
      "Stand reglabil pentru mentenanță și depozitare, cu role și două tipuri de adaptoare incluse.",
    image: "/images/accessories/stand-paddock-spate.webp",
    imageAlt:
      "Stand paddock spate VERIDIAN negru cu role și adaptoare interschimbabile",
    stockState: "in_stock",
    compatibility: ["Apex 675 R", "Apex 900 RR", "Rift 700", "Foundry 800"],
    featured: false,
  },
  {
    slug: "mansoane-incalzite-touring",
    name: "Manșoane încălzite Touring",
    category: "Ergonomie",
    price: 590,
    summary:
      "Cinci trepte de temperatură, încălzire uniformă și control compact, utilizabil fără să iei mâna de pe ghidon.",
    image: "/images/accessories/mansoane-incalzite-touring.webp",
    imageAlt:
      "Pereche de manșoane încălzite VERIDIAN cu modul de control și cablaj",
    stockState: "in_stock",
    compatibility: [
      "Terran 650",
      "Terran 900 Rally",
      "Rift 700",
      "Meridian 900 GT",
      "Foundry 800",
    ],
    featured: false,
  },
  {
    slug: "proiectoare-led-adventure",
    name: "Kit proiectoare LED Adventure",
    category: "Tehnologie",
    price: 1_790,
    summary:
      "Două proiectoare compacte cu fascicul controlat, suporturi dedicate, releu și instalație completă.",
    image: "/images/accessories/proiectoare-led-adventure.webp",
    imageAlt:
      "Kit VERIDIAN cu două proiectoare LED rotunde, suporturi și cablaj complet",
    stockState: "low_stock",
    compatibility: ["Terran 650", "Terran 900 Rally"],
    featured: true,
  },
  {
    slug: "parbriz-touring-reglabil",
    name: "Parbriz Touring reglabil",
    category: "Ergonomie",
    price: 890,
    summary:
      "Policarbonat fumuriu rezistent la impact și reglaj rapid pe înălțime pentru protecție mai bună la drum lung.",
    image: "/images/accessories/parbriz-touring-reglabil.webp",
    imageAlt:
      "Parbriz Touring VERIDIAN fumuriu cu șine de reglaj și elemente de montaj",
    stockState: "in_stock",
    compatibility: ["Terran 650", "Terran 900 Rally", "Meridian 900 GT"],
    featured: false,
  },
  {
    slug: "geanta-rezervor-12l",
    name: "Geantă rezervor 12 L",
    category: "Bagaje",
    price: 790,
    summary:
      "Volum extensibil, prindere rapidă pe inel, husă de ploaie și buzunar superior pentru obiectele importante.",
    image: "/images/accessories/geanta-rezervor-12l.webp",
    imageAlt:
      "Geantă de rezervor VERIDIAN de 12 litri cu inel de prindere și husă de ploaie",
    stockState: "in_stock",
    compatibility: [
      "Terran 650",
      "Terran 900 Rally",
      "Rift 700",
      "Meridian 900 GT",
      "Foundry 800",
    ],
    featured: true,
  },
  {
    slug: "kit-reparatie-compresor",
    name: "Kit pană & compresor 12 V",
    category: "Atelier",
    price: 490,
    summary:
      "Compresor compact, manometru și unelte pentru repararea temporară a anvelopelor tubeless, într-o husă rigidă.",
    image: "/images/accessories/kit-reparatie-compresor.webp",
    imageAlt:
      "Kit VERIDIAN deschis cu compresor, manometru și unelte pentru repararea unei pene",
    stockState: "in_stock",
    compatibility: [
      "Terran 650",
      "Terran 900 Rally",
      "Apex 675 R",
      "Apex 900 RR",
      "Rift 700",
      "Meridian 900 GT",
      "Foundry 800",
      "Volt E2",
    ],
    featured: false,
  },
  {
    slug: "scut-motor-aluminiu",
    name: "Scut motor din aluminiu",
    category: "Protecție",
    price: 1_390,
    summary:
      "Aluminiu de 4 mm, zone ranforsate și deschideri pentru evacuarea noroiului, cu toate prinderile incluse.",
    image: "/images/accessories/scut-motor-aluminiu.webp",
    imageAlt:
      "Scut de motor VERIDIAN din aluminiu periat cu suporturi și elemente de montaj",
    stockState: "preorder",
    compatibility: ["Terran 650", "Terran 900 Rally"],
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
