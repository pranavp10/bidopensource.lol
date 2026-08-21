import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Singleton: reuse across hot-reloads in Next.js dev
const globalForDb = globalThis as unknown as {
  _pgClient: postgres.Sql | undefined;
};

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let isConnected = false;

if (connectionString) {
  try {
    const client =
      globalForDb._pgClient ??
      postgres(connectionString, {
        max: 10,             // connection pool size
        idle_timeout: 30,    // close idle connections after 30s
        connect_timeout: 5,  // fail fast if DB unreachable
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb._pgClient = client;
    }

    dbInstance = drizzle(client, { schema });
    isConnected = true;
  } catch (err) {
    console.warn("⚠️ Warning: Failed to connect to DATABASE_URL. Running in fallback memory mode.", err);
  }
} else {
  console.info("ℹ️ DATABASE_URL not set in .env.local. Running in in-memory dev mode.");
}

export const db = dbInstance;
export const isDbConnected = isConnected;

