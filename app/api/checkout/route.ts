import { dodo } from "@/lib/dodo";
import { type NextRequest } from "next/server";

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

    const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
    if (!productId) {
      return Response.json(
        { error: "DODO_PAYMENTS_PRODUCT_ID environment variable is missing" },
        { status: 500 }
      );
    }

    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const appUrl =
      origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_URL ||
      "https://www.bidopensource.lol";

    // Create Dodo Payments Checkout Session
    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          // Since product base unit is $1, quantity matches the dynamic dollar bid amount
          quantity: Math.max(1, Math.round(numAmount)),
        },
      ],
      metadata: {
        url: url.trim(),
        name: (name || "").trim(),
        description: (description || "").trim(),
        amount: String(numAmount),
        language: language || "",
        langColor: langColor || "",
        stars: String(stars || 0),
        forks: String(forks || 0),
        favicon: favicon || "",
      },
      return_url: `${appUrl}?payment=success&url=${encodeURIComponent(url.trim())}`,
    });

    if (!session.checkout_url) {
      return Response.json({ error: "Failed to generate checkout URL" }, { status: 500 });
    }

    return Response.json({ checkoutUrl: session.checkout_url });
  } catch (err) {
    console.error("[POST /api/checkout]", err);
    return Response.json(
      { error: (err as Error).message || "Checkout session creation failed" },
      { status: 500 }
    );
  }
}
