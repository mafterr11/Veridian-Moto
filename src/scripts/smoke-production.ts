const input = process.argv.slice(2).find((argument) => argument !== "--");

if (!input) {
  throw new Error(
    "Usage: pnpm smoke:production -- https://your-production-origin.example",
  );
}

const targetOrigin = new URL(input);
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

if (
  targetOrigin.protocol !== "https:" &&
  !localHosts.has(targetOrigin.hostname)
) {
  throw new Error("The smoke-test target must use HTTPS unless it is local.");
}

async function request(path: string, redirect: RequestRedirect = "follow") {
  const response = await fetch(new URL(path, targetOrigin), {
    redirect,
    headers: { "user-agent": "VERIDIAN-release-smoke/1.0" },
    signal: AbortSignal.timeout(15_000),
  });

  return response;
}

function requireHeader(response: Response, name: string, value?: string) {
  const actual = response.headers.get(name);
  if (!actual || (value && !actual.toLowerCase().includes(value))) {
    throw new Error(
      `${response.url || targetOrigin.href} is missing the expected ${name} header.`,
    );
  }
}

const publicErrorSignature = "Drumul s-a întrerupt aici.";

async function requirePublicContent(
  path: string,
  expectedTexts: readonly string[],
) {
  const response = await request(path);
  const body = await response.text();
  const missingTexts = expectedTexts.filter((text) => !body.includes(text));

  if (
    !response.ok ||
    missingTexts.length > 0 ||
    body.includes(publicErrorSignature)
  ) {
    throw new Error(
      `${path} did not render its expected public content (status ${response.status}; missing: ${
        missingTexts.join(", ") || "none"
      }).`,
    );
  }

  return { body, response };
}

async function requirePublicPage(path: string, expectedText: string) {
  return requirePublicContent(path, [expectedText]);
}

async function run() {
  const homepage = await requirePublicPage("/", "Echipat pentru mai departe");
  requireHeader(homepage.response, "content-security-policy");
  requireHeader(homepage.response, "x-content-type-options", "nosniff");
  requireHeader(homepage.response, "x-frame-options", "deny");
  requireHeader(homepage.response, "referrer-policy");
  process.stdout.write("[ok] Homepage and browser security headers\n");

  const optimizedImage = await request(
    "/_next/image?url=%2Fimages%2Fmodels%2Fterran-650.webp&w=640&q=75",
  );
  const optimizedImageBytes = (await optimizedImage.arrayBuffer()).byteLength;
  if (!optimizedImage.ok || optimizedImageBytes < 1_000) {
    throw new Error(
      `Next image optimization failed (status ${optimizedImage.status}; ${optimizedImageBytes} bytes).`,
    );
  }
  requireHeader(optimizedImage, "content-type", "image/");
  process.stdout.write("[ok] Patched image optimization runtime\n");

  await requirePublicContent("/modele", [
    "Făcută pentru",
    "36.990",
    "54.990",
    "66.990",
    "59.990",
  ]);
  process.stdout.write("[ok] Public model catalogue and refreshed prices\n");

  await requirePublicContent("/accesorii", [
    "Set cutii laterale aluminium",
    "Șa Comfort Touring",
    "Bare protecție motor",
    "Suport telefon &amp; navigație",
    "Top case 42 L",
    "Stand paddock spate",
    "Manșoane încălzite Touring",
    "Kit proiectoare LED Adventure",
    "Parbriz Touring reglabil",
    "Geantă rezervor 12 L",
    "Kit pană &amp; compresor 12 V",
    "Scut motor din aluminiu",
  ]);
  process.stdout.write("[ok] Complete accessory range and custom imagery\n");

  // Homepage and Descoperă share the editorial cache. Checking both, followed
  // by a second homepage request, exercises both a cache fill and cache hits.
  await requirePublicPage("/descopera", "Drumul începe înainte de pornire.");
  await requirePublicContent("/descopera/abs-in-viraj", [
    "Ce face, de fapt, ABS-ul în viraj",
    "Cuprinsul articolului",
    "Ideea de reținut",
  ]);
  await requirePublicPage("/", "Echipat pentru mai departe");
  process.stdout.write(
    "[ok] Expanded editorial layout, cache fill and repeated cache hits\n",
  );

  const health = await request("/api/health");
  const healthBody = (await health.json()) as { status?: unknown };
  if (!health.ok || healthBody.status !== "ok") {
    throw new Error("The health endpoint did not return an OK response.");
  }
  requireHeader(health, "cache-control", "no-store");
  process.stdout.write("[ok] Non-cacheable health endpoint\n");

  const atelier = await request("/atelier", "manual");
  if (![302, 303, 307, 308].includes(atelier.status)) {
    throw new Error(
      `Unauthenticated Atelier access returned ${atelier.status} instead of a redirect.`,
    );
  }
  const location = atelier.headers.get("location");
  const redirectUrl = location ? new URL(location, targetOrigin) : undefined;
  if (
    !redirectUrl ||
    redirectUrl.origin !== targetOrigin.origin ||
    redirectUrl.pathname !== "/atelier/login"
  ) {
    throw new Error(
      "Unauthenticated Atelier access did not redirect to login.",
    );
  }
  requireHeader(atelier, "cache-control", "no-store");
  requireHeader(atelier, "x-robots-tag", "noindex");
  process.stdout.write("[ok] Private Atelier redirect and cache policy\n");

  process.stdout.write(
    `Production smoke checks passed for ${targetOrigin.origin}.\n`,
  );
}

run().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown smoke error";
  process.stderr.write(`Production smoke checks failed: ${message}\n`);
  process.exitCode = 1;
});
