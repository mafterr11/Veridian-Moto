import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
        <header className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/descopera"
            className="text-steel hover:text-veridian-dark inline-flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Înapoi la Descoperă
          </Link>
          <p className="text-veridian-dark mt-12 text-xs font-bold tracking-[0.18em] uppercase">
            {article.category} · {formatArticleDate(article.publishedAt)}
          </p>
          <h1 className="font-heading mt-4 text-5xl leading-[0.9] font-extrabold uppercase sm:text-7xl lg:text-8xl">
            {article.title}
          </h1>
          <p className="text-steel mt-7 max-w-3xl text-lg leading-8">
            {article.excerpt}
          </p>
        </header>
        <div className="relative mx-auto aspect-[16/8] max-w-[1440px] overflow-hidden">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <ArticleBody markdown={article.bodyMarkdown} />
      </article>
    </main>
  );
}
