import DodoPayments from "dodopayments";

const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode";

export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: isLive ? "live_mode" : "test_mode",
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "",
});
