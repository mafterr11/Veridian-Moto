import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";

import { formatArticleDate } from "@/components/editorial/article-body";
import { PageIntro } from "@/components/marketing/page-intro";
import {
  getPublicArticles,
  getPublicDiscoverCategories,
  type PublicArticleSummary,
} from "@/data/queries/public-editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Descoperă",
  description:
    "Povești, ghiduri și tehnologie explicată direct de VERIDIAN Moto.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function DiscoverPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main>
      <PageIntro
        eyebrow="Descoperă VERIDIAN"
        title="Drumul începe înainte de pornire."
        description="Ghiduri oneste, tehnologie explicată clar și povești despre motociclete folosite așa cum au fost gândite."
      />
      <DiscoverContent searchParams={searchParams} />
    </main>
  );
}

async function DiscoverContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const articles = await getPublicArticles();
  const categories = await getPublicDiscoverCategories(articles);
  const params = await searchParams;
  const rawCategory = params.category;
  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
  const filtered = category
    ? articles.filter((article) => article.categorySlug === category)
    : articles;
  const [leadArticle, ...remainingArticles] = filtered;

  return (
    <section className="bg-porcelain text-obsidian py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="border-obsidian/15 mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-veridian-dark text-xs font-bold tracking-[0.18em] uppercase">
              Jurnal VERIDIAN
            </p>
            <h2 className="font-heading mt-2 text-4xl font-extrabold uppercase sm:text-5xl">
              Idei pentru drumul următor
            </h2>
          </div>
          <div className="text-steel flex items-center gap-2 text-sm font-bold">
            <BookOpen
              className="text-veridian-dark size-4"
              aria-hidden="true"
            />
            {articles.length} ediții publicate
          </div>
        </div>

        <nav
          className="mb-12 flex flex-wrap items-center gap-2"
          aria-label="Filtrează articolele după categorie"
        >
          <Link
            href="/descopera"
            className={cn(
              "border px-4 py-2.5 text-xs font-bold uppercase transition-colors",
              !category
                ? "border-veridian bg-veridian text-obsidian"
                : "border-obsidian/15 hover:border-veridian-dark",
            )}
          >
            Toate · {articles.length}
          </Link>
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/descopera?category=${item.slug}`}
              className={cn(
                "border px-4 py-2.5 text-xs font-bold uppercase transition-colors",
                category === item.slug
                  ? "border-veridian bg-veridian text-obsidian"
                  : "border-obsidian/15 hover:border-veridian-dark",
              )}
            >
              {item.name} · {item.articleCount}
            </Link>
          ))}
        </nav>

        {leadArticle ? (
          <>
            <FeaturedArticle article={leadArticle} />

            {remainingArticles.length > 0 ? (
              <div className="mt-16">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <h2 className="font-heading text-3xl font-extrabold uppercase sm:text-4xl">
                    Mai multe din jurnal
                  </h2>
                  <span
                    className="bg-obsidian/15 h-px flex-1"
                    aria-hidden="true"
                  />
                </div>
                <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
                  {remainingArticles.map((article, index) => (
                    <ArticleCard
                      key={article.slug}
                      article={article}
                      index={index + 2}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="border-obsidian/20 border border-dashed px-6 py-20 text-center">
            <h2 className="font-heading text-4xl font-extrabold uppercase">
              Niciun articol publicat
            </h2>
            <p className="text-steel mt-3">
              Alege altă categorie sau revino după următoarea poveste.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedArticle({ article }: { article: PublicArticleSummary }) {
  return (
    <article className="group bg-obsidian text-porcelain overflow-hidden">
      <Link
        href={`/descopera/${article.slug}`}
        className="grid lg:min-h-[34rem] lg:grid-cols-[1.18fr_0.82fr]"
      >
        <div className="relative min-h-[22rem] overflow-hidden lg:min-h-full">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            loading="eager"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
          />
          <span className="bg-veridian text-obsidian absolute top-5 left-5 px-3 py-2 text-[0.65rem] font-extrabold tracking-[0.16em] uppercase">
            Selecția editorului
          </span>
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <ArticleMeta article={article} inverse />
          <h2 className="font-heading mt-5 text-4xl leading-[0.93] font-extrabold uppercase sm:text-6xl">
            {article.title}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            {article.excerpt}
          </p>
          <span className="text-veridian mt-9 inline-flex items-center gap-3 text-sm font-extrabold uppercase">
            Citește povestea
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}

function ArticleCard({
  article,
  index,
}: {
  article: PublicArticleSummary;
  index: number;
}) {
  return (
    <article className="group border-obsidian/15 border-t pt-4">
      <Link href={`/descopera/${article.slug}`}>
        <div className="text-steel mb-4 flex items-center justify-between text-xs font-bold">
          <span className="tabular-nums">{String(index).padStart(2, "0")}</span>
          <span className="text-veridian-dark uppercase">
            {article.category}
          </span>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
          />
        </div>
        <ArticleMeta article={article} />
        <h3 className="font-heading mt-3 text-3xl leading-[0.98] font-extrabold uppercase sm:text-4xl">
          {article.title}
        </h3>
        <p className="text-steel mt-4 text-sm leading-6">{article.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold">
          Citește articolul
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </Link>
    </article>
  );
}

function ArticleMeta({
  article,
  inverse = false,
}: {
  article: PublicArticleSummary;
  inverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase",
        inverse ? "text-white/55" : "text-steel",
      )}
    >
      <time dateTime={article.publishedAt.toISOString()}>
        {formatArticleDate(article.publishedAt)}
      </time>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="size-3.5" aria-hidden="true" />
        {article.readingMinutes} min
      </span>
    </div>
  );
}
