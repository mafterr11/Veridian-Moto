import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", ["admin"]);
export const contentStatus = pgEnum("content_status", [
  "draft",
  "published",
  "archived",
]);
export const modelMediaRole = pgEnum("model_media_role", [
  "card",
  "hero",
  "gallery",
  "configurator_base",
  "configurator_overlay",
]);
export const selectionType = pgEnum("selection_type", ["single", "multiple"]);
export const optionRuleType = pgEnum("option_rule_type", [
  "requires",
  "excludes",
]);
export const inventoryCondition = pgEnum("inventory_condition", [
  "new",
  "used",
  "demo",
]);
export const inventoryStatus = pgEnum("inventory_status", [
  "incoming",
  "available",
  "reserved",
  "sold",
  "archived",
]);
export const accessoryStockState = pgEnum("accessory_stock_state", [
  "in_stock",
  "low_stock",
  "preorder",
  "unavailable",
]);
export const inquiryType = pgEnum("inquiry_type", ["contact", "configuration"]);
export const contactMethod = pgEnum("contact_method", ["email", "phone"]);
export const inquiryStatus = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "closed",
  "spam",
]);

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminProfiles = pgTable(
  "admin_profiles",
  {
    // A migration adds the reference to auth.users because that table is owned
    // by Supabase and must not be managed by Drizzle.
    id: uuid("id").primaryKey(),
    role: adminRole("role").default("admin").notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps(),
  },
  (table) => [index("admin_profiles_active_idx").on(table.isActive)],
).enableRLS();

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storagePath: text("storage_path").notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    altText: text("alt_text").notNull(),
    blurDataUrl: text("blur_data_url"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("media_assets_storage_path_uidx").on(table.storagePath),
    check("media_assets_width_positive", sql`${table.width} > 0`),
    check("media_assets_height_positive", sql`${table.height} > 0`),
    check(
      "media_assets_file_size_non_negative",
      sql`${table.fileSizeBytes} >= 0`,
    ),
  ],
).enableRLS();

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    description: text("description").notNull(),
    heroMediaId: uuid("hero_media_id").references(() => mediaAssets.id, {
      onDelete: "restrict",
    }),
    sortOrder: integer("sort_order").default(0).notNull(),
    status: contentStatus("status").default("draft").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("categories_slug_uidx").on(table.slug),
    index("categories_status_sort_idx").on(table.status, table.sortOrder),
    check("categories_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
  ],
).enableRLS();

export const motorcycleModels = pgTable(
  "motorcycle_models",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    tagline: text("tagline").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    modelYear: integer("model_year").notNull(),
    basePriceMinor: integer("base_price_minor").notNull(),
    currency: varchar("currency", { length: 3 }).default("RON").notNull(),
    displacementCc: integer("displacement_cc"),
    powerHp: integer("power_hp").notNull(),
    torqueNm: integer("torque_nm").notNull(),
    wetWeightKg: integer("wet_weight_kg").notNull(),
    seatHeightMm: integer("seat_height_mm").notNull(),
    additionalSpecs: jsonb("additional_specs")
      .$type<Record<string, string | number | boolean>>()
      .default({})
      .notNull(),
    featured: boolean("featured").default(false).notNull(),
    configuratorEnabled: boolean("configurator_enabled")
      .default(false)
      .notNull(),
    status: contentStatus("status").default("draft").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("motorcycle_models_slug_uidx").on(table.slug),
    index("motorcycle_models_public_idx").on(
      table.status,
      table.categoryId,
      table.featured,
    ),
    check(
      "motorcycle_models_base_price_non_negative",
      sql`${table.basePriceMinor} >= 0`,
    ),
    check("motorcycle_models_power_positive", sql`${table.powerHp} > 0`),
    check("motorcycle_models_torque_positive", sql`${table.torqueNm} > 0`),
    check(
      "motorcycle_models_wet_weight_positive",
      sql`${table.wetWeightKg} > 0`,
    ),
    check(
      "motorcycle_models_seat_height_positive",
      sql`${table.seatHeightMm} > 0`,
    ),
    check(
      "motorcycle_models_currency_format",
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
  ],
).enableRLS();

export const modelFeatures = pgTable(
  "model_features",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => motorcycleModels.id, { onDelete: "restrict" }),
    groupName: varchar("group_name", { length: 100 }).notNull(),
    label: varchar("label", { length: 160 }).notNull(),
    value: text("value"),
    isStandard: boolean("is_standard").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("model_features_model_sort_idx").on(table.modelId, table.sortOrder),
    check(
      "model_features_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
).enableRLS();

export const accessoryCategories = pgTable(
  "accessory_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    status: contentStatus("status").default("draft").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("accessory_categories_slug_uidx").on(table.slug),
    index("accessory_categories_status_sort_idx").on(
      table.status,
      table.sortOrder,
    ),
    check(
      "accessory_categories_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
).enableRLS();

export const accessories = pgTable(
  "accessories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => accessoryCategories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    sku: varchar("sku", { length: 80 }).notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    priceMinor: integer("price_minor").notNull(),
    currency: varchar("currency", { length: 3 }).default("RON").notNull(),
    stockState: accessoryStockState("stock_state")
      .default("unavailable")
      .notNull(),
    internalQuantity: integer("internal_quantity"),
    featured: boolean("featured").default(false).notNull(),
    status: contentStatus("status").default("draft").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("accessories_slug_uidx").on(table.slug),
    uniqueIndex("accessories_sku_uidx").on(table.sku),
    index("accessories_public_idx").on(
      table.status,
      table.categoryId,
      table.featured,
      table.stockState,
    ),
    check("accessories_price_non_negative", sql`${table.priceMinor} >= 0`),
    check(
      "accessories_quantity_non_negative",
      sql`${table.internalQuantity} is null or ${table.internalQuantity} >= 0`,
    ),
    check("accessories_currency_format", sql`${table.currency} ~ '^[A-Z]{3}$'`),
  ],
).enableRLS();

export const optionGroups = pgTable(
  "option_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => motorcycleModels.id, { onDelete: "restrict" }),
    key: varchar("key", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    selectionType: selectionType("selection_type").notNull(),
    required: boolean("required").default(false).notNull(),
    minSelected: integer("min_selected").default(0).notNull(),
    maxSelected: integer("max_selected").default(1).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    status: contentStatus("status").default("draft").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("option_groups_model_key_uidx").on(table.modelId, table.key),
    index("option_groups_model_status_sort_idx").on(
      table.modelId,
      table.status,
      table.sortOrder,
    ),
    check("option_groups_min_non_negative", sql`${table.minSelected} >= 0`),
    check(
      "option_groups_max_not_below_min",
      sql`${table.maxSelected} >= ${table.minSelected}`,
    ),
    check(
      "option_groups_single_max_one",
      sql`${table.selectionType} <> 'single' or ${table.maxSelected} = 1`,
    ),
    check(
      "option_groups_required_minimum",
      sql`not ${table.required} or ${table.minSelected} >= 1`,
    ),
    check(
      "option_groups_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
).enableRLS();

export const optionChoices = pgTable(
  "option_choices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => optionGroups.id, { onDelete: "restrict" }),
    code: varchar("code", { length: 100 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description").notNull(),
    priceDeltaMinor: integer("price_delta_minor").default(0).notNull(),
    swatchHex: varchar("swatch_hex", { length: 7 }),
    mediaId: uuid("media_id").references(() => mediaAssets.id, {
      onDelete: "restrict",
    }),
    // The accessory foreign key is added in a custom migration to avoid a
    // circular declaration between catalogue and configurator tables.
    accessoryId: uuid("accessory_id"),
    isStandard: boolean("is_standard").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    status: contentStatus("status").default("draft").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("option_choices_group_code_uidx").on(table.groupId, table.code),
    index("option_choices_group_status_sort_idx").on(
      table.groupId,
      table.status,
      table.sortOrder,
    ),
    check(
      "option_choices_price_delta_non_negative",
      sql`${table.priceDeltaMinor} >= 0`,
    ),
    check(
      "option_choices_swatch_format",
      sql`${table.swatchHex} is null or ${table.swatchHex} ~ '^#[0-9A-Fa-f]{6}$'`,
    ),
    check(
      "option_choices_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
).enableRLS();

export const optionRules = pgTable(
  "option_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceChoiceId: uuid("source_choice_id")
      .notNull()
      .references(() => optionChoices.id, { onDelete: "restrict" }),
    targetChoiceId: uuid("target_choice_id")
      .notNull()
      .references(() => optionChoices.id, { onDelete: "restrict" }),
    ruleType: optionRuleType("rule_type").notNull(),
    explanation: text("explanation").notNull(),
  },
  (table) => [
    uniqueIndex("option_rules_unique_rule_uidx").on(
      table.sourceChoiceId,
      table.targetChoiceId,
      table.ruleType,
    ),
    index("option_rules_source_idx").on(table.sourceChoiceId),
    check(
      "option_rules_distinct_choices",
      sql`${table.sourceChoiceId} <> ${table.targetChoiceId}`,
    ),
  ],
).enableRLS();

export const modelMedia = pgTable(
  "model_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => motorcycleModels.id, { onDelete: "restrict" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    role: modelMediaRole("role").notNull(),
    // Added as a foreign key in the custom migration; see optionChoices.
    optionChoiceId: uuid("option_choice_id"),
    viewAngle: varchar("view_angle", { length: 80 }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("model_media_placement_uidx").on(
      table.modelId,
      table.mediaId,
      table.role,
      table.sortOrder,
    ),
    index("model_media_model_role_sort_idx").on(
      table.modelId,
      table.role,
      table.sortOrder,
    ),
    check("model_media_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
  ],
).enableRLS();

export const inventoryUnits = pgTable(
  "inventory_units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => motorcycleModels.id, { onDelete: "restrict" }),
    stockCode: varchar("stock_code", { length: 80 }).notNull(),
    vin: varchar("vin", { length: 17 }),
    condition: inventoryCondition("condition").default("new").notNull(),
    year: integer("year").notNull(),
    mileageKm: integer("mileage_km").default(0).notNull(),
    colour: varchar("colour", { length: 120 }).notNull(),
    priceMinor: integer("price_minor").notNull(),
    currency: varchar("currency", { length: 3 }).default("RON").notNull(),
    status: inventoryStatus("status").default("incoming").notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    privateNotes: text("private_notes"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("inventory_units_stock_code_uidx").on(table.stockCode),
    uniqueIndex("inventory_units_vin_uidx").on(table.vin),
    index("inventory_units_public_status_idx").on(
      table.isPublic,
      table.status,
      table.modelId,
    ),
    check("inventory_units_mileage_non_negative", sql`${table.mileageKm} >= 0`),
    check("inventory_units_price_non_negative", sql`${table.priceMinor} >= 0`),
    check(
      "inventory_units_currency_format",
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
    check(
      "inventory_units_vin_length",
      sql`${table.vin} is null or length(${table.vin}) = 17`,
    ),
  ],
).enableRLS();

export const inventoryMedia = pgTable(
  "inventory_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inventoryUnitId: uuid("inventory_unit_id")
      .notNull()
      .references(() => inventoryUnits.id, { onDelete: "restrict" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("inventory_media_placement_uidx").on(
      table.inventoryUnitId,
      table.mediaId,
    ),
    index("inventory_media_unit_sort_idx").on(
      table.inventoryUnitId,
      table.sortOrder,
    ),
    check(
      "inventory_media_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
).enableRLS();

export const accessoryMedia = pgTable(
  "accessory_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accessoryId: uuid("accessory_id")
      .notNull()
      .references(() => accessories.id, { onDelete: "restrict" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("accessory_media_placement_uidx").on(
      table.accessoryId,
      table.mediaId,
    ),
    index("accessory_media_accessory_sort_idx").on(
      table.accessoryId,
      table.sortOrder,
    ),
    check(
      "accessory_media_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
).enableRLS();

export const accessoryCompatibility = pgTable(
  "accessory_compatibility",
  {
    accessoryId: uuid("accessory_id")
      .notNull()
      .references(() => accessories.id, { onDelete: "restrict" }),
    modelId: uuid("model_id")
      .notNull()
      .references(() => motorcycleModels.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({ columns: [table.accessoryId, table.modelId] }),
    index("accessory_compatibility_model_idx").on(table.modelId),
  ],
).enableRLS();

export const discoverCategories = pgTable(
  "discover_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("discover_categories_slug_uidx").on(table.slug),
    check(
      "discover_categories_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
).enableRLS();

export const discoverPosts = pgTable(
  "discover_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => discoverCategories.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    excerpt: text("excerpt").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "restrict",
    }),
    featured: boolean("featured").default(false).notNull(),
    status: contentStatus("status").default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    seoTitle: varchar("seo_title", { length: 70 }),
    seoDescription: varchar("seo_description", { length: 170 }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("discover_posts_slug_uidx").on(table.slug),
    index("discover_posts_public_idx").on(
      table.status,
      table.publishedAt,
      table.featured,
    ),
  ],
).enableRLS();

export type ModelIdentitySnapshot = {
  slug: string;
  name: string;
  modelYear: number;
};

export type SelectedChoiceSnapshot = {
  groupKey: string;
  groupName: string;
  choiceCode: string;
  choiceName: string;
  priceDeltaMinor: number;
};

export const configurationSnapshots = pgTable(
  "configuration_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicReference: varchar("public_reference", { length: 32 }).notNull(),
    modelId: uuid("model_id").references(() => motorcycleModels.id, {
      onDelete: "set null",
    }),
    modelIdentity: jsonb("model_identity")
      .$type<ModelIdentitySnapshot>()
      .notNull(),
    basePriceMinor: integer("base_price_minor").notNull(),
    selectedChoices: jsonb("selected_choices")
      .$type<SelectedChoiceSnapshot[]>()
      .notNull(),
    totalPriceMinor: integer("total_price_minor").notNull(),
    currency: varchar("currency", { length: 3 }).default("RON").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("configuration_snapshots_public_reference_uidx").on(
      table.publicReference,
    ),
    index("configuration_snapshots_model_idx").on(table.modelId),
    check(
      "configuration_snapshots_base_price_non_negative",
      sql`${table.basePriceMinor} >= 0`,
    ),
    check(
      "configuration_snapshots_total_price_non_negative",
      sql`${table.totalPriceMinor} >= 0`,
    ),
    check(
      "configuration_snapshots_currency_format",
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
  ],
).enableRLS();

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: inquiryType("type").notNull(),
    configurationSnapshotId: uuid("configuration_snapshot_id").references(
      () => configurationSnapshots.id,
      { onDelete: "set null" },
    ),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    subject: varchar("subject", { length: 200 }).notNull(),
    message: text("message").notNull(),
    preferredContactMethod: contactMethod("preferred_contact_method")
      .default("email")
      .notNull(),
    privacyPolicyVersion: varchar("privacy_policy_version", {
      length: 32,
    }).notNull(),
    privacyAcknowledgedAt: timestamp("privacy_acknowledged_at", {
      withTimezone: true,
    }).notNull(),
    status: inquiryStatus("status").default("new").notNull(),
    privateAdminNotes: text("private_admin_notes"),
    ...timestamps(),
  },
  (table) => [
    index("inquiries_status_created_idx").on(table.status, table.createdAt),
    index("inquiries_configuration_idx").on(table.configurationSnapshotId),
  ],
).enableRLS();

export const publicActionRateLimits = pgTable(
  "public_action_rate_limits",
  {
    scope: varchar("scope", { length: 40 }).notNull(),
    keyHash: varchar("key_hash", { length: 64 }).notNull(),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    requestCount: integer("request_count").default(1).notNull(),
    ...timestamps(),
  },
  (table) => [
    primaryKey({ columns: [table.scope, table.keyHash] }),
    index("public_action_rate_limits_updated_idx").on(table.updatedAt),
    check(
      "public_action_rate_limits_count_positive",
      sql`${table.requestCount} > 0`,
    ),
  ],
).enableRLS();

export type OpeningHours = Record<
  string,
  { closed?: boolean; opens?: string; closes?: string }
>;
export type SocialLinks = Record<string, string>;

export const siteSettings = pgTable(
  "site_settings",
  {
    id: varchar("id", { length: 32 }).default("primary").primaryKey(),
    contactEmail: varchar("contact_email", { length: 320 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 40 }).notNull(),
    address: text("address").notNull(),
    openingHours: jsonb("opening_hours").$type<OpeningHours>().notNull(),
    socialLinks: jsonb("social_links")
      .$type<SocialLinks>()
      .default({})
      .notNull(),
    defaultSeoTitle: varchar("default_seo_title", { length: 70 }).notNull(),
    defaultSeoDescription: varchar("default_seo_description", {
      length: 170,
    }).notNull(),
    ...timestamps(),
  },
  (table) => [check("site_settings_singleton", sql`${table.id} = 'primary'`)],
).enableRLS();
