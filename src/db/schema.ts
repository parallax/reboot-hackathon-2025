import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
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
    userId: text("user_id"),
    isOffer: boolean("is_offer").notNull(),
    tagId: integer("tag_id").references(() => tags.id),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.userId, table.tagId, table.isOffer] }),
    },
  ]
);

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  active: boolean("active").notNull(),
  imageUrl: text("image_url"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  repeatable: boolean("repeatable").notNull(),
});

// Item tags table (many-to-many relationship)
export const itemTags = pgTable(
  "item_tags",
  {
    itemId: integer("item_id").references(() => items.id),
    tagId: integer("tag_id").references(() => tags.id),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.itemId, table.tagId] }),
    },
  ]
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
