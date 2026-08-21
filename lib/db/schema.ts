import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  favicon: text("favicon"),
  description: text("description"),
  amount: integer("amount").notNull(),
  clicks: integer("clicks").notNull().default(0),
  language: text("language"),
  langColor: text("lang_color"),
  // Payment fields
  paid: boolean("paid").notNull().default(false),
  checkoutId: text("checkout_id"),           // Polar checkout session ID
  customerEmail: text("customer_email"),     // for Polar receipt matching
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;

