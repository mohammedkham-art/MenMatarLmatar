CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "airlines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "code" text NOT NULL UNIQUE,
  "logo_url" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "airlines_code_iata_check" CHECK ("code" ~ '^[A-Z0-9]{2}$')
);

CREATE TABLE IF NOT EXISTS "airline_fares" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "airline_id" uuid NOT NULL REFERENCES "airlines"("id") ON DELETE CASCADE,
  "fare_name" text NOT NULL,
  "personal_item" boolean NOT NULL DEFAULT true,
  "personal_item_dimensions" text,
  "cabin_allowed" boolean NOT NULL DEFAULT false,
  "cabin_weight_kg" integer,
  "cabin_dimensions" text,
  "checked_allowed" boolean NOT NULL DEFAULT false,
  "checked_weight_kg" integer,
  "checked_count" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "airline_fares_airline_id_fare_name_key" UNIQUE ("airline_id", "fare_name")
);

ALTER TABLE "deals"
  ADD COLUMN IF NOT EXISTS "slug" text,
  ADD COLUMN IF NOT EXISTS "airline_id" uuid REFERENCES "airlines"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "fare_id" uuid REFERENCES "airline_fares"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "last_checked_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "is_test" boolean NOT NULL DEFAULT false;

UPDATE "deals"
SET "slug" = lower(regexp_replace(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || left("id"::text, 8)
WHERE "slug" IS NULL OR length(trim("slug")) = 0;

ALTER TABLE "deals"
  ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "deals_slug_key" ON "deals"("slug");
CREATE INDEX IF NOT EXISTS "airline_fares_airline_id_idx" ON "airline_fares"("airline_id");
CREATE INDEX IF NOT EXISTS "deals_airline_id_idx" ON "deals"("airline_id");
CREATE INDEX IF NOT EXISTS "deals_fare_id_idx" ON "deals"("fare_id");
CREATE INDEX IF NOT EXISTS "deals_is_active_departure_date_idx" ON "deals"("is_active", "departure_date");
