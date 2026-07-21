import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatArticleDate } from "@/components/editorial/article-body";
import { PageIntro } from "@/components/marketing/page-intro";
import {
  getPublicArticles,
  getPublicDiscoverCategories,
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

  return (
    <section className="bg-porcelain text-obsidian py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="border-obsidian/15 mb-10 flex flex-wrap items-center gap-2 border-b pb-5">
          <Link
            href="/descopera"
            className={cn(
              "border px-4 py-2 text-xs font-bold uppercase",
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
                "border px-4 py-2 text-xs font-bold uppercase",
                category === item.slug
                  ? "border-veridian bg-veridian text-obsidian"
                  : "border-obsidian/15 hover:border-veridian-dark",
              )}
            >
              {item.name} · {item.articleCount}
            </Link>
          ))}
        </div>

        {filtered.length ? (
          <>
            <p className="text-steel mb-6 text-sm font-bold">
              {filtered.length}{" "}
              {filtered.length === 1 ? "articol găsit" : "articole găsite"}
            </p>
            <div className="grid gap-7 lg:grid-cols-2">
              {filtered.map((article, index) => (
                <article
                  key={article.slug}
                  className={cn(
                    "group",
                    index === 0 &&
                      "lg:col-span-2 lg:grid lg:grid-cols-[1.2fr_0.8fr]",
                  )}
                >
                  <Link
                    href={`/descopera/${article.slug}`}
                    className="contents"
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden",
                        index === 0
                          ? "min-h-80 lg:min-h-[30rem]"
                          : "aspect-[16/10]",
                      )}
                    >
                      <Image
                        src={article.image}
                        alt={article.imageAlt}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes={
                          index === 0
                            ? "(min-width: 1024px) 60vw, 100vw"
                            : "(min-width: 1024px) 50vw, 100vw"
                        }
                        className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
                      />
                    </div>
                    <div
                      className={cn(
                        index === 0
                          ? "bg-obsidian text-porcelain flex flex-col justify-center p-7 sm:p-10"
                          : "pt-5",
                      )}
                    >
                      <div
                        className={cn(
                          "flex gap-3 text-xs font-bold uppercase",
                          index === 0 ? "text-white/70" : "text-steel",
                        )}
                      >
                        <span
                          className={
                            index === 0 ? "text-veridian" : "text-veridian-dark"
                          }
                        >
                          {article.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={article.publishedAt.toISOString()}>
                          {formatArticleDate(article.publishedAt)}
                        </time>
                      </div>
                      <h2
                        className={cn(
                          "font-heading mt-4 leading-[1] font-extrabold uppercase",
                          index === 0
                            ? "text-4xl sm:text-6xl"
                            : "text-3xl sm:text-4xl",
                        )}
                      >
                        {article.title}
                      </h2>
                      <p
                        className={cn(
                          "mt-4 max-w-xl text-sm leading-6",
                          index === 0 ? "text-white/60" : "text-steel",
                        )}
                      >
                        {article.excerpt}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                        Citește articolul
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
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
