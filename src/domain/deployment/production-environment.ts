export const productionRuntimeVariableNames = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "DATABASE_URL",
  "ADMIN_EMAIL",
  "RATE_LIMIT_SECRET",
] as const;

type ProductionRuntimeVariable =
  (typeof productionRuntimeVariableNames)[number];

type EnvironmentInput = Record<string, string | undefined>;

export type EnvironmentIssue = {
  variable: string;
  message: string;
};

export type ProductionEnvironmentReport = {
  errors: EnvironmentIssue[];
  warnings: EnvironmentIssue[];
};

function valueOf(input: EnvironmentInput, name: string) {
  const value = input[name]?.trim();
  return value ? value : undefined;
}

function isUrlWithProtocol(value: string, protocols: readonly string[]) {
  try {
    return protocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateProductionEnvironment(
  input: EnvironmentInput,
): ProductionEnvironmentReport {
  const errors: EnvironmentIssue[] = [];
  const warnings: EnvironmentIssue[] = [];

  for (const variable of productionRuntimeVariableNames) {
    if (!valueOf(input, variable)) {
      errors.push({
        variable,
        message: "is required for the production runtime",
      });
    }
  }

  const appUrl = valueOf(input, "NEXT_PUBLIC_APP_URL");
  if (appUrl && !isUrlWithProtocol(appUrl, ["https:"])) {
    errors.push({
      variable: "NEXT_PUBLIC_APP_URL",
      message: "must be the canonical HTTPS origin",
    });
  }

  const supabaseUrl = valueOf(input, "NEXT_PUBLIC_SUPABASE_URL");
  if (supabaseUrl && !isUrlWithProtocol(supabaseUrl, ["https:"])) {
    errors.push({
      variable: "NEXT_PUBLIC_SUPABASE_URL",
      message: "must be an HTTPS Supabase project URL",
    });
  }

  const databaseUrl = valueOf(input, "DATABASE_URL");
  if (
    databaseUrl &&
    !isUrlWithProtocol(databaseUrl, ["postgres:", "postgresql:"])
  ) {
    errors.push({
      variable: "DATABASE_URL",
      message: "must be a PostgreSQL connection URL",
    });
  }

  const parsedDatabaseUrl = databaseUrl ? parseUrl(databaseUrl) : undefined;
  if (
    parsedDatabaseUrl &&
    ["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol)
  ) {
    if (parsedDatabaseUrl.port !== "6543") {
      errors.push({
        variable: "DATABASE_URL",
        message:
          "must use the Supabase transaction pooler on port 6543 in Vercel",
      });
    }
    if (!parsedDatabaseUrl.hostname.endsWith(".pooler.supabase.com")) {
      errors.push({
        variable: "DATABASE_URL",
        message: "must use a Supabase pooler hostname",
      });
    }
  }

  const parsedSupabaseUrl = supabaseUrl ? parseUrl(supabaseUrl) : undefined;
  const projectReference = parsedSupabaseUrl?.hostname.endsWith(".supabase.co")
    ? parsedSupabaseUrl.hostname.slice(0, -".supabase.co".length)
    : undefined;
  if (
    parsedDatabaseUrl &&
    projectReference &&
    parsedDatabaseUrl.username !== `postgres.${projectReference}`
  ) {
    errors.push({
      variable: "DATABASE_URL",
      message:
        "must use the transaction-pooler username for the configured Supabase project",
    });
  }

  const adminEmail = valueOf(input, "ADMIN_EMAIL");
  if (adminEmail && !isEmail(adminEmail)) {
    errors.push({ variable: "ADMIN_EMAIL", message: "must be a valid email" });
  }

  const rateLimitSecret = valueOf(input, "RATE_LIMIT_SECRET");
  if (rateLimitSecret && rateLimitSecret.length < 32) {
    errors.push({
      variable: "RATE_LIMIT_SECRET",
      message: "must contain at least 32 characters",
    });
  }

  const resendVariables = [
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "ENQUIRY_NOTIFICATION_EMAIL",
  ] as const;
  const configuredResendVariables = resendVariables.filter((variable) =>
    valueOf(input, variable),
  );

  if (
    configuredResendVariables.length > 0 &&
    configuredResendVariables.length < resendVariables.length
  ) {
    for (const variable of resendVariables) {
      if (!valueOf(input, variable)) {
        errors.push({
          variable,
          message: "is required when email notifications are enabled",
        });
      }
    }
  }

  const notificationEmail = valueOf(input, "ENQUIRY_NOTIFICATION_EMAIL");
  if (notificationEmail && !isEmail(notificationEmail)) {
    errors.push({
      variable: "ENQUIRY_NOTIFICATION_EMAIL",
      message: "must be a valid email",
    });
  }

  if (valueOf(input, "SUPABASE_SERVICE_ROLE_KEY")) {
    warnings.push({
      variable: "SUPABASE_SERVICE_ROLE_KEY",
      message:
        "is provisioning-only; omit it from the Vercel runtime after admin bootstrap",
    });
  }

  if (valueOf(input, "MIGRATION_DATABASE_URL")) {
    warnings.push({
      variable: "MIGRATION_DATABASE_URL",
      message:
        "is migration-only; keep it on the trusted machine or CI that applies migrations",
    });
  }

  return { errors, warnings };
}

export type { EnvironmentInput, ProductionRuntimeVariable };
