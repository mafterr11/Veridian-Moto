CREATE TYPE "public"."accessory_stock_state" AS ENUM('in_stock', 'low_stock', 'preorder', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('admin');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('email', 'phone');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'contacted', 'closed', 'spam');--> statement-breakpoint
CREATE TYPE "public"."inquiry_type" AS ENUM('contact', 'configuration');--> statement-breakpoint
CREATE TYPE "public"."inventory_condition" AS ENUM('new', 'used', 'demo');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('incoming', 'available', 'reserved', 'sold', 'archived');--> statement-breakpoint
CREATE TYPE "public"."model_media_role" AS ENUM('card', 'hero', 'gallery', 'configurator_base', 'configurator_overlay');--> statement-breakpoint
CREATE TYPE "public"."option_rule_type" AS ENUM('requires', 'excludes');--> statement-breakpoint
CREATE TYPE "public"."selection_type" AS ENUM('single', 'multiple');--> statement-breakpoint
CREATE TABLE "accessories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"sku" varchar(80) NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'RON' NOT NULL,
	"stock_state" "accessory_stock_state" DEFAULT 'unavailable' NOT NULL,
	"internal_quantity" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accessories_price_non_negative" CHECK ("accessories"."price_minor" >= 0),
	CONSTRAINT "accessories_quantity_non_negative" CHECK ("accessories"."internal_quantity" is null or "accessories"."internal_quantity" >= 0),
	CONSTRAINT "accessories_currency_format" CHECK ("accessories"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
ALTER TABLE "accessories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "accessory_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accessory_categories_sort_order_non_negative" CHECK ("accessory_categories"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "accessory_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "accessory_compatibility" (
	"accessory_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	CONSTRAINT "accessory_compatibility_accessory_id_model_id_pk" PRIMARY KEY("accessory_id","model_id")
);
--> statement-breakpoint
ALTER TABLE "accessory_compatibility" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "accessory_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accessory_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "accessory_media_sort_order_non_negative" CHECK ("accessory_media"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "accessory_media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admin_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"hero_media_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_sort_order_non_negative" CHECK ("categories"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "configuration_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_reference" varchar(32) NOT NULL,
	"model_id" uuid,
	"model_identity" jsonb NOT NULL,
	"base_price_minor" integer NOT NULL,
	"selected_choices" jsonb NOT NULL,
	"total_price_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'RON' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "configuration_snapshots_base_price_non_negative" CHECK ("configuration_snapshots"."base_price_minor" >= 0),
	CONSTRAINT "configuration_snapshots_total_price_non_negative" CHECK ("configuration_snapshots"."total_price_minor" >= 0),
	CONSTRAINT "configuration_snapshots_currency_format" CHECK ("configuration_snapshots"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
ALTER TABLE "configuration_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "discover_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "discover_categories_sort_order_non_negative" CHECK ("discover_categories"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "discover_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "discover_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"excerpt" text NOT NULL,
	"body_markdown" text NOT NULL,
	"cover_media_id" uuid,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" varchar(70),
	"seo_description" varchar(170),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discover_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "inquiry_type" NOT NULL,
	"configuration_snapshot_id" uuid,
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(40),
	"subject" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"preferred_contact_method" "contact_method" DEFAULT 'email' NOT NULL,
	"privacy_policy_version" varchar(32) NOT NULL,
	"privacy_acknowledged_at" timestamp with time zone NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"private_admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_unit_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "inventory_media_sort_order_non_negative" CHECK ("inventory_media"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "inventory_media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"stock_code" varchar(80) NOT NULL,
	"vin" varchar(17),
	"condition" "inventory_condition" DEFAULT 'new' NOT NULL,
	"year" integer NOT NULL,
	"mileage_km" integer DEFAULT 0 NOT NULL,
	"colour" varchar(120) NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'RON' NOT NULL,
	"status" "inventory_status" DEFAULT 'incoming' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"private_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_units_mileage_non_negative" CHECK ("inventory_units"."mileage_km" >= 0),
	CONSTRAINT "inventory_units_price_non_negative" CHECK ("inventory_units"."price_minor" >= 0),
	CONSTRAINT "inventory_units_currency_format" CHECK ("inventory_units"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "inventory_units_vin_length" CHECK ("inventory_units"."vin" is null or length("inventory_units"."vin") = 17)
);
--> statement-breakpoint
ALTER TABLE "inventory_units" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"alt_text" text NOT NULL,
	"blur_data_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_width_positive" CHECK ("media_assets"."width" > 0),
	CONSTRAINT "media_assets_height_positive" CHECK ("media_assets"."height" > 0),
	CONSTRAINT "media_assets_file_size_non_negative" CHECK ("media_assets"."file_size_bytes" >= 0)
);
--> statement-breakpoint
ALTER TABLE "media_assets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "model_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"group_name" varchar(100) NOT NULL,
	"label" varchar(160) NOT NULL,
	"value" text,
	"is_standard" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "model_features_sort_order_non_negative" CHECK ("model_features"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "model_features" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "model_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"role" "model_media_role" NOT NULL,
	"option_choice_id" uuid,
	"view_angle" varchar(80),
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "model_media_sort_order_non_negative" CHECK ("model_media"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "model_media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "motorcycle_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"tagline" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"model_year" integer NOT NULL,
	"base_price_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'RON' NOT NULL,
	"displacement_cc" integer,
	"power_hp" integer NOT NULL,
	"torque_nm" integer NOT NULL,
	"wet_weight_kg" integer NOT NULL,
	"seat_height_mm" integer NOT NULL,
	"additional_specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"configurator_enabled" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "motorcycle_models_base_price_non_negative" CHECK ("motorcycle_models"."base_price_minor" >= 0),
	CONSTRAINT "motorcycle_models_power_positive" CHECK ("motorcycle_models"."power_hp" > 0),
	CONSTRAINT "motorcycle_models_torque_positive" CHECK ("motorcycle_models"."torque_nm" > 0),
	CONSTRAINT "motorcycle_models_wet_weight_positive" CHECK ("motorcycle_models"."wet_weight_kg" > 0),
	CONSTRAINT "motorcycle_models_seat_height_positive" CHECK ("motorcycle_models"."seat_height_mm" > 0),
	CONSTRAINT "motorcycle_models_currency_format" CHECK ("motorcycle_models"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
ALTER TABLE "motorcycle_models" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "option_choices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"price_delta_minor" integer DEFAULT 0 NOT NULL,
	"swatch_hex" varchar(7),
	"media_id" uuid,
	"accessory_id" uuid,
	"is_standard" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "option_choices_price_delta_non_negative" CHECK ("option_choices"."price_delta_minor" >= 0),
	CONSTRAINT "option_choices_swatch_format" CHECK ("option_choices"."swatch_hex" is null or "option_choices"."swatch_hex" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "option_choices_sort_order_non_negative" CHECK ("option_choices"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "option_choices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "option_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"key" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"selection_type" "selection_type" NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"min_selected" integer DEFAULT 0 NOT NULL,
	"max_selected" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "option_groups_min_non_negative" CHECK ("option_groups"."min_selected" >= 0),
	CONSTRAINT "option_groups_max_not_below_min" CHECK ("option_groups"."max_selected" >= "option_groups"."min_selected"),
	CONSTRAINT "option_groups_single_max_one" CHECK ("option_groups"."selection_type" <> 'single' or "option_groups"."max_selected" = 1),
	CONSTRAINT "option_groups_required_minimum" CHECK (not "option_groups"."required" or "option_groups"."min_selected" >= 1),
	CONSTRAINT "option_groups_sort_order_non_negative" CHECK ("option_groups"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "option_groups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "option_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_choice_id" uuid NOT NULL,
	"target_choice_id" uuid NOT NULL,
	"rule_type" "option_rule_type" NOT NULL,
	"explanation" text NOT NULL,
	CONSTRAINT "option_rules_distinct_choices" CHECK ("option_rules"."source_choice_id" <> "option_rules"."target_choice_id")
);
--> statement-breakpoint
ALTER TABLE "option_rules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" varchar(32) PRIMARY KEY DEFAULT 'primary' NOT NULL,
	"contact_email" varchar(320) NOT NULL,
	"contact_phone" varchar(40) NOT NULL,
	"address" text NOT NULL,
	"opening_hours" jsonb NOT NULL,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"default_seo_title" varchar(70) NOT NULL,
	"default_seo_description" varchar(170) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton" CHECK ("site_settings"."id" = 'primary')
);
--> statement-breakpoint
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accessories" ADD CONSTRAINT "accessories_category_id_accessory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."accessory_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accessory_compatibility" ADD CONSTRAINT "accessory_compatibility_accessory_id_accessories_id_fk" FOREIGN KEY ("accessory_id") REFERENCES "public"."accessories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accessory_compatibility" ADD CONSTRAINT "accessory_compatibility_model_id_motorcycle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."motorcycle_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accessory_media" ADD CONSTRAINT "accessory_media_accessory_id_accessories_id_fk" FOREIGN KEY ("accessory_id") REFERENCES "public"."accessories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accessory_media" ADD CONSTRAINT "accessory_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_hero_media_id_media_assets_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_snapshots" ADD CONSTRAINT "configuration_snapshots_model_id_motorcycle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."motorcycle_models"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discover_posts" ADD CONSTRAINT "discover_posts_category_id_discover_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."discover_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discover_posts" ADD CONSTRAINT "discover_posts_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_configuration_snapshot_id_configuration_snapshots_id_fk" FOREIGN KEY ("configuration_snapshot_id") REFERENCES "public"."configuration_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_media" ADD CONSTRAINT "inventory_media_inventory_unit_id_inventory_units_id_fk" FOREIGN KEY ("inventory_unit_id") REFERENCES "public"."inventory_units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_media" ADD CONSTRAINT "inventory_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_units" ADD CONSTRAINT "inventory_units_model_id_motorcycle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."motorcycle_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_features" ADD CONSTRAINT "model_features_model_id_motorcycle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."motorcycle_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_media" ADD CONSTRAINT "model_media_model_id_motorcycle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."motorcycle_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_media" ADD CONSTRAINT "model_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motorcycle_models" ADD CONSTRAINT "motorcycle_models_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_choices" ADD CONSTRAINT "option_choices_group_id_option_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."option_groups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_choices" ADD CONSTRAINT "option_choices_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_groups" ADD CONSTRAINT "option_groups_model_id_motorcycle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."motorcycle_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_source_choice_id_option_choices_id_fk" FOREIGN KEY ("source_choice_id") REFERENCES "public"."option_choices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_target_choice_id_option_choices_id_fk" FOREIGN KEY ("target_choice_id") REFERENCES "public"."option_choices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accessories_slug_uidx" ON "accessories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "accessories_sku_uidx" ON "accessories" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "accessories_public_idx" ON "accessories" USING btree ("status","category_id","featured","stock_state");--> statement-breakpoint
CREATE UNIQUE INDEX "accessory_categories_slug_uidx" ON "accessory_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "accessory_categories_status_sort_idx" ON "accessory_categories" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "accessory_compatibility_model_idx" ON "accessory_compatibility" USING btree ("model_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accessory_media_placement_uidx" ON "accessory_media" USING btree ("accessory_id","media_id");--> statement-breakpoint
CREATE INDEX "accessory_media_accessory_sort_idx" ON "accessory_media" USING btree ("accessory_id","sort_order");--> statement-breakpoint
CREATE INDEX "admin_profiles_active_idx" ON "admin_profiles" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_uidx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_status_sort_idx" ON "categories" USING btree ("status","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "configuration_snapshots_public_reference_uidx" ON "configuration_snapshots" USING btree ("public_reference");--> statement-breakpoint
CREATE INDEX "configuration_snapshots_model_idx" ON "configuration_snapshots" USING btree ("model_id");--> statement-breakpoint
CREATE UNIQUE INDEX "discover_categories_slug_uidx" ON "discover_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "discover_posts_slug_uidx" ON "discover_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "discover_posts_public_idx" ON "discover_posts" USING btree ("status","published_at","featured");--> statement-breakpoint
CREATE INDEX "inquiries_status_created_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "inquiries_configuration_idx" ON "inquiries" USING btree ("configuration_snapshot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_media_placement_uidx" ON "inventory_media" USING btree ("inventory_unit_id","media_id");--> statement-breakpoint
CREATE INDEX "inventory_media_unit_sort_idx" ON "inventory_media" USING btree ("inventory_unit_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_units_stock_code_uidx" ON "inventory_units" USING btree ("stock_code");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_units_vin_uidx" ON "inventory_units" USING btree ("vin");--> statement-breakpoint
CREATE INDEX "inventory_units_public_status_idx" ON "inventory_units" USING btree ("is_public","status","model_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_storage_path_uidx" ON "media_assets" USING btree ("storage_path");--> statement-breakpoint
CREATE INDEX "model_features_model_sort_idx" ON "model_features" USING btree ("model_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "model_media_placement_uidx" ON "model_media" USING btree ("model_id","media_id","role","sort_order");--> statement-breakpoint
CREATE INDEX "model_media_model_role_sort_idx" ON "model_media" USING btree ("model_id","role","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "motorcycle_models_slug_uidx" ON "motorcycle_models" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "motorcycle_models_public_idx" ON "motorcycle_models" USING btree ("status","category_id","featured");--> statement-breakpoint
CREATE UNIQUE INDEX "option_choices_group_code_uidx" ON "option_choices" USING btree ("group_id","code");--> statement-breakpoint
CREATE INDEX "option_choices_group_status_sort_idx" ON "option_choices" USING btree ("group_id","status","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "option_groups_model_key_uidx" ON "option_groups" USING btree ("model_id","key");--> statement-breakpoint
CREATE INDEX "option_groups_model_status_sort_idx" ON "option_groups" USING btree ("model_id","status","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "option_rules_unique_rule_uidx" ON "option_rules" USING btree ("source_choice_id","target_choice_id","rule_type");--> statement-breakpoint
CREATE INDEX "option_rules_source_idx" ON "option_rules" USING btree ("source_choice_id");