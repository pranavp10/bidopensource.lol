import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  favicon: text("favicon"),
  description: text("description"),
  amount: integer("amount").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  stars: integer("stars").notNull().default(0),
  forks: integer("forks").notNull().default(0),
  language: text("language"),
  langColor: text("lang_color"),
  paid: boolean("paid").notNull().default(true),
  checkoutId: text("checkout_id"),
  customerEmail: text("customer_email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'bid' | 'dethrone' | 'milestone'
  title: text("title").notNull(),
  description: text("description"),
  amount: integer("amount").notNull().default(0),
  bidName: text("bid_name").notNull(),
  rank: integer("rank").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
