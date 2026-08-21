import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
