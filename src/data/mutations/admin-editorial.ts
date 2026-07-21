import "server-only";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { discoverCategories, discoverPosts, mediaAssets } from "@/db/schema";
import { assertAdmin } from "@/data/auth/admin-session";
import { AdminMutationError } from "@/data/mutations/admin-catalogue";
import { revalidateDiscoverContent } from "@/data/revalidation";
import type {
  discoverCategorySchema,
  discoverPostSchema,
} from "@/domain/admin/schemas";
import type { z } from "zod";

type DiscoverCategoryInput = z.infer<typeof discoverCategorySchema>;
type DiscoverPostInput = z.infer<typeof discoverPostSchema>;

function editorialDatabaseError(error: unknown, fallback: string): never {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : undefined;
  if (code === "23505") {
    throw new AdminMutationError(
      "Există deja o categorie sau un articol cu același slug.",
    );
  }
  if (error instanceof AdminMutationError) throw error;
  throw new AdminMutationError(fallback);
}

export async function saveDiscoverCategory(input: DiscoverCategoryInput) {
  await assertAdmin();
  try {
    if (input.id) {
      const [updated] = await getDatabase()
        .update(discoverCategories)
        .set({
          name: input.name,
          slug: input.slug,
          sortOrder: input.sortOrder,
        })
        .where(eq(discoverCategories.id, input.id))
        .returning({ id: discoverCategories.id });
      if (!updated) throw new AdminMutationError("Categoria nu mai există.");
    } else {
      await getDatabase().insert(discoverCategories).values(input);
    }
    revalidateDiscoverContent();
  } catch (error) {
    editorialDatabaseError(
      error,
      "Categoria editorială nu a putut fi salvată.",
    );
  }
}

export async function saveDiscoverPost(input: DiscoverPostInput) {
  await assertAdmin();
  let previousSlug: string | undefined;
  let storedSlug = input.slug;

  try {
    await getDatabase().transaction(async (tx) => {
      const [category] = await tx
        .select({ id: discoverCategories.id })
        .from(discoverCategories)
        .where(eq(discoverCategories.id, input.categoryId))
        .limit(1);
      if (!category) throw new AdminMutationError("Categoria nu mai există.");

      if (input.coverMediaId) {
        const [cover] = await tx
          .select({ id: mediaAssets.id })
          .from(mediaAssets)
          .where(eq(mediaAssets.id, input.coverMediaId))
          .limit(1);
        if (!cover)
          throw new AdminMutationError("Imaginea de copertă nu mai există.");
      }

      let existingPublishedAt: Date | null = null;
      if (input.id) {
        const [existing] = await tx
          .select({
            slug: discoverPosts.slug,
            publishedAt: discoverPosts.publishedAt,
          })
          .from(discoverPosts)
          .where(eq(discoverPosts.id, input.id))
          .limit(1);
        if (!existing) throw new AdminMutationError("Articolul nu mai există.");
        previousSlug = existing.slug;
        existingPublishedAt = existing.publishedAt;
      }

      const values = {
        categoryId: input.categoryId,
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        bodyMarkdown: input.bodyMarkdown,
        coverMediaId: input.coverMediaId,
        featured: input.featured,
        status: input.status,
        publishedAt:
          input.status === "published"
            ? (input.publishedAt ?? existingPublishedAt ?? new Date())
            : input.publishedAt,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        updatedAt: new Date(),
      };

      if (input.id) {
        await tx
          .update(discoverPosts)
          .set(values)
          .where(eq(discoverPosts.id, input.id));
      } else {
        const [created] = await tx
          .insert(discoverPosts)
          .values(values)
          .returning({ slug: discoverPosts.slug });
        storedSlug = created.slug;
      }
    });
  } catch (error) {
    editorialDatabaseError(error, "Articolul nu a putut fi salvat.");
  }

  revalidateDiscoverContent(previousSlug);
  if (storedSlug !== previousSlug) revalidateDiscoverContent(storedSlug);
}

export async function archiveDiscoverPost(id: string) {
  await assertAdmin();
  const [updated] = await getDatabase()
    .update(discoverPosts)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(discoverPosts.id, id))
    .returning({ slug: discoverPosts.slug });
  if (!updated) throw new AdminMutationError("Articolul nu mai există.");
  revalidateDiscoverContent(updated.slug);
}
