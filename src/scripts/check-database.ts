import { config as loadEnv } from "dotenv";

import { createDatabaseConnection } from "@/db/connection";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

function errorCode(error: unknown): string {
  let current = error;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!current || typeof current !== "object") break;
    if (
      "code" in current &&
      (typeof current.code === "string" || typeof current.code === "number")
    ) {
      return String(current.code);
    }
    current = "cause" in current ? current.cause : undefined;
  }

  return "UNKNOWN";
}

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL lipsește din .env.local.");
  }

  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL nu este un URL PostgreSQL valid.");
  }

  const port = parsed.port || "5432";
  console.log(`Țintă: ${parsed.hostname}:${port}`);
  if (port !== "6543") {
    console.warn(
      "Avertisment: pentru Vercel, DATABASE_URL trebuie să folosească transaction pooler pe portul 6543.",
    );
  }

  const connection = createDatabaseConnection(databaseUrl);
  const startedAt = performance.now();

  try {
    const [health] = await connection.sql<
      { databaseName: string; readOnly: boolean }[]
    >`
      select
        current_database()::text as "databaseName",
        current_setting('transaction_read_only')::boolean as "readOnly"
    `;
    const [schema] = await connection.sql<{ adminProfiles: string | null }[]>`
      select to_regclass('public.admin_profiles')::text as "adminProfiles"
    `;
    const [activity] = await connection.sql<{ blockedConnections: number }[]>`
      select count(*)::int as "blockedConnections"
      from pg_stat_activity
      where datname = current_database()
        and wait_event_type = 'Lock'
    `;

    if (!schema?.adminProfiles) {
      throw new Error(
        "Tabela public.admin_profiles lipsește. Rulează pnpm db:migrate de pe calculatorul de încredere.",
      );
    }

    console.log(
      `Conexiune OK în ${Math.round(performance.now() - startedAt)} ms; baza ${health?.databaseName ?? "necunoscută"}; read-only: ${health?.readOnly ? "da" : "nu"}.`,
    );
    console.log(
      `Sesiuni care așteaptă un lock: ${activity?.blockedConnections ?? 0}.`,
    );
  } catch (error) {
    const code = errorCode(error);
    console.error(`Verificarea bazei de date a eșuat (cod ${code}).`);
    if (code === "57014") {
      console.error(
        "Interogarea a fost anulată de statement_timeout. Verifică lock-urile și starea proiectului în Supabase înainte de deploy.",
      );
    } else if (code === "28P01") {
      console.error("Parola sau utilizatorul PostgreSQL este incorect.");
    } else if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
      console.error(
        "Hostname-ul pooler nu poate fi rezolvat din această rețea.",
      );
    }
    throw error;
  } finally {
    await connection.close();
  }
}

checkDatabase().catch(() => {
  process.exitCode = 1;
});
