CREATE TABLE "public_action_rate_limits" (
	"scope" varchar(40) NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_action_rate_limits_scope_key_hash_pk" PRIMARY KEY("scope","key_hash"),
	CONSTRAINT "public_action_rate_limits_count_positive" CHECK ("public_action_rate_limits"."request_count" > 0)
);
--> statement-breakpoint
ALTER TABLE "public_action_rate_limits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "public_action_rate_limits_updated_idx" ON "public_action_rate_limits" USING btree ("updated_at");