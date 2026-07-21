import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { z } from "zod";

import { AdminDocumentLink } from "@/components/admin/admin-document-link";
import {
  ArticleBody,
  formatArticleDate,
} from "@/components/editorial/article-body";
import { getAdminPostPreview } from "@/data/queries/admin-editorial";

export const metadata: Metadata = { title: "Previzualizare articol" };

type PageProps = { params: Promise<{ id: string }> };

export default function EditorialPreviewPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="h-svh animate-pulse bg-white" />}>
      <EditorialPreviewContent params={params} />
    </Suspense>
  );
}

async function EditorialPreviewContent({ params }: PageProps) {
  const parsed = z
    .string()
    .uuid()
    .safeParse((await params).id);
  if (!parsed.success) notFound();
  const article = await getAdminPostPreview(parsed.data);
  if (!article) notFound();
  const date = article.publishedAt ?? article.updatedAt;

  return (
    <main className="bg-porcelain text-obsidian min-h-svh">
      <div className="bg-signal-amber text-obsidian flex flex-wrap items-center justify-between gap-4 px-5 py-3 text-sm font-bold sm:px-8">
        <span className="inline-flex items-center gap-2">
          <Eye className="size-4" /> Previzualizare protejată · {article.status}
        </span>
        <AdminDocumentLink
          href="/atelier/descopera"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="size-4" /> Înapoi la editor
        </AdminDocumentLink>
      </div>
      <article>
        <header className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-veridian-dark mt-8 text-xs font-bold tracking-[0.18em] uppercase">
            {article.category} · {formatArticleDate(date)}
          </p>
          <h1 className="font-heading mt-4 text-5xl leading-[0.9] font-extrabold uppercase sm:text-7xl lg:text-8xl">
            {article.title}
          </h1>
          <p className="text-steel mt-7 max-w-3xl text-lg leading-8">
            {article.excerpt}
          </p>
        </header>
        {article.image ? (
          <div className="relative mx-auto aspect-[16/8] max-w-[1440px] overflow-hidden">
            <Image
              src={article.image}
              alt={article.imageAlt ?? ""}
              fill
              priority
              loading="eager"
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="bg-obsidian/10 mx-auto grid aspect-[16/5] max-w-[1440px] place-items-center text-sm font-bold">
            Adaugă o copertă înainte de publicare
          </div>
        )}
        <ArticleBody markdown={article.bodyMarkdown} />
      </article>
    </main>
  );
}
