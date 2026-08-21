import { db } from "@/lib/db";
import { bids } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { type NextRequest } from "next/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return only PAID bids ordered by amount desc with computed rank. */
async function getRankedBids() {
  const rows = await db
    .select()
    .from(bids)
    .where(eq(bids.paid, true))
    .orderBy(desc(bids.amount));

  return rows.map((b, i) => ({
    ...b,
    rank: i + 1,
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
// Returns only paid (confirmed) bids on the leaderboard.
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
// Saves a PENDING (unpaid) bid and returns a Polar checkout URL.
// The bid is only shown on the leaderboard after the webhook confirms payment.
// Body: { url, description?, amount, language?, langColor? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, description, amount, language, langColor } = body;

    if (!url || typeof url !== "string") {
      return Response.json({ error: "url is required" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount < 1) {
      return Response.json(
        { error: "amount must be ≥ 1" },
        { status: 400 }
      );
    }

    const normalised = url.startsWith("http") ? url : `https://${url}`;
    const domain = normalised.replace(/^https?:\/\//, "").split("/")[0];
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const now = new Date();

    // Upsert pending bid (paid stays false; webhook will flip it)
    const existing = await db
      .select()
      .from(bids)
      .where(eq(bids.url, normalised))
      .limit(1);

    let bidId: number;

    if (existing.length > 0) {
      const current = existing[0];
      const [updated] = await db
        .update(bids)
        .set({
          amount: Math.max(current.amount, amount),
          description: description ?? current.description,
          language: language ?? current.language,
          langColor: langColor ?? current.langColor,
          updatedAt: now,
        })
        .where(eq(bids.id, current.id))
        .returning({ id: bids.id });
      bidId = updated.id;
    } else {
      const [inserted] = await db
        .insert(bids)
        .values({
          name: domain,
          url: normalised,
          favicon,
          description: description ?? null,
          amount,
          clicks: 0,
          paid: false,
          language: language ?? null,
          langColor: langColor ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: bids.id });
      bidId = inserted.id;
    }

    // Build the Polar checkout URL — frontend will redirect to it
    const base = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
    const checkoutParams = new URLSearchParams({
      url: normalised,
      amount: String(amount),
      description: description ?? "",
      bidId: String(bidId),
    });
    const checkoutUrl = `${base}/api/checkout?${checkoutParams}`;

    return Response.json({ checkoutUrl }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bids]", err);
    return Response.json({ error: "Failed to create bid" }, { status: 500 });
  }
}
