import { dodo } from "@/lib/dodo";
import { upsertBid } from "@/lib/db/repository";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    // Verify webhook signature with Dodo Payments
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "";
    const event = dodo.webhooks.unwrap(rawBody, {
      headers: headersObj,
      key: webhookSecret,
    });

    if (event.type === "payment.succeeded") {
      const payment = event.data;
      const meta = payment.metadata || {};

      const url = meta.url ? String(meta.url) : null;

      if (url) {
        // Calculate amount from metadata or payment total
        const paidDollars =
          Number(meta.amount) || Math.round((payment.total_amount || 100) / 100);

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

        console.log(`[Dodo Webhook] Successfully recorded bid for ${url} ($${paidDollars})`);
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("[POST /api/webhooks/dodo] Error:", err);
    return Response.json(
      { error: (err as Error).message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}
