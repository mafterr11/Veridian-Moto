import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";

import {
  ArticleBody,
  formatArticleDate,
} from "@/components/editorial/article-body";
import { getPublicArticle } from "@/data/queries/public-editorial";
import { env } from "@/env";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const article = await getPublicArticle((await params).slug);
  return article
    ? {
        title: article.seoTitle ?? article.title,
        description: article.seoDescription ?? article.excerpt,
        alternates: { canonical: `/descopera/${article.slug}` },
        openGraph: {
          type: "article",
          title: article.seoTitle ?? article.title,
          description: article.seoDescription ?? article.excerpt,
          publishedTime: article.publishedAt.toISOString(),
          modifiedTime: article.updatedAt.toISOString(),
          images: [{ url: article.image, alt: article.imageAlt }],
        },
      }
    : {};
}

export default function ArticlePage({ params }: PageProps) {
  return <ArticleContent params={params} />;
}

async function ArticleContent({ params }: PageProps) {
  const article = await getPublicArticle((await params).slug);
  if (!article) notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "VERIDIAN Moto" },
    publisher: { "@type": "Organization", name: "VERIDIAN Moto" },
    mainEntityOfPage: `${env.NEXT_PUBLIC_APP_URL}/descopera/${article.slug}`,
  };

  return (
    <main className="bg-porcelain text-obsidian">
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />

        <header className="bg-obsidian text-porcelain overflow-hidden">
          <div className="mx-auto grid max-w-[1440px] lg:min-h-[42rem] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-between px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
              <Link
                href="/descopera"
                className="hover:text-veridian inline-flex w-fit items-center gap-2 text-sm font-bold text-white/65 transition-colors"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Înapoi la Descoperă
              </Link>

              <div className="mt-20 lg:mt-28">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold tracking-[0.16em] text-white/55 uppercase">
                  <span className="text-veridian">{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={article.publishedAt.toISOString()}>
                    {formatArticleDate(article.publishedAt)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {article.readingMinutes} min
                  </span>
                </div>
                <h1 className="font-heading mt-6 max-w-3xl text-5xl leading-[0.88] font-extrabold uppercase sm:text-7xl lg:text-[5.5rem]">
                  {article.title}
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                  {article.excerpt}
                </p>
              </div>
            </div>

            <figure className="relative min-h-[24rem] lg:min-h-full">
              <Image
                src={article.image}
                alt={article.imageAlt}
                fill
                priority
                loading="eager"
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/20 lg:via-transparent"
                aria-hidden="true"
              />
              <figcaption className="absolute right-5 bottom-5 left-5 text-right text-[0.65rem] font-bold tracking-[0.14em] text-white/70 uppercase sm:right-8 sm:bottom-7">
                {article.imageAlt}
              </figcaption>
            </figure>
          </div>
        </header>

        <ArticleBody markdown={article.bodyMarkdown} />

        <footer className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
          <div className="bg-obsidian text-porcelain grid gap-8 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-veridian text-xs font-bold tracking-[0.18em] uppercase">
                Din lectură, pe șosea
              </p>
              <h2 className="font-heading mt-3 max-w-2xl text-4xl leading-[0.95] font-extrabold uppercase sm:text-5xl">
                Găsește motocicleta care se potrivește drumului tău.
              </h2>
            </div>
            <Link
              href="/modele"
              className="bg-veridian text-obsidian hover:bg-veridian-light inline-flex w-fit items-center gap-3 px-6 py-4 text-sm font-extrabold uppercase transition-colors"
            >
              Vezi modelele
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
