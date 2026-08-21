/**
 * GET /api/checkout
 *
 * Creates a Polar checkout session for a bid spot.
 * Query params:
 *   - url        (required) product URL or handle
 *   - amount     (required) bid amount in whole dollars
 *   - description (optional)
 *
 * Polar checkout uses a pre-created Product. The new SDK (v2+) replaced
 * `productPriceId` with a `products` array (product IDs, not price IDs).
 * For a custom/dynamic amount, pass it via the top-level `amount` field.
 * Set POLAR_PRODUCT_ID in your .env to the product's ID (not a price ID).
 * The bid metadata is passed via checkout `metadata` so the webhook can recreate it.
 */
import { polar } from "@/lib/polar";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const url = searchParams.get("url");
  const amountStr = searchParams.get("amount");
  const description = searchParams.get("description") ?? "";

  if (!url || !amountStr) {
    return Response.json(
      { error: "url and amount are required" },
      { status: 400 }
    );
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount < 1) {
    return Response.json(
      { error: "amount must be a positive number" },
      { status: 400 }
    );
  }

  const normalised = url.startsWith("http") ? url : `https://${url}`;
  const domain = normalised.replace(/^https?:\/\//, "").split("/")[0];
  const successUrl =
    process.env.NEXT_PUBLIC_URL
      ? `${process.env.NEXT_PUBLIC_URL}/confirm?checkout_id={CHECKOUT_ID}`
      : `http://localhost:3000/confirm?checkout_id={CHECKOUT_ID}`;

  try {
    // Create a checkout session with a custom amount (amount in cents).
    // SDK v2+: `productPriceId` was removed; use `products` (array of product IDs)
    // and supply a custom per-unit price via the `prices` map.
    const productId = process.env.POLAR_PRODUCT_ID!;
    const checkout = await polar.checkouts.create({
      products: [productId],
      amount: amount * 100,           // Polar expects cents
      successUrl,
      metadata: {
        bidUrl: normalised,
        bidDomain: domain,
        bidAmount: amount,
        bidDescription: description,
      },
    });

    // Redirect the user to Polar's hosted checkout page
    return Response.redirect(checkout.url, 303);
  } catch (err) {
    console.error("[GET /api/checkout]", err);
    return Response.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
