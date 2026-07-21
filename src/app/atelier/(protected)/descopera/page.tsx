import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";

import {
  archiveDiscoverPostAction,
  saveDiscoverCategoryAction,
  saveDiscoverPostAction,
  uploadDiscoverCoverAction,
} from "@/app/atelier/(protected)/descopera/actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminCheckbox, AdminField } from "@/components/admin/form-field";
import { AdminPageHeader, AdminSection } from "@/components/admin/page-header";
import {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getAdminEditorialWorkspace } from "@/data/queries/admin-editorial";

export const metadata: Metadata = { title: "Descoperă" };

export default function AdminDiscoverPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Editorial"
        title="Descoperă"
        description="Creează ghiduri și povești, programează publicarea, verifică previzualizarea și păstrează materialele vechi prin arhivare."
      />
      <Suspense fallback={<p className="mt-10 text-sm">Se încarcă…</p>}>
        <EditorialWorkspace />
      </Suspense>
    </main>
  );
}

async function EditorialWorkspace() {
  const workspace = await getAdminEditorialWorkspace();
  return (
    <div className="mt-10 grid gap-8">
      <AdminSection
        title="Categorii editoriale"
        description="Slugurile devin filtre publice în pagina Descoperă."
      >
        <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
          <DiscoverCategoryForm prefix="new-discover-category" />
          {workspace.categories.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {workspace.categories.map((category) => (
                <details
                  key={category.id}
                  className="border-obsidian/15 border"
                >
                  <summary className="cursor-pointer list-none p-3">
                    <strong>{category.name}</strong>
                    <p className="text-steel mt-1 text-xs">/{category.slug}</p>
                  </summary>
                  <div className="border-obsidian/10 border-t p-3">
                    <DiscoverCategoryForm
                      prefix={category.id}
                      value={category}
                    />
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <AdminEmptyState>
              Creează prima categorie editorială.
            </AdminEmptyState>
          )}
        </div>
      </AdminSection>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
        <AdminSection title="Articol nou">
          {workspace.categories.length ? (
            <DiscoverPostForm
              categories={workspace.categories}
              mediaLibrary={workspace.mediaLibrary}
            />
          ) : (
            <AdminEmptyState>Creează mai întâi o categorie.</AdminEmptyState>
          )}
        </AdminSection>

        <AdminSection
          title="Articole existente"
          description={`${workspace.posts.length} înregistrări`}
        >
          {workspace.posts.length ? (
            <div className="grid gap-3">
              {workspace.posts.map((post) => (
                <details key={post.id} className="border-obsidian/15 border">
                  <summary className="cursor-pointer list-none p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusBadge
                        status={
                          post.status === "published" &&
                          post.publishedAt &&
                          post.publishedAt > new Date()
                            ? "scheduled"
                            : post.status
                        }
                      />
                      {post.featured && <AdminStatusBadge status="featured" />}
                      <strong>{post.title}</strong>
                    </div>
                    <p className="text-steel mt-2 text-xs">
                      {post.categoryName} · /{post.slug}
                    </p>
                  </summary>
                  <div className="border-obsidian/10 border-t p-4">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/atelier/descopera/${post.id}/previzualizare`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-veridian-dark inline-flex items-center gap-2 text-sm font-bold"
                      >
                        Previzualizează <ExternalLink className="size-4" />
                      </Link>
                      {post.status === "published" &&
                        post.publishedAt &&
                        post.publishedAt <= new Date() && (
                          <Link
                            href={`/descopera/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold"
                          >
                            Deschide public
                          </Link>
                        )}
                    </div>
                    <DiscoverPostForm
                      categories={workspace.categories}
                      mediaLibrary={workspace.mediaLibrary}
                      post={post}
                    />
                    <DiscoverCoverUpload postId={post.id} />
                    {post.status !== "archived" && (
                      <AdminActionForm
                        action={archiveDiscoverPostAction.bind(null, post.id)}
                        submitLabel="Arhivează articolul"
                        buttonVariant="destructive"
                        className="border-obsidian/10 mt-6 border-t pt-5"
                      />
                    )}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <AdminEmptyState>Nu există articole.</AdminEmptyState>
          )}
        </AdminSection>
      </div>
    </div>
  );
}

function DiscoverCategoryForm({
  prefix,
  value,
}: {
  prefix: string;
  value?: { id: string; name: string; slug: string; sortOrder: number };
}) {
  return (
    <AdminActionForm
      action={saveDiscoverCategoryAction}
      submitLabel={value ? "Actualizează categoria" : "Creează categoria"}
    >
      {value && <input type="hidden" name="id" value={value.id} />}
      <AdminField label="Nume" htmlFor={`${prefix}-name`}>
        <Input
          id={`${prefix}-name`}
          name="name"
          defaultValue={value?.name}
          required
        />
      </AdminField>
      <AdminField label="Slug" htmlFor={`${prefix}-slug`}>
        <Input
          id={`${prefix}-slug`}
          name="slug"
          defaultValue={value?.slug}
          required
        />
      </AdminField>
      <AdminField label="Ordine" htmlFor={`${prefix}-sort`}>
        <Input
          id={`${prefix}-sort`}
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={value?.sortOrder ?? 0}
          required
        />
      </AdminField>
    </AdminActionForm>
  );
}

type EditorialCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

type EditorialMedia = {
  id: string;
  storagePath: string;
  altText: string;
};

type EditorialPost = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  coverMediaId: string | null;
  coverPath: string | null;
  coverAlt: string | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

function DiscoverPostForm({
  categories,
  mediaLibrary,
  post,
}: {
  categories: readonly EditorialCategory[];
  mediaLibrary: readonly EditorialMedia[];
  post?: EditorialPost;
}) {
  const prefix = post?.id ?? "new-post";
  return (
    <AdminActionForm
      action={saveDiscoverPostAction}
      submitLabel={post ? "Actualizează articolul" : "Creează articolul"}
    >
      {post && <input type="hidden" name="id" value={post.id} />}
      {post?.coverPath && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverPath}
          alt={post.coverAlt ?? ""}
          className="aspect-[16/7] w-full object-cover"
        />
      )}
      <AdminField label="Categorie" htmlFor={`${prefix}-category`}>
        <NativeSelect
          id={`${prefix}-category`}
          name="categoryId"
          defaultValue={post?.categoryId ?? categories[0]?.id}
          className="w-full"
          required
        >
          {categories.map((category) => (
            <NativeSelectOption key={category.id} value={category.id}>
              {category.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Titlu" htmlFor={`${prefix}-title`}>
          <Input
            id={`${prefix}-title`}
            name="title"
            defaultValue={post?.title}
            required
          />
        </AdminField>
        <AdminField label="Slug" htmlFor={`${prefix}-slug`}>
          <Input
            id={`${prefix}-slug`}
            name="slug"
            defaultValue={post?.slug}
            required
          />
        </AdminField>
      </div>
      <AdminField label="Rezumat pentru card" htmlFor={`${prefix}-excerpt`}>
        <Textarea
          id={`${prefix}-excerpt`}
          name="excerpt"
          rows={4}
          defaultValue={post?.excerpt}
          required
        />
      </AdminField>
      <AdminField
        label="Conținut"
        htmlFor={`${prefix}-body`}
        hint="Structură sigură: ## subtitlu, ### subtitlu mic, - listă și > citat. HTML-ul este eliminat."
      >
        <Textarea
          id={`${prefix}-body`}
          name="bodyMarkdown"
          rows={16}
          defaultValue={post?.bodyMarkdown}
          className="font-mono text-xs leading-6"
          required
        />
      </AdminField>
      <AdminField
        label="Copertă din biblioteca media"
        htmlFor={`${prefix}-cover`}
        hint="Coperta este obligatorie pentru publicare. Poți încărca una nouă după crearea draftului."
      >
        <NativeSelect
          id={`${prefix}-cover`}
          name="coverMediaId"
          defaultValue={post?.coverMediaId ?? ""}
          className="w-full"
        >
          <NativeSelectOption value="">Fără copertă</NativeSelectOption>
          {mediaLibrary.map((media) => (
            <NativeSelectOption key={media.id} value={media.id}>
              {media.altText}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Stare" htmlFor={`${prefix}-status`}>
          <NativeSelect
            id={`${prefix}-status`}
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="w-full"
          >
            <NativeSelectOption value="draft">Draft</NativeSelectOption>
            <NativeSelectOption value="published">
              Publicat / programat
            </NativeSelectOption>
            <NativeSelectOption value="archived">Arhivat</NativeSelectOption>
          </NativeSelect>
        </AdminField>
        <AdminField
          label="Publicare (UTC)"
          htmlFor={`${prefix}-published`}
          hint="Lasă gol pentru publicare imediată când alegi starea Publicat."
        >
          <Input
            id={`${prefix}-published`}
            name="publishedAt"
            type="datetime-local"
            defaultValue={
              post?.publishedAt
                ? post.publishedAt.toISOString().slice(0, 16)
                : undefined
            }
          />
        </AdminField>
      </div>
      <AdminCheckbox
        id={`${prefix}-featured`}
        name="featured"
        label="Articol principal"
        description="Articolul apare primul în lista publică."
        defaultChecked={post?.featured}
      />
      <div className="border-obsidian/10 grid gap-4 border-t pt-5">
        <AdminField
          label="Titlu SEO (opțional)"
          htmlFor={`${prefix}-seo-title`}
        >
          <Input
            id={`${prefix}-seo-title`}
            name="seoTitle"
            maxLength={70}
            defaultValue={post?.seoTitle ?? ""}
          />
        </AdminField>
        <AdminField
          label="Descriere SEO (opțional)"
          htmlFor={`${prefix}-seo-description`}
        >
          <Textarea
            id={`${prefix}-seo-description`}
            name="seoDescription"
            rows={3}
            maxLength={170}
            defaultValue={post?.seoDescription ?? ""}
          />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

function DiscoverCoverUpload({ postId }: { postId: string }) {
  return (
    <details className="border-veridian-dark/30 mt-6 border">
      <summary className="text-veridian-dark cursor-pointer list-none p-3 text-sm font-bold">
        Încarcă o copertă nouă
      </summary>
      <div className="border-veridian-dark/20 border-t p-3">
        <AdminActionForm
          action={uploadDiscoverCoverAction}
          submitLabel="Optimizează și folosește coperta"
        >
          <input type="hidden" name="postId" value={postId} />
          <AdminField label="Fișier" htmlFor={`${postId}-cover-file`}>
            <Input
              id={`${postId}-cover-file`}
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
            />
          </AdminField>
          <AdminField label="Text alternativ" htmlFor={`${postId}-cover-alt`}>
            <Input
              id={`${postId}-cover-alt`}
              name="altText"
              minLength={5}
              maxLength={500}
              required
            />
          </AdminField>
        </AdminActionForm>
      </div>
    </details>
  );
}
