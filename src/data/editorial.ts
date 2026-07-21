export type DemoArticle = {
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  featured: boolean;
  bodyMarkdown: string;
  seoTitle?: string;
  seoDescription?: string;
};

export const articles: readonly DemoArticle[] = [
  {
    slug: "alegerea-motocicletei-adventure",
    category: "Ghiduri",
    categorySlug: "ghiduri",
    title: "Adventure sau touring: cum alegi fără să cumperi doar cu ochii",
    excerpt:
      "Poziție, greutate, roți și tipul de drum. Patru criterii mai utile decât dimensiunea parbrizului.",
    image: "/images/models/terran-650.webp",
    imageAlt: "VERIDIAN Terran 650 pe un drum montan",
    publishedAt: "2026-07-12T08:00:00.000Z",
    featured: true,
    bodyMarkdown: `## Începe cu drumurile reale

Cea mai bună motocicletă nu este cea care promite cele mai multe destinații, ci cea care se potrivește drumurilor pe care le faci cu adevărat. Notează proporția dintre oraș, autostradă, drum național și macadam înainte să compari fișe tehnice.

## Patru criterii care schimbă alegerea

- Greutatea simțită la viteze mici și cu bagaje
- Poziția genunchilor după două ore de mers
- Dimensiunea roții față și răspunsul pe asfalt
- Protecția la vânt în ritmul tău obișnuit

> O motocicletă potrivită îți cere mai puține compromisuri în fiecare weekend.

### Testul corect

Un test ride util include întoarceri strânse, o porțiune denivelată și cel puțin câteva minute la viteza de croazieră. Fotografia atrage atenția; ergonomia decide dacă mai vrei încă o sută de kilometri.`,
  },
  {
    slug: "abs-in-viraj",
    category: "Tehnologie",
    categorySlug: "tehnologie",
    title: "Ce face, de fapt, ABS-ul în viraj",
    excerpt:
      "De la senzori la intervenție: explicăm sistemul fără jargon de broșură.",
    image: "/images/models/apex-675-r.webp",
    imageAlt: "VERIDIAN Apex 675 R în viraj",
    publishedAt: "2026-07-04T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## Mai mult context pentru aceeași frână

ABS-ul convențional urmărește blocarea roții. Varianta sensibilă la înclinare folosește și datele unității inerțiale pentru a adapta presiunea când motocicleta nu rulează vertical.

- Nu anulează limitele aderenței
- Nu înlocuiește privirea și dozarea progresivă
- Poate păstra o rezervă de control într-o frânare neașteptată

## Ce simte pilotul

Pe asfalt bun, intervenția poate rămâne aproape invizibilă. Pe suprafețe reci sau murdare, maneta poate pulsa ușor în timp ce sistemul reduce și reaplică presiunea.`,
  },
  {
    slug: "trei-pasuri-meridian",
    category: "Povești",
    categorySlug: "povesti",
    title: "O zi, trei pasuri montane și un Meridian 900 GT",
    excerpt:
      "Un traseu lung cât să conteze și scurt cât să-l repeți weekendul viitor.",
    image: "/images/models/meridian-900-gt.webp",
    imageAlt: "VERIDIAN Meridian 900 GT pregătit de călătorie",
    publishedAt: "2026-06-28T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## Plecare înainte de răsărit

Am pus în cutiile laterale un strat impermeabil, apă și aparatul foto. Meridian 900 GT a intrat pe primul drum rapid înainte ca orașul să se trezească, cu pilotul automat setat conservator.

## Când drumul se strânge

Pe urcare, greutatea rămâne prezentă, dar distribuția ei nu cere luptă. Frâna de motor și răspunsul rotund permit un ritm calm, iar protecția la vânt își arată valoarea abia după câteva ore.

> Motocicleta de touring bună nu transformă drumul în canapea; elimină oboseala inutilă.

Ultimul pas a venit cu ploaie scurtă și asfalt lucios. Am ajuns înapoi cu suficientă energie pentru a începe deja traseul următor.`,
  },
  {
    slug: "naveta-electrica",
    category: "Ghiduri",
    categorySlug: "ghiduri",
    title: "Când are sens o motocicletă electrică în oraș",
    excerpt:
      "Autonomie, încărcare și costuri, calculate pentru o săptămână normală.",
    image: "/images/models/volt-e2.webp",
    imageAlt: "VERIDIAN Volt E2 într-un decor urban",
    publishedAt: "2026-06-16T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## Autonomie suficientă, nu maximă

O motocicletă electrică este convingătoare când autonomia promisă devine autonomie suficientă și încărcarea se potrivește rutinei tale. Calculează traseul săptămânal real și păstrează o rezervă pentru temperatură, vânt și ocoliri.

- Verifică accesul la o priză sigură, nu doar existența ei
- Compară timpul de încărcare cu intervalul în care motocicleta stă deja
- Include echipamentul de iarnă în estimarea consumului

## Unde nu este încă alegerea simplă

Excursiile spontane foarte lungi și parcarea fără acces la încărcare pot transforma economia de energie într-o problemă de program. Pentru naveta urbană previzibilă, liniștea și răspunsul instant schimbă însă experiența zilnică.`,
  },
  {
    slug: "foundry-design",
    category: "Povești",
    categorySlug: "povesti",
    title: "Cum desenezi o clasică fără să rămâi în trecut",
    excerpt:
      "Proporții familiare, ergonomie actuală și detalii care nu imită istoria.",
    image: "/images/models/foundry-800.webp",
    imageAlt: "Detaliu de design VERIDIAN Foundry 800",
    publishedAt: "2026-06-02T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## O siluetă familiară

Foundry 800 pornește de la rezervorul compact, șaua aproape dreaptă și motorul lăsat vizibil. Proporțiile sunt cunoscute, dar fiecare punct de contact aparține unei motociclete contemporane.

## Modern fără decor inutil

Iluminarea LED, injecția și instrumentarul digital nu sunt ascunse sub imitații. Materialele și muchiile lor sunt tratate calm, astfel încât tehnologia să nu concureze cu forma de bază.

> Respectul pentru trecut nu obligă designul să îl copieze.

Rezultatul trebuie să arate firesc peste zece ani, nu doar familiar în prima fotografie.`,
  },
  {
    slug: "quickshifter-ghid",
    category: "Tehnologie",
    categorySlug: "tehnologie",
    title: "Quickshifter: mai rapid, dar și mai lin",
    excerpt: "Cum funcționează și de ce este util și departe de circuit.",
    image: "/images/models/apex-900-rr.webp",
    imageAlt: "VERIDIAN Apex 900 RR în mișcare",
    publishedAt: "2026-05-21T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## O întrerupere măsurată în milisecunde

La urcare, senzorul din tijă detectează presiunea pilotului și reduce pentru foarte scurt timp cuplul motorului. Cutia poate trece în treapta următoare fără acționarea ambreiajului.

## Util și pe drum

Schimbarea fără ambreiaj nu este doar despre zecimi. Pe un drum lung, un sistem bine calibrat înseamnă mai puțin efort și mai multă fluiditate.

- Folosește o accelerație stabilă la urcare
- Nu forța schimbătorul la turații foarte joase
- Păstrează ambreiajul pentru manevre și situațiile în care transmisia cere finețe

Un quickshifter bun nu transformă fiecare drum în circuit. Face comenzile mai coerente atunci când ritmul crește.`,
  },
];

export function getDemoArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
