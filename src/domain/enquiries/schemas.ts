import { z } from "zod";

const identifier = z
  .string()
  .min(1)
  .max(140)
  .regex(/^[A-Za-z0-9-]+$/);

const singleLineText = z
  .string()
  .refine(
    (value) => !/[\u0000-\u001f\u007f]/.test(value),
    "Câmpul trebuie să conțină o singură linie de text.",
  );

export const configurationStateSchema = z.object({
  modelId: identifier,
  previewAngle: identifier.max(80),
  selectedByGroup: z
    .record(identifier, z.array(identifier).max(20))
    .refine((value) => Object.keys(value).length <= 20, {
      message: "Configurația conține prea multe grupuri.",
    }),
});

export const saveConfigurationSchema = z.object({
  modelSlug: identifier,
  state: configurationStateSchema,
  clientTotalMinor: z.coerce.number().int().nonnegative().max(100_000_000),
});

export const publicReferenceSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-HJ-NP-Z2-9]{12}$/);

export const inquirySchema = z
  .object({
    configurationReference: publicReferenceSchema.optional(),
    name: singleLineText.trim().min(2).max(160),
    email: z.string().trim().toLowerCase().email().max(320),
    phone: singleLineText
      .trim()
      .max(40)
      .refine(
        (value) => !value || /^[+0-9 ().-]+$/.test(value),
        "Numărul de telefon conține caractere invalide.",
      )
      .transform((value) => value || undefined),
    subject: singleLineText.trim().min(3).max(200),
    message: z
      .string()
      .trim()
      .min(20)
      .max(5_000)
      .refine(
        (value) =>
          !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value),
        "Mesajul conține caractere nepermise.",
      ),
    preferredContactMethod: z.enum(["email", "phone"]),
    privacyAcknowledged: z.literal(true),
    website: z.string().max(0),
    startedAt: z.coerce.number().int().positive(),
  })
  .superRefine((value, context) => {
    if (value.preferredContactMethod === "phone" && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Numărul de telefon este necesar pentru contact telefonic.",
      });
    }
  });

export const updateInquirySchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "closed", "spam"]),
  privateAdminNotes: z.string().trim().max(5_000),
});

export const PRIVACY_POLICY_VERSION = "2026-07-21";
