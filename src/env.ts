import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const httpUrl = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Only HTTP or HTTPS URLs are allowed.");

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  httpUrl.optional(),
);

const optionalEmail = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().email().optional(),
);

const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(32).optional(),
);

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXT_PUBLIC_APP_URL: httpUrl.default("http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
    SUPABASE_SERVICE_ROLE_KEY: optionalString,
    DATABASE_URL: optionalString,
    RESEND_API_KEY: optionalString,
    RESEND_FROM_EMAIL: optionalString,
    ENQUIRY_NOTIFICATION_EMAIL: optionalEmail,
    ADMIN_EMAIL: optionalEmail,
    RATE_LIMIT_SECRET: optionalSecret,
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === "production" &&
      value.DATABASE_URL &&
      !value.RATE_LIMIT_SECRET
    ) {
      context.addIssue({
        code: "custom",
        path: ["RATE_LIMIT_SECRET"],
        message:
          "RATE_LIMIT_SECRET is required in production when DATABASE_URL is configured.",
      });
    }
  });

export const env = environmentSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  ENQUIRY_NOTIFICATION_EMAIL: process.env.ENQUIRY_NOTIFICATION_EMAIL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  RATE_LIMIT_SECRET: process.env.RATE_LIMIT_SECRET,
});
