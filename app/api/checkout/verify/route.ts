import { dodo } from "@/lib/dodo";
import { upsertBid, getAllBids, getActivities } from "@/lib/db/repository";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, url: fallbackUrl } = body;

    if (!payment_id) {
      return Response.json({ error: "payment_id is required" }, { status: 400 });
    }

    // Retrieve payment details from Dodo Payments
    const payment = await dodo.payments.retrieve(payment_id);
    if (!payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    const status = payment.status;
    const isSuccessful = status === "succeeded";

    if (!isSuccessful) {
      return Response.json(
        { error: `Payment status is ${status}, not succeeded` },
        { status: 400 }
      );
    }

    const meta = (payment.metadata || {}) as Record<string, string | number>;
    const url = (meta.url ? String(meta.url) : fallbackUrl) || "";

    if (!url) {
      return Response.json({ error: "Missing project URL in payment metadata" }, { status: 400 });
    }

    const paidDollars =
      Number(meta.amount) ||
      (payment.total_amount ? Math.round(payment.total_amount / 100) : 1);

    await upsertBid({
      url,
      name: meta.name ? String(meta.name) : undefined,
      description: meta.description ? String(meta.description) : undefined,
      amount: paidDollars,
      language: meta.language ? String(meta.language) : undefined,
      langColor: meta.langColor ? String(meta.langColor) : undefined,
      stars: meta.stars ? Number(meta.stars) : undefined,
      forks: meta.forks ? Number(meta.forks) : undefined,
      favicon: meta.favicon ? String(meta.favicon) : undefined,
    });

    const updatedBids = await getAllBids();
    const updatedActivities = await getActivities();

    return Response.json({
      success: true,
      bids: updatedBids,
      activities: updatedActivities,
    });
  } catch (err) {
    console.error("[POST /api/checkout/verify]", err);
    return Response.json(
      { error: (err as Error).message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
