import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  numeric,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["admin", "tourist"])

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("tourist"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    icon: text("icon"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("category_slug_idx").on(table.slug),
    index("category_name_idx").on(table.name),
  ]
)

export const attraction = pgTable(
  "attraction",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description"),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
    address: text("address"),
    distanceFromBeragalaKm: numeric("distance_from_beragala_km", {
      precision: 5,
      scale: 2,
    }),
    images: text("images").array(),
    suggestedVisitDurationMinutes: integer("suggested_visit_duration_minutes"),
    bestTimeToVisit: text("best_time_to_visit"),
    weatherNote: text("weather_note"),
    safetyNote: text("safety_note"),
    isPopular: boolean("is_popular").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("attraction_category_idx").on(table.categoryId),
    index("attraction_active_idx").on(table.isActive),
    index("attraction_popular_idx").on(table.isPopular),
    index("attraction_location_idx").on(table.latitude, table.longitude),
  ]
)

export const itinerary = pgTable(
  "itinerary",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    plannedDate: timestamp("planned_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("itinerary_user_idx").on(table.userId),
    index("itinerary_date_idx").on(table.plannedDate),
  ]
)

export const itineraryItem = pgTable(
  "itinerary_item",
  {
    id: text("id").primaryKey(),
    itineraryId: text("itinerary_id")
      .notNull()
      .references(() => itinerary.id, { onDelete: "cascade" }),
    attractionId: text("attraction_id")
      .notNull()
      .references(() => attraction.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    visitDurationMinutes: integer("visit_duration_minutes"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("itinerary_item_itinerary_idx").on(table.itineraryId),
    index("itinerary_item_attraction_idx").on(table.attractionId),
    index("itinerary_item_order_idx").on(table.itineraryId, table.order),
  ]
)

export const categoryRelations = relations(category, ({ many }) => ({
  attractions: many(attraction),
}))

export const attractionRelations = relations(attraction, ({ one, many }) => ({
  category: one(category, {
    fields: [attraction.categoryId],
    references: [category.id],
  }),
  itineraryItems: many(itineraryItem),
}))

export const itineraryRelations = relations(itinerary, ({ one, many }) => ({
  user: one(user, {
    fields: [itinerary.userId],
    references: [user.id],
  }),
  items: many(itineraryItem),
}))

export const itineraryItemRelations = relations(itineraryItem, ({ one }) => ({
  itinerary: one(itinerary, {
    fields: [itineraryItem.itineraryId],
    references: [itinerary.id],
  }),
  attraction: one(attraction, {
    fields: [itineraryItem.attractionId],
    references: [attraction.id],
  }),
}))
