import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicPageArchetypes = [
  "/",
  "/modele",
  "/modele/terran-900-rally",
  "/accesorii",
  "/configurator",
  "/configurator/terran-900-rally",
  "/descopera",
  "/descopera/abs-in-viraj",
  "/contact",
  "/politica-de-confidentialitate",
] as const;

test("renders the VERIDIAN homepage and primary actions", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/VERIDIAN Moto/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Mai mult standard.*Mai mult drum/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Descoperă modelele" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Principală" }),
  ).toBeVisible();
});

test("closes the mobile menu so it never covers the page below", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menu = page.locator("header details");
  const trigger = page.getByLabel("Deschide meniul");

  await trigger.click();
  await expect(menu).toHaveJSProperty("open", true);

  await page
    .getByRole("navigation", { name: "Meniu mobil" })
    .getByRole("link", { name: "Configurează" })
    .click();
  await page.waitForURL("**/configurator");
  await expect(menu).toHaveJSProperty("open", false);

  // Reopening on the page the menu already links to still closes on a tap.
  await trigger.click();
  await expect(menu).toHaveJSProperty("open", true);
  await page
    .getByRole("navigation", { name: "Meniu mobil" })
    .getByRole("link", { name: /Modele/ })
    .click();
  await expect(menu).toHaveJSProperty("open", false);

  // A closed menu leaves the model cards tappable on the first attempt.
  await page.goto("/configurator");
  const firstModel = page.locator("a[href^='/configurator/']").first();
  await firstModel.click();
  await expect(page).toHaveURL(/\/configurator\/[a-z0-9-]+$/);
});

test("filters the model catalogue through the URL", async ({ page }) => {
  await page.goto("/modele?category=Adventure&availability=available");

  await expect(page.getByText("2 modele găsite")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Terran 650" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Terran 900 Rally" }),
  ).toBeVisible();
});

test("renders public inventory without private stock fields", async ({
  page,
}) => {
  await page.goto("/modele/terran-900-rally");

  await expect(
    page.getByRole("heading", {
      name: "Unități reale pentru Terran 900 Rally",
    }),
  ).toBeVisible();
  await expect(page.getByText(/cod TERRAN-900-RALLY-001/i)).toBeVisible();
  await expect(
    page.locator('script[type="application/ld+json"]'),
  ).not.toHaveCount(0);
  await expect(page.getByText(/VIN-ul și notele interne/i)).toBeVisible();
});

test("filters the published accessory catalogue", async ({ page }) => {
  await page.goto("/accesorii?category=Bagaje&stock=in_stock");

  await expect(page.getByText("2 accesorii găsite")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Set cutii laterale aluminium" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Geantă rezervor 12 L" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Top case 42 L" }),
  ).toHaveCount(0);
});

test("renders the complete accessory collection with dedicated images", async ({
  page,
}) => {
  await page.goto("/accesorii");

  await expect(page.getByText("12 accesorii găsite")).toBeVisible();
  await expect(page.locator("main article img")).toHaveCount(12);
});

test("filters and opens published editorial content", async ({ page }) => {
  await page.goto("/descopera?category=tehnologie");

  await expect(
    page.getByRole("heading", { name: "Mai multe din jurnal" }),
  ).toBeVisible();
  await page
    .getByRole("heading", { name: "Ce face, de fapt, ABS-ul în viraj" })
    .click();
  await expect(page).toHaveURL(/\/descopera\/abs-in-viraj$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Ce face, de fapt, ABS-ul în viraj",
    }),
  ).toBeVisible();
  await expect(
    page.locator('script[type="application/ld+json"]'),
  ).not.toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Cuprinsul articolului" }),
  ).toBeVisible();
});

test("shows the centrally managed contact fallback", async ({ page }) => {
  await page.goto("/contact");

  const main = page.locator("main");
  await expect(main.getByText("salut@veridian-moto.ro")).toBeVisible();
  await expect(main.getByText("+40 312 345 678")).toBeVisible();
  await expect(main.getByText(/Strada Atelierului 24/)).toBeVisible();
});

test("exposes hardened response headers and keeps Atelier private", async ({
  request,
}) => {
  const publicResponse = await request.get("/");
  expect(publicResponse.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(publicResponse.headers()["x-content-type-options"]).toBe("nosniff");
  expect(publicResponse.headers()["x-frame-options"]).toBe("DENY");

  const atelierResponse = await request.get("/atelier", { maxRedirects: 0 });
  expect(atelierResponse.status()).toBe(307);
  expect(atelierResponse.headers()["cache-control"]).toContain("no-store");
  expect(atelierResponse.headers()["x-robots-tag"]).toContain("noindex");
});

test("renders a useful not-found state", async ({ page }) => {
  const response = await page.goto("/drum-inexistent");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Drumul acesta nu apare pe hartă." }),
  ).toBeVisible();
});

test("supports keyboard skip navigation", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Sari la conținut" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#continut")).toBeFocused();
});

test("eager-loads image LCP candidates across public page archetypes", async ({
  context,
}) => {
  for (const route of publicPageArchetypes) {
    const page = await context.newPage();
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.text().includes("Largest Contentful Paint (LCP)")) {
        warnings.push(message.text());
      }
    });

    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto(route);
    // Next's development-only image observer reports after the LCP entry is
    // finalized, so allow that observer one short quiet window before closing.
    await page.waitForTimeout(500);
    expect(warnings, `Lazy LCP image on ${route}`).toEqual([]);
    await page.close();
  }
});

test("has no serious automated accessibility violations across public page archetypes", async ({
  page,
}) => {
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of publicPageArchetypes) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const materialViolations = results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      );
      expect(
        materialViolations,
        `Accessibility violations on ${route} at ${width}px`,
      ).toEqual([]);
    }
  }
});

test("avoids horizontal overflow at supported responsive widths", async ({
  page,
}) => {
  for (const route of publicPageArchetypes) {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.content,
        `Horizontal overflow on ${route} at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.viewport);
    }
  }
});

test("configures the Terran 900 Rally with rule feedback", async ({ page }) => {
  await page.goto("/configurator/terran-900-rally");

  await page.getByRole("button", { name: /Glacier White/i }).click();
  await expect(
    page.getByAltText("VERIDIAN Terran 900 Rally în finisaj Glacier White"),
  ).toBeVisible();
  await expect(page.getByText(/50\.780/).first()).toBeVisible();

  await page.getByRole("button", { name: /2\. Ergonomie/i }).click();
  await page.getByRole("button", { name: /Șa Comfort 860 mm/i }).click();
  await expect(
    page.locator('[data-visual-choice-id="seat-comfort"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: /4\. Protecție/i }).click();
  await page.getByRole("button", { name: /Kit protecție Rally/i }).click();
  await expect(
    page.getByText(/Bare protecție motor a fost adăugată automat/i),
  ).toBeVisible();
  await expect(
    page.locator('[data-visual-choice-id="engine-bars"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-visual-choice-id="rally-protection"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: /5\. Bagaje/i }).click();
  await page.getByRole("button", { name: /Cutii laterale aluminium/i }).click();
  await expect(
    page.getByText(/Cadru modular bagaje a fost adăugată automat/i),
  ).toBeVisible();
  await expect(
    page.locator('[data-visual-choice-id="luggage-rack"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-visual-choice-id="aluminium-cases"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: /6\. Accesorii/i }).click();
  await page.getByRole("button", { name: /Parbriz Touring/i }).click();
  await expect(
    page.locator('[data-visual-choice-id="tall-screen"]'),
  ).toBeVisible();
  await expect(page.locator('[data-visual-role="overlay"]')).toHaveCount(6);
});

test("offers a working configurator for another initial model", async ({
  page,
}) => {
  await page.goto("/configurator/apex-675-r");

  await expect(
    page.getByRole("heading", { level: 1, name: "Apex 675 R" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Graphite Black/i }).click();
  await expect(
    page.locator(
      '[data-visual-role="base"][data-visual-choice-id="color-graphite"]',
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: /2\. Ergonomie/i }).click();
  await page.getByRole("button", { name: /Șa Comfort/i }).click();
  await expect(
    page.locator('[data-visual-choice-id="seat-comfort"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: /3\. Echipare/i }).click();
  await page.getByRole("button", { name: /Set bagaje/i }).click();
  await expect(
    page.locator('[data-visual-choice-id="luggage-set"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: /4\. Sumar/i }).click();
  await expect(
    page.getByRole("button", { name: "Salvează și cere ofertă" }),
  ).toBeVisible();
});

test("saves, shares, and submits a database-backed configuration enquiry", async ({
  context,
  page,
}) => {
  test.skip(
    !process.env.DATABASE_URL,
    "The complete journey requires a migrated and seeded test database.",
  );

  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:3000",
  });
  await page.goto("/configurator/terran-900-rally");
  await page.getByRole("button", { name: /7\. Sumar/i }).click();
  await page.getByRole("button", { name: "Salvează și cere ofertă" }).click();

  await expect(page).toHaveURL(/\/configuratie\/[A-HJ-NP-Z2-9]{12}$/);
  await expect(
    page.getByText("Configurație salvată și recalculată"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Copiază linkul" }).click();
  await expect(page.getByRole("button", { name: "Link copiat" })).toBeVisible();

  await page
    .getByRole("link", { name: "Cere ofertă pentru configurație" })
    .click();
  await expect(page.getByText("Configurație atașată")).toBeVisible();
  await page.getByLabel("Nume").fill("Ana Test");
  await page.getByLabel("Email").fill("ana.test@example.com");
  await page
    .getByLabel("Mesaj")
    .fill("Doresc o ofertă pentru această configurație VERIDIAN Moto.");
  await page.getByLabel(/Am citit și accept/i).check();

  // The public form intentionally rejects submissions completed in under two
  // seconds as a low-cost bot signal.
  await page.waitForTimeout(2_100);
  await page.getByRole("button", { name: "Trimite solicitarea" }).click();
  await expect(
    page.getByRole("heading", { name: "Solicitare înregistrată" }),
  ).toBeVisible();
  await expect(page.getByText(/SOL-[A-F0-9]{8}/)).toBeVisible();
});
