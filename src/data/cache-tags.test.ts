import { describe, expect, it } from "vitest";

import {
  accessoryCacheTag,
  CACHE_TAGS,
  discoverPostCacheTag,
  modelCacheTag,
} from "@/data/cache-tags";

describe("cache tag conventions", () => {
  it("keeps collection and entity tags in separate namespaces", () => {
    expect(CACHE_TAGS.publicModels).toBe("public:models");
    expect(modelCacheTag("terran-900-rally")).toBe(
      "public:model:terran-900-rally",
    );
    expect(accessoryCacheTag("topcase-38")).toBe("public:accessory:topcase-38");
    expect(discoverPostCacheTag("filosofia-veridian")).toBe(
      "public:discover:filosofia-veridian",
    );
  });
});
