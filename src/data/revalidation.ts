import "server-only";

import { revalidateTag } from "next/cache";

import {
  accessoryCacheTag,
  CACHE_TAGS,
  discoverPostCacheTag,
  modelCacheTag,
} from "@/data/cache-tags";

export function revalidateModelCatalogue(slug?: string) {
  revalidateTag(CACHE_TAGS.publicCatalogue, "max");
  revalidateTag(CACHE_TAGS.publicModels, "max");
  revalidateTag(CACHE_TAGS.publicInventory, "max");

  if (slug) {
    revalidateTag(modelCacheTag(slug), "max");
  }
}

export function revalidateAccessoryCatalogue(slug?: string) {
  revalidateTag(CACHE_TAGS.publicCatalogue, "max");
  revalidateTag(CACHE_TAGS.publicAccessories, "max");

  if (slug) {
    revalidateTag(accessoryCacheTag(slug), "max");
  }
}

export function revalidateDiscoverContent(slug?: string) {
  revalidateTag(CACHE_TAGS.publicDiscover, "max");

  if (slug) {
    revalidateTag(discoverPostCacheTag(slug), "max");
  }
}
