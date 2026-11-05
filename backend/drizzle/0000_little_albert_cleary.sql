CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(30) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_format_check" CHECK ("users"."username" ~ '^[a-z0-9_]{3,30}$'),
	CONSTRAINT "users_display_name_length_check" CHECK (char_length("users"."display_name") BETWEEN 1 AND 50),
	CONSTRAINT "users_bio_length_check" CHECK ("users"."bio" IS NULL OR char_length("users"."bio") <= 160)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree (lower("username"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));