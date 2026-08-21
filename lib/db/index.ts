import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set.\n" +
      "Add it to .env.local:\n" +
      "  DATABASE_URL=postgresql://user:password@localhost:5432/outbid"
  );
}

// Singleton: reuse across hot-reloads in Next.js dev
const globalForDb = globalThis as unknown as {
  _pgClient: postgres.Sql | undefined;
};

const client =
  globalForDb._pgClient ??
  postgres(connectionString, {
    max: 10,             // connection pool size
    idle_timeout: 30,    // close idle connections after 30s
    connect_timeout: 10, // fail fast if DB unreachable
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });
