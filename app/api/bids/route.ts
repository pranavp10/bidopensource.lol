import { db } from "@/lib/db";
import { bids } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { type NextRequest } from "next/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return all bids ordered by amount desc with computed rank. */
async function getRankedBids() {
  const rows = await db
    .select()
    .from(bids)
    .orderBy(desc(bids.amount));

  return rows.map((b, i) => ({
    ...b,
    rank: i + 1,
    // updatedAt is a Date from PostgreSQL
    timeAgo: formatTimeAgo(b.updatedAt),
  }));
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ─── GET /api/bids ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const ranked = await getRankedBids();
    return Response.json({ bids: ranked });
  } catch (err) {
    console.error("[GET /api/bids]", err);
    return Response.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}

// ─── POST /api/bids ────────────────────────────────────────────────────────────
// Body: { url, name?, description?, amount, language?, langColor? }
// Upserts by URL: if URL already exists, updates amount (if higher) + description.
// Returns the full re-ranked leaderboard.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name, description, amount, language, langColor } = body;

    if (!url || typeof url !== "string") {
      return Response.json({ error: "url is required" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return Response.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    // Normalise URL
    const normalised = url.startsWith("http") ? url : `https://${url}`;
    const domain = normalised.replace(/^https?:\/\//, "").split("/")[0];
    const resolvedName = name || domain;
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const now = new Date();

    // Check for existing bid with same URL
    const existing = await db
      .select()
      .from(bids)
      .where(eq(bids.url, normalised))
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      const newAmount = Math.max(current.amount, amount);

      await db
        .update(bids)
        .set({
          amount: newAmount,
          description: description ?? current.description,
          language: language ?? current.language,
          langColor: langColor ?? current.langColor,
          updatedAt: now,
        })
        .where(eq(bids.id, current.id));
    } else {
      await db.insert(bids).values({
        name: resolvedName,
        url: normalised,
        favicon,
        description: description ?? null,
        amount,
        clicks: 0,
        language: language ?? null,
        langColor: langColor ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }

    const ranked = await getRankedBids();
    return Response.json({ bids: ranked }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bids]", err);
    return Response.json({ error: "Failed to create bid" }, { status: 500 });
  }
}
