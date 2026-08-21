/**
 * POST /api/webhooks/polar
 *
 * Handles Polar webhook events (signed with POLAR_WEBHOOK_SECRET).
 * On `checkout.updated` with status "succeeded":
 *   - Upserts the bid into the DB with paid=true
 */
import { Webhooks } from "@polar-sh/nextjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bids } from "@/lib/db/schema";

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (payload) => {
		// We only care about completed checkouts
		if (payload.type !== "checkout.updated") return;

		const checkout = payload.data;
		if (checkout.status !== "succeeded") return;

		const meta = checkout.metadata as Record<string, string | number> | null;
		if (!meta?.bidUrl) {
			console.warn(
				"[webhook] checkout.updated missing bidUrl metadata",
				checkout.id,
			);
			return;
		}

		const bidUrl = String(meta.bidUrl);
		const bidDomain = String(
			meta.bidDomain ?? bidUrl.replace(/^https?:\/\//, "").split("/")[0],
		);
		const bidAmount = Number(meta.bidAmount);
		const bidDescription = meta.bidDescription
			? String(meta.bidDescription)
			: null;
		const customerEmail = checkout.customerEmail ?? null;
		const favicon = `https://www.google.com/s2/favicons?domain=${bidDomain}&sz=64`;
		const now = new Date();

		// Upsert: if URL already exists raise amount if higher, else insert new paid bid
		const existing = await db
			.select()
			.from(bids)
			.where(eq(bids.url, bidUrl))
			.limit(1);

		if (existing.length > 0) {
			const current = existing[0];
			await db
				.update(bids)
				.set({
					amount: Math.max(current.amount, bidAmount),
					paid: true,
					checkoutId: checkout.id,
					customerEmail: customerEmail ?? current.customerEmail,
					description: bidDescription ?? current.description,
					updatedAt: now,
				})
				.where(eq(bids.id, current.id));
		} else {
			await db.insert(bids).values({
				name: bidDomain,
				url: bidUrl,
				favicon,
				description: bidDescription,
				amount: bidAmount,
				clicks: 0,
				paid: true,
				checkoutId: checkout.id,
				customerEmail,
				createdAt: now,
				updatedAt: now,
			});
		}

		console.log(`[webhook] bid upserted → ${bidUrl} @ $${bidAmount}`);
	},
});
