import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌  DATABASE_URL is not set in .env.local or .env");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function main() {
  console.log("🧹  Flushing database…");

  await sql`TRUNCATE TABLE activities, bids RESTART IDENTITY CASCADE;`;

  console.log("✅  Database flushed successfully (all tables truncated).");
  await sql.end();
}

main().catch(async (err) => {
  console.error("❌  Flush failed:", err);
  await sql.end();
  process.exit(1);
});
