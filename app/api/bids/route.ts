import { getAllBids, upsertBid, getActivities } from "@/lib/db/repository";
import { type NextRequest } from "next/server";

// ─── GET /api/bids ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const bids = await getAllBids();
    const activities = await getActivities();

    const totalVolume = bids.reduce((acc, b) => acc + (b.amount || 0), 0);
    const totalClicks = bids.reduce((acc, b) => acc + (b.clicks || 0), 0);
    const totalStars = bids.reduce((acc, b) => acc + (b.stars || 0), 0);

    return Response.json({
      bids,
      activities,
      stats: {
        totalVolume,
        totalClicks,
        totalStars,
        totalProjects: bids.length,
        topBidAmount: bids[0]?.amount ?? 0,
      },
    });
  } catch (err) {
    console.error("[GET /api/bids]", err);
    return Response.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}

// ─── POST /api/bids ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name, description, amount, language, langColor, stars, forks, favicon } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return Response.json({ error: "URL or GitHub repo is required" }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return Response.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const result = await upsertBid({
      url: url.trim(),
      name: name?.trim(),
      description: description?.trim(),
      amount: numAmount,
      language,
      langColor,
      stars: stars ? Number(stars) : undefined,
      forks: forks ? Number(forks) : undefined,
      favicon,
    });

    const activities = await getActivities();

    return Response.json(
      {
        bids: result.bids,
        event: result.event,
        activities,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/bids]", err);
    return Response.json({ error: "Failed to submit bid" }, { status: 500 });
  }
}
