ALTER TABLE "attraction" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "attraction"
SET "slug" = regexp_replace(lower("id"), '[^a-z0-9]+', '-', 'g')
WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "attraction" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attraction" ADD CONSTRAINT "attraction_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "attraction" ADD COLUMN "opening_hours" text;--> statement-breakpoint
ALTER TABLE "attraction" ADD COLUMN "travel_tips" text;--> statement-breakpoint
ALTER TABLE "attraction" ADD COLUMN "estimated_cost_lkr" integer;--> statement-breakpoint
ALTER TABLE "attraction" ADD COLUMN "transport_info" text;--> statement-breakpoint
ALTER TABLE "attraction" ADD COLUMN "accessibility_info" text;--> statement-breakpoint
ALTER TABLE "attraction" ADD COLUMN "crowd_level" text;--> statement-breakpoint
ALTER TABLE "attraction" ADD COLUMN "disclaimer" text;--> statement-breakpoint
CREATE TABLE "attraction_images" (
  "id" text PRIMARY KEY NOT NULL,
  "attraction_id" text NOT NULL,
  "url" text NOT NULL,
  "alt_text" text,
  "is_primary" boolean DEFAULT false NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "attraction_images" ADD CONSTRAINT "attraction_images_attraction_id_attraction_id_fk" FOREIGN KEY ("attraction_id") REFERENCES "public"."attraction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "attraction_images" (
  "id",
  "attraction_id",
  "url",
  "alt_text",
  "is_primary",
  "position",
  "created_at"
)
SELECT
  "attraction"."id" || '-image-' || image_values."ordinality",
  "attraction"."id",
  image_values."url",
  "attraction"."name" || ' image ' || image_values."ordinality",
  image_values."ordinality" = 1,
  image_values."ordinality" - 1,
  now()
FROM "attraction"
CROSS JOIN LATERAL unnest("attraction"."images") WITH ORDINALITY AS image_values("url", "ordinality")
WHERE "attraction"."images" IS NOT NULL
  AND image_values."url" IS NOT NULL
  AND image_values."url" <> '';--> statement-breakpoint
ALTER TABLE "attraction" DROP COLUMN "images";--> statement-breakpoint
CREATE INDEX "attraction_slug_idx" ON "attraction" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "attraction_image_attraction_idx" ON "attraction_images" USING btree ("attraction_id");--> statement-breakpoint
CREATE INDEX "attraction_image_position_idx" ON "attraction_images" USING btree ("attraction_id","position");
