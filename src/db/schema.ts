import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  vector,
} from "drizzle-orm/pg-core";

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey(),
  location: text("location"),
  onboardingComplete: timestamp("onboarding_complete"),
});

// User tags table (many-to-many relationship)
export const userTags = pgTable(
  "user_tags",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userPreferences.userId, { onDelete: "cascade" }),
    isOffer: boolean("is_offer").notNull(),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.tagId, table.isOffer] }),
  ]
);

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userPreferences.userId, { onDelete: "cascade" }),
  active: boolean("active").notNull(),
  imageUrl: text("image_url"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  repeatable: boolean("repeatable").notNull(),
  embedding: vector({ dimensions: 1536 }),
});

// Item tags table (many-to-many relationship)
export const itemTags = pgTable(
  "item_tags",
  {
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.tagId] })]
);

// Offers table (pending offers)
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Offer history table
export const offerHistory = pgTable("offer_history", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .references(() => items.id)
    .notNull(),
  offeredItemId: integer("offered_item_id")
    .references(() => items.id)
    .notNull(),
  expiry: timestamp("expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectReason: text("reject_reason"),
});

// User reviews table
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  itemId: integer("item_id")
    .references(() => items.id)
    .notNull(),
  value: integer("value").notNull(), // Rating value (1-5)
  comment: text("comment"),
});

// Relations
export const tagsRelations = relations(tags, ({ many }) => ({
  tagItems: many(itemTags),
  userTags: many(userTags),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ many }) => ({
    items: many(items),
    userTags: many(userTags),
  })
);

export const itemsRelations = relations(items, ({ many, one }) => ({
  itemTags: many(itemTags),
  userPreferences: one(userPreferences, {
    fields: [items.userId],
    references: [userPreferences.userId],
  }),
}));

export const userTagsRelations = relations(userTags, ({ one }) => ({
  userPreference: one(userPreferences, {
    fields: [userTags.userId],
    references: [userPreferences.userId],
  }),
  tag: one(tags, {
    fields: [userTags.tagId],
    references: [tags.id],
  }),
}));

export const itemTagsRelations = relations(itemTags, ({ one }) => ({
  item: one(items, {
    fields: [itemTags.itemId],
    references: [items.id],
  }),
  tag: one(tags, {
    fields: [itemTags.tagId],
    references: [tags.id],
  }),
}));

export type UserReviews = typeof userReviews.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect & {
  items?: Item[];
  userTags?: UserTags[];
};
export type UserTags = typeof userTags.$inferSelect & {
  userPreference?: UserPreferences;
  tag?: Tag;
};
export type Item = typeof items.$inferSelect & {
  itemTags?: ItemTags[];
  userPreferences?: UserPreferences;
};
export type ItemTags = typeof itemTags.$inferSelect & {
  item?: Item;
  tag?: Tag;
};
export type Offers = typeof offers.$inferSelect;
export type OfferHistory = typeof offerHistory.$inferSelect;
export type Tag = typeof tags.$inferSelect & {
  itemTags?: ItemTags[];
  userTags?: UserTags[];
};

export type InsertUserPreferences = typeof userPreferences.$inferInsert;
export type InsertUserTags = typeof userTags.$inferInsert;
export type InsertItems = typeof items.$inferInsert;
export type InsertItemTags = typeof itemTags.$inferInsert;
export type InsertOffers = typeof offers.$inferInsert;
export type InsertOfferHistory = typeof offerHistory.$inferInsert;
export type InsertUserReviews = typeof userReviews.$inferInsert;
