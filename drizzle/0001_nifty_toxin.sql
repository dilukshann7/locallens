CREATE TYPE "public"."user_role" AS ENUM('admin', 'tourist');--> statement-breakpoint
CREATE TABLE "attraction" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"category_id" text,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"address" text,
	"distance_from_beragala_km" numeric(5, 2),
	"images" text[],
	"suggested_visit_duration_minutes" integer,
	"best_time_to_visit" text,
	"weather_note" text,
	"safety_note" text,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name"),
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "itinerary" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"planned_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_item" (
	"id" text PRIMARY KEY NOT NULL,
	"itinerary_id" text NOT NULL,
	"attraction_id" text NOT NULL,
	"order" integer NOT NULL,
	"visit_duration_minutes" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'tourist' NOT NULL;--> statement-breakpoint
ALTER TABLE "attraction" ADD CONSTRAINT "attraction_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_itinerary_id_itinerary_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."itinerary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_attraction_id_attraction_id_fk" FOREIGN KEY ("attraction_id") REFERENCES "public"."attraction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attraction_category_idx" ON "attraction" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "attraction_active_idx" ON "attraction" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "attraction_popular_idx" ON "attraction" USING btree ("is_popular");--> statement-breakpoint
CREATE INDEX "attraction_location_idx" ON "attraction" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_name_idx" ON "category" USING btree ("name");--> statement-breakpoint
CREATE INDEX "itinerary_user_idx" ON "itinerary" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "itinerary_date_idx" ON "itinerary" USING btree ("planned_date");--> statement-breakpoint
CREATE INDEX "itinerary_item_itinerary_idx" ON "itinerary_item" USING btree ("itinerary_id");--> statement-breakpoint
CREATE INDEX "itinerary_item_attraction_idx" ON "itinerary_item" USING btree ("attraction_id");--> statement-breakpoint
CREATE INDEX "itinerary_item_order_idx" ON "itinerary_item" USING btree ("itinerary_id","order");