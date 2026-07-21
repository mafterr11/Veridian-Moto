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

async function requirePublicPage(path: string, expectedText: string) {
  const response = await request(path);
  const body = await response.text();

  if (
    !response.ok ||
    !body.includes(expectedText) ||
    body.includes(publicErrorSignature)
  ) {
    throw new Error(
      `${path} did not render its expected public content (status ${response.status}).`,
    );
  }

  return response;
}

async function run() {
  const homepage = await requirePublicPage("/", "Echipat pentru mai departe");
  requireHeader(homepage, "content-security-policy");
  requireHeader(homepage, "x-content-type-options", "nosniff");
  requireHeader(homepage, "x-frame-options", "deny");
  requireHeader(homepage, "referrer-policy");
  process.stdout.write("[ok] Homepage and browser security headers\n");

  await requirePublicPage("/modele", "Făcută pentru");
  process.stdout.write("[ok] Public model catalogue\n");

  // Homepage and Descoperă share the editorial cache. Checking both, followed
  // by a second homepage request, exercises both a cache fill and cache hits.
  await requirePublicPage("/descopera", "Drumul începe înainte de pornire.");
  await requirePublicPage("/", "Echipat pentru mai departe");
  process.stdout.write("[ok] Editorial cache fill and repeated cache hits\n");

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
