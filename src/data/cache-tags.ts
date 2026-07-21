export const CACHE_TAGS = {
  publicCatalogue: "public:catalogue",
  publicModels: "public:models",
  publicAccessories: "public:accessories",
  publicInventory: "public:inventory",
  publicDiscover: "public:discover",
  siteSettings: "public:site-settings",
} as const;

export function modelCacheTag(slug: string) {
  return `public:model:${slug}`;
}

export function accessoryCacheTag(slug: string) {
  return `public:accessory:${slug}`;
}

export function discoverPostCacheTag(slug: string) {
  return `public:discover:${slug}`;
}
