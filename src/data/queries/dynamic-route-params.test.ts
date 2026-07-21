import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({
  getDatabase: vi.fn(() => {
    throw new Error("A generic dynamic route must not access the database.");
  }),
  isDatabaseConfigured: vi.fn(() => true),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock("@/db/client", () => databaseMocks);

import { getPublicConfiguration } from "@/data/queries/public-configurations";
import { getPublicConfigurator } from "@/data/queries/public-configurator";
import { getPublicArticle } from "@/data/queries/public-editorial";
import { getPublicModel } from "@/data/queries/public-models";

describe("generic dynamic-route prerenders", () => {
  beforeEach(() => {
    databaseMocks.getDatabase.mockClear();
    databaseMocks.isDatabaseConfigured.mockClear();
  });

  it.each([
    ["model", () => getPublicModel(undefined)],
    ["article", () => getPublicArticle(undefined)],
    ["configurator", () => getPublicConfigurator(undefined)],
    ["saved configuration", () => getPublicConfiguration(undefined)],
  ])(
    "does not query PostgreSQL for a missing %s parameter",
    async (_, load) => {
      await expect(load()).resolves.toBeUndefined();
      expect(databaseMocks.getDatabase).not.toHaveBeenCalled();
    },
  );
});
