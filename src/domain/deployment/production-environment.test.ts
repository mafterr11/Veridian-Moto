import { describe, expect, it } from "vitest";

import { validateProductionEnvironment } from "./production-environment";

const validEnvironment = {
  NEXT_PUBLIC_APP_URL: "https://veridian.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  DATABASE_URL:
    "postgresql://postgres.project:password@region.pooler.supabase.com:6543/postgres",
  ADMIN_EMAIL: "admin@veridian.example",
  RATE_LIMIT_SECRET: "a-production-secret-with-32-characters",
};

describe("production environment validation", () => {
  it("accepts the complete required runtime environment", () => {
    expect(validateProductionEnvironment(validEnvironment)).toEqual({
      errors: [],
      warnings: [],
    });
  });

  it("rejects missing and non-production values", () => {
    const report = validateProductionEnvironment({
      ...validEnvironment,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      DATABASE_URL: "https://example.com/not-postgres",
      ADMIN_EMAIL: "not-an-email",
      RATE_LIMIT_SECRET: "short",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    });

    expect(report.errors.map((issue) => issue.variable)).toEqual(
      expect.arrayContaining([
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "DATABASE_URL",
        "ADMIN_EMAIL",
        "RATE_LIMIT_SECRET",
      ]),
    );
  });

  it("requires the complete optional email configuration", () => {
    const report = validateProductionEnvironment({
      ...validEnvironment,
      RESEND_API_KEY: "re_example",
    });

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "RESEND_FROM_EMAIL" }),
        expect.objectContaining({ variable: "ENQUIRY_NOTIFICATION_EMAIL" }),
      ]),
    );
  });

  it("warns when provisioning credentials are present", () => {
    const report = validateProductionEnvironment({
      ...validEnvironment,
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      MIGRATION_DATABASE_URL: "postgresql://direct.example/postgres",
    });

    expect(report.errors).toEqual([]);
    expect(report.warnings.map((issue) => issue.variable)).toEqual([
      "SUPABASE_SERVICE_ROLE_KEY",
      "MIGRATION_DATABASE_URL",
    ]);
  });
});
