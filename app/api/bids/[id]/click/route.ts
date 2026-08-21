import { incrementClicks } from "@/lib/db/repository";
import { type NextRequest } from "next/server";

// POST /api/bids/[id]/click
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);

    if (isNaN(numId)) {
      return Response.json({ error: "Invalid bid id" }, { status: 400 });
    }

    const bid = await incrementClicks(numId);
    if (!bid) {
      return Response.json({ error: "Bid not found" }, { status: 404 });
    }

    return Response.json({ success: true, clicks: bid.clicks });
  } catch (err) {
    console.error("[POST /api/bids/[id]/click]", err);
    return Response.json({ error: "Failed to record click" }, { status: 500 });
  }
}
