import { db } from "@/lib/db";
import { bids } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// POST /api/bids/[id]/click
// Atomically increments the click counter for a bid by 1.
export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/bids/[id]/click">
) {
  try {
    const { id } = await ctx.params;
    const numId = Number(id);

    if (isNaN(numId)) {
      return Response.json({ error: "Invalid bid id" }, { status: 400 });
    }

    const rows = await db
      .update(bids)
      .set({ clicks: sql`${bids.clicks} + 1` })
      .where(eq(bids.id, numId))
      .returning();

    if (rows.length === 0) {
      return Response.json({ error: "Bid not found" }, { status: 404 });
    }

    return Response.json({ bid: rows[0] });
  } catch (err) {
    console.error("[POST /api/bids/[id]/click]", err);
    return Response.json({ error: "Failed to record click" }, { status: 500 });
  }
}
