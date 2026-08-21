/**
 * Seed script — run once after `bun run db:push`
 *
 * Usage:
 *   bun run db:seed
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { bids } from "../lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌  DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const SEED_BIDS = [
  {
    name: "trycomp.ai",
    url: "https://trycomp.ai",
    favicon: "https://www.google.com/s2/favicons?domain=trycomp.ai&sz=64",
    description:
      "Automate SOC 2, ISO 27001, HIPAA, and GDPR. 580+ integrations, 1,000+ companies, audit-ready in days.",
    amount: 10000,
    clicks: 8505,
    language: "TypeScript",
    langColor: "#3178c6",
  },
  {
    name: "lathire.com",
    url: "https://lathire.com",
    favicon: "https://www.google.com/s2/favicons?domain=lathire.com&sz=64",
    description:
      "Latin America's largest talent marketplace. Hire vetted tech and generalist professionals in as little as 24 hours, for up to 80% less.",
    amount: 3100,
    clicks: 1556,
    language: "JavaScript",
    langColor: "#f1e05a",
  },
  {
    name: "mytb.ai",
    url: "https://mytb.ai",
    favicon: "https://www.google.com/s2/favicons?domain=mytb.ai&sz=64",
    description:
      "Automated, accurate, actionable bookkeeping and trial balance software for modern accounting firms.",
    amount: 2999,
    clicks: 767,
    language: "Python",
    langColor: "#3572A5",
  },
  {
    name: "linear.app",
    url: "https://linear.app",
    favicon: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
    description:
      "The issue tracking tool that developers love. Built for speed and designed for clarity.",
    amount: 2499,
    clicks: 432,
    language: "TypeScript",
    langColor: "#3178c6",
  },
  {
    name: "vercel.com",
    url: "https://vercel.com",
    favicon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
    description:
      "Frontend cloud for developers. Frameworks, workflows, and infrastructure to build a faster, more personalized Web.",
    amount: 1999,
    clicks: 389,
    language: "Go",
    langColor: "#00ADD8",
  },
  {
    name: "raycast.com",
    url: "https://raycast.com",
    favicon: "https://www.google.com/s2/favicons?domain=raycast.com&sz=64",
    description:
      "A blazingly fast, totally extendable launcher for developers. Complete tasks, calculate, share links.",
    amount: 1500,
    clicks: 251,
    language: "Swift",
    langColor: "#F05138",
  },
  {
    name: "retool.com",
    url: "https://retool.com",
    favicon: "https://www.google.com/s2/favicons?domain=retool.com&sz=64",
    description:
      "Build internal tools, remarkably fast. Drag-and-drop building blocks connected to your databases and APIs.",
    amount: 1200,
    clicks: 198,
    language: "JavaScript",
    langColor: "#f1e05a",
  },
  {
    name: "resend.com",
    url: "https://resend.com",
    favicon: "https://www.google.com/s2/favicons?domain=resend.com&sz=64",
    description:
      "The email API for developers. Build, test, and deliver transactional emails at scale.",
    amount: 850,
    clicks: 143,
    language: "TypeScript",
    langColor: "#3178c6",
  },
];

async function main() {
  console.log("🌱  Seeding database…");

  // Skip rows that already exist (upsert by URL)
  await db
    .insert(bids)
    .values(SEED_BIDS)
    .onConflictDoNothing({ target: bids.url });

  console.log(`✅  Inserted up to ${SEED_BIDS.length} seed bids (skipped duplicates).`);
  await client.end();
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
