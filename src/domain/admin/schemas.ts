import { z } from "zod";

import { openingDayKeys } from "@/domain/site-settings";

const slug = z
  .string()
  .trim()
  .min(2, "Slugul este obligatoriu.")
  .max(220, "Slugul este prea lung.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Folosește doar litere mici fără diacritice, cifre și cratime.",
  );

const identifier = z
  .string()
  .trim()
  .min(1, "Identificatorul este obligatoriu.")
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Folosește litere mici, cifre și cratime.",
  );

const uuid = z.string().uuid("Selectează o înregistrare validă.");

function requiredInteger(message: string, minimum = 0) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() !== "" ? Number(value) : value,
    z.number().int(message).min(minimum, message),
  );
}

function optionalInteger(minimum = 0) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : undefined,
    z.number().int().min(minimum).optional(),
  );
}

export function parseMoneyToMinor(value: unknown) {
  if (typeof value !== "string") return Number.NaN;
  const normalized = value.trim().replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return Number.NaN;
  }

  const [whole, decimals = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
}

const money = z.preprocess(
  parseMoneyToMinor,
  z
    .number()
    .int("Prețul trebuie exprimat în lei, cu maximum două zecimale.")
    .min(0, "Prețul nu poate fi negativ.")
    .max(1_000_000_00, "Prețul depășește limita acceptată."),
);

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(maximum).optional(),
  );

export const contentStatuses = ["draft", "published", "archived"] as const;

export const categorySchema = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(2, "Numele este obligatoriu.").max(100),
  slug,
  description: z
    .string()
    .trim()
    .min(10, "Descrierea trebuie să aibă minimum 10 caractere.")
    .max(2_000),
  sortOrder: requiredInteger("Ordinea trebuie să fie un număr pozitiv."),
  status: z.enum(contentStatuses),
});

export const modelSchema = z.object({
  id: uuid.optional(),
  categoryId: uuid,
  name: z.string().trim().min(2, "Numele este obligatoriu.").max(120),
  slug,
  tagline: z.string().trim().min(3, "Tagline-ul este obligatoriu.").max(200),
  summary: z.string().trim().min(20, "Rezumatul este prea scurt.").max(600),
  description: z
    .string()
    .trim()
    .min(40, "Descrierea trebuie să aibă minimum 40 de caractere.")
    .max(10_000),
  modelYear: requiredInteger("Anul modelului nu este valid.", 2020).pipe(
    z.number().max(2100),
  ),
  basePriceMinor: money,
  displacementCc: optionalInteger(1),
  powerHp: requiredInteger("Puterea trebuie să fie pozitivă.", 1),
  torqueNm: requiredInteger("Cuplul trebuie să fie pozitiv.", 1),
  wetWeightKg: requiredInteger("Greutatea trebuie să fie pozitivă.", 1),
  seatHeightMm: requiredInteger("Înălțimea șeii trebuie să fie pozitivă.", 1),
  featured: z.boolean(),
  configuratorEnabled: z.boolean(),
});

export const modelFeatureSchema = z.object({
  id: uuid.optional(),
  modelId: uuid,
  groupName: z.string().trim().min(2).max(100),
  label: z.string().trim().min(2).max(160),
  value: optionalText(500),
  isStandard: z.boolean(),
  sortOrder: requiredInteger("Ordinea nu este validă."),
});

export const optionGroupSchema = z
  .object({
    id: uuid.optional(),
    modelId: uuid,
    key: identifier,
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(5).max(1_000),
    selectionType: z.enum(["single", "multiple"]),
    required: z.boolean(),
    minSelected: requiredInteger("Minimul nu este valid."),
    maxSelected: requiredInteger("Maximul nu este valid.", 1),
    sortOrder: requiredInteger("Ordinea nu este validă."),
    status: z.enum(contentStatuses),
  })
  .superRefine((value, context) => {
    if (value.maxSelected < value.minSelected) {
      context.addIssue({
        code: "custom",
        path: ["maxSelected"],
        message: "Maximul nu poate fi mai mic decât minimul.",
      });
    }
    if (value.selectionType === "single" && value.maxSelected !== 1) {
      context.addIssue({
        code: "custom",
        path: ["maxSelected"],
        message: "Un grup exclusiv trebuie să aibă maximul 1.",
      });
    }
    if (value.required && value.minSelected < 1) {
      context.addIssue({
        code: "custom",
        path: ["minSelected"],
        message: "Un grup obligatoriu trebuie să solicite cel puțin o alegere.",
      });
    }
  });

export const optionChoiceSchema = z.object({
  id: uuid.optional(),
  modelId: uuid,
  groupId: uuid,
  code: identifier,
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(1_000),
  priceDeltaMinor: money,
  swatchHex: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Culoarea trebuie să fie în format #RRGGBB.")
      .optional(),
  ),
  accessoryId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    uuid.optional(),
  ),
  mediaId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    uuid.optional(),
  ),
  isStandard: z.boolean(),
  sortOrder: requiredInteger("Ordinea nu este validă."),
  status: z.enum(contentStatuses),
});

export const optionRuleSchema = z
  .object({
    modelId: uuid,
    sourceChoiceId: uuid,
    targetChoiceId: uuid,
    ruleType: z.enum(["requires", "excludes"]),
    explanation: z.string().trim().min(5).max(500),
  })
  .refine((value) => value.sourceChoiceId !== value.targetChoiceId, {
    path: ["targetChoiceId"],
    message: "O opțiune nu poate face referire la ea însăși.",
  });

export const inventorySchema = z
  .object({
    id: uuid.optional(),
    modelId: uuid,
    stockCode: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(
        /^[A-Za-z0-9-]+$/,
        "Codul poate conține litere, cifre și cratime.",
      ),
    vin: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z
        .string()
        .trim()
        .toUpperCase()
        .regex(
          /^[A-HJ-NPR-Z0-9]{17}$/,
          "VIN-ul trebuie să aibă 17 caractere valide.",
        )
        .optional(),
    ),
    condition: z.enum(["new", "used", "demo"]),
    year: requiredInteger("Anul nu este valid.", 1990).pipe(
      z.number().max(2100),
    ),
    mileageKm: requiredInteger("Kilometrajul nu poate fi negativ."),
    colour: z.string().trim().min(2).max(120),
    priceMinor: money,
    status: z.enum(["incoming", "available", "reserved", "sold", "archived"]),
    isPublic: z.boolean(),
    privateNotes: optionalText(5_000),
  })
  .superRefine((value, context) => {
    if (
      value.isPublic &&
      value.status !== "incoming" &&
      value.status !== "available"
    ) {
      context.addIssue({
        code: "custom",
        path: ["isPublic"],
        message:
          "Doar unitățile în tranzit sau disponibile pot fi vizibile public.",
      });
    }
  });

export const accessoryCategorySchema = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(2).max(100),
  slug,
  sortOrder: requiredInteger("Ordinea nu este validă."),
  status: z.enum(contentStatuses),
});

export const accessorySchema = z.object({
  id: uuid.optional(),
  categoryId: uuid,
  name: z.string().trim().min(2).max(160),
  slug,
  sku: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[A-Za-z0-9-]+$/, "SKU poate conține litere, cifre și cratime."),
  summary: z.string().trim().min(10).max(600),
  description: z.string().trim().min(20).max(8_000),
  priceMinor: money,
  stockState: z.enum(["in_stock", "low_stock", "preorder", "unavailable"]),
  internalQuantity: optionalInteger(0),
  featured: z.boolean(),
  status: z.enum(contentStatuses),
  compatibleModelIds: z.array(uuid).max(100),
});

const optionalUuid = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  uuid.optional(),
);

const optionalDateTime = z.preprocess((value) => {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return new Date(value);
}, z.date().optional());

const optionalUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .trim()
    .url("Introdu o adresă URL completă.")
    .max(500)
    .refine(
      (value) => ["http:", "https:"].includes(new URL(value).protocol),
      "Sunt permise numai adresele HTTP sau HTTPS.",
    )
    .optional(),
);

export const discoverCategorySchema = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(2, "Numele este obligatoriu.").max(100),
  slug,
  sortOrder: requiredInteger("Ordinea nu este validă."),
});

export const discoverPostSchema = z
  .object({
    id: uuid.optional(),
    categoryId: uuid,
    title: z.string().trim().min(10, "Titlul este prea scurt.").max(200),
    slug,
    excerpt: z.string().trim().min(40, "Rezumatul este prea scurt.").max(600),
    bodyMarkdown: z
      .string()
      .trim()
      .min(100, "Articolul trebuie să aibă minimum 100 de caractere.")
      .max(50_000),
    coverMediaId: optionalUuid,
    featured: z.boolean(),
    status: z.enum(contentStatuses),
    publishedAt: optionalDateTime,
    seoTitle: optionalText(70),
    seoDescription: optionalText(170),
  })
  .superRefine((value, context) => {
    if (value.status === "published" && !value.coverMediaId) {
      context.addIssue({
        code: "custom",
        path: ["coverMediaId"],
        message: "Un articol publicat trebuie să aibă imagine de copertă.",
      });
    }
  });

const openingDaySchema = z
  .object({
    closed: z.boolean(),
    opens: optionalText(5),
    closes: optionalText(5),
  })
  .superRefine((value, context) => {
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!value.closed) {
      if (!value.opens || !timePattern.test(value.opens)) {
        context.addIssue({
          code: "custom",
          path: ["opens"],
          message: "Ora de deschidere trebuie să fie în format HH:MM.",
        });
      }
      if (!value.closes || !timePattern.test(value.closes)) {
        context.addIssue({
          code: "custom",
          path: ["closes"],
          message: "Ora de închidere trebuie să fie în format HH:MM.",
        });
      }
      if (value.opens && value.closes && value.opens >= value.closes) {
        context.addIssue({
          code: "custom",
          path: ["closes"],
          message: "Ora de închidere trebuie să fie după deschidere.",
        });
      }
    }
  });

export const siteSettingsSchema = z.object({
  contactEmail: z.string().trim().toLowerCase().email().max(320),
  contactPhone: z
    .string()
    .trim()
    .min(7)
    .max(40)
    .regex(/^[+0-9 ()-]+$/, "Numărul de telefon conține caractere invalide."),
  address: z.string().trim().min(10).max(1_000),
  openingHours: z.object({
    luni: openingDaySchema,
    marti: openingDaySchema,
    miercuri: openingDaySchema,
    joi: openingDaySchema,
    vineri: openingDaySchema,
    sambata: openingDaySchema,
    duminica: openingDaySchema,
  }),
  socialLinks: z.object({
    instagram: optionalUrl,
    youtube: optionalUrl,
    facebook: optionalUrl,
  }),
  defaultSeoTitle: z.string().trim().min(10).max(70),
  defaultSeoDescription: z.string().trim().min(50).max(170),
});

export function openingHoursFromForm(formData: FormData) {
  return Object.fromEntries(
    openingDayKeys.map((day) => [
      day,
      {
        closed: checked(formData, `${day}Closed`),
        opens: String(formData.get(`${day}Opens`) ?? ""),
        closes: String(formData.get(`${day}Closes`) ?? ""),
      },
    ]),
  );
}

const modelMediaRoleSchema = z.enum([
  "card",
  "hero",
  "gallery",
  "configurator_base",
  "configurator_overlay",
]);

function validateModelMediaOptionLink(
  value: {
    role: z.infer<typeof modelMediaRoleSchema>;
    optionChoiceId?: string;
  },
  context: z.RefinementCtx,
) {
  if (value.role === "configurator_overlay" && !value.optionChoiceId) {
    context.addIssue({
      code: "custom",
      path: ["optionChoiceId"],
      message: "Selectează opțiunea reprezentată de overlay.",
    });
  }

  if (!value.role.startsWith("configurator_") && value.optionChoiceId) {
    context.addIssue({
      code: "custom",
      path: ["optionChoiceId"],
      message: "O opțiune poate fi asociată numai imaginilor configuratorului.",
    });
  }
}

export const modelMediaAssignmentSchema = z
  .object({
    modelId: uuid,
    mediaId: uuid,
    role: modelMediaRoleSchema,
    optionChoiceId: optionalUuid,
    viewAngle: optionalText(80),
    sortOrder: requiredInteger("Ordinea nu este validă."),
  })
  .superRefine(validateModelMediaOptionLink);

export const uploadImageSchema = z
  .object({
    modelId: uuid,
    altText: z
      .string()
      .trim()
      .min(5, "Textul alternativ este obligatoriu.")
      .max(500),
    role: modelMediaRoleSchema,
    optionChoiceId: optionalUuid,
    viewAngle: optionalText(80),
    sortOrder: requiredInteger("Ordinea nu este validă."),
  })
  .superRefine(validateModelMediaOptionLink);

export const accessoryMediaAssignmentSchema = z.object({
  accessoryId: uuid,
  mediaId: uuid,
  sortOrder: requiredInteger("Ordinea nu este validă."),
});

export const uploadAccessoryImageSchema = z.object({
  accessoryId: uuid,
  altText: z
    .string()
    .trim()
    .min(5, "Textul alternativ este obligatoriu.")
    .max(500),
  sortOrder: requiredInteger("Ordinea nu este validă."),
});

export const inventoryMediaAssignmentSchema = z.object({
  inventoryUnitId: uuid,
  mediaId: uuid,
  sortOrder: requiredInteger("Ordinea nu este validă."),
});

export const uploadInventoryImageSchema = z.object({
  inventoryUnitId: uuid,
  altText: z
    .string()
    .trim()
    .min(5, "Textul alternativ este obligatoriu.")
    .max(500),
  sortOrder: requiredInteger("Ordinea nu este validă."),
});

export const uploadDiscoverImageSchema = z.object({
  postId: uuid,
  altText: z
    .string()
    .trim()
    .min(5, "Textul alternativ este obligatoriu.")
    .max(500),
});

export function checked(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}
