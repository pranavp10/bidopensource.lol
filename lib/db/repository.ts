import { db } from "./index";
import { bids, activities, type Bid } from "./schema";
import { desc, eq, sql } from "drizzle-orm";

export interface EnrichedBid extends Bid {
  rank: number;
  timeAgo: string;
}

export interface ActivityEvent {
  id: string | number;
  type: string;
  title: string;
  description: string | null;
  timeAgo: string;
  amount: number;
  bidName: string;
  rank: number;
  timestamp: string;
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Fetch all paid bids ordered strictly by amount descending from the database */
export async function getAllBids(): Promise<EnrichedBid[]> {
  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(bids)
      .where(eq(bids.paid, true))
      .orderBy(desc(bids.amount));

    return rows.map((b, i) => ({
      ...b,
      rank: i + 1,
      timeAgo: formatTimeAgo(b.updatedAt ?? b.createdAt),
    }));
  } catch (err) {
    console.error("[getAllBids] DB error:", err);
    return [];
  }
}

/** Fetch recent activities strictly from the database */
export async function getActivities(): Promise<ActivityEvent[]> {
  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(50);

    return rows.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      timeAgo: formatTimeAgo(a.createdAt),
      amount: a.amount,
      bidName: a.bidName,
      rank: a.rank,
      timestamp: a.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("[getActivities] DB error:", err);
    return [];
  }
}

/** Upsert a bid into the database and record the activity event */
export async function upsertBid(data: {
  url: string;
  name?: string;
  description?: string;
  amount: number;
  language?: string;
  langColor?: string;
  stars?: number;
  forks?: number;
  favicon?: string;
}): Promise<{ bids: EnrichedBid[]; event?: ActivityEvent }> {
  if (!db) {
    throw new Error("Database is not connected. Please configure DATABASE_URL in .env.local");
  }

  const normalised = data.url.startsWith("http") ? data.url : `https://${data.url}`;
  const domain = normalised.replace(/^https?:\/\//, "").split("/")[0];
  const name = data.name || domain;
  const favicon = data.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  const now = new Date();

  // Check current #1 to determine if this is a dethrone
  const currentBids = await getAllBids();
  const currentTop = currentBids[0];
  const isNewTop = !currentTop || data.amount > currentTop.amount;

  const existing = await db
    .select()
    .from(bids)
    .where(eq(bids.url, normalised))
    .limit(1);

  if (existing.length > 0) {
    const cur = existing[0];
    const newAmount = Math.max(cur.amount, data.amount);
    await db
      .update(bids)
      .set({
        name,
        amount: newAmount,
        description: data.description ?? cur.description,
        language: data.language ?? cur.language,
        langColor: data.langColor ?? cur.langColor,
        stars: data.stars ?? cur.stars,
        forks: data.forks ?? cur.forks,
        favicon: favicon ?? cur.favicon,
        updatedAt: now,
      })
      .where(eq(bids.id, cur.id));
  } else {
    await db.insert(bids).values({
      name,
      url: normalised,
      favicon,
      description: data.description ?? null,
      amount: data.amount,
      clicks: 0,
      stars: data.stars ?? 0,
      forks: data.forks ?? 0,
      language: data.language ?? null,
      langColor: data.langColor ?? null,
      paid: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Fetch updated list of bids to compute new rank
  const updatedBids = await getAllBids();
  const currentRank = updatedBids.findIndex((b) => b.url === normalised) + 1;

  // Insert activity log into database
  const eventTitle = isNewTop
    ? `👑 ${name} claimed #1 Crown!`
    : `${name} placed bid for $${data.amount.toLocaleString()}`;

  const eventDesc = isNewTop
    ? `Outbid previous champion to take the top spot!`
    : `Secured Rank #${currentRank} on the leaderboard.`;

  const [createdActivity] = await db
    .insert(activities)
    .values({
      type: isNewTop ? "dethrone" : "bid",
      title: eventTitle,
      description: eventDesc,
      amount: data.amount,
      bidName: name,
      rank: currentRank,
      createdAt: now,
    })
    .returning();

  const event: ActivityEvent = {
    id: createdActivity.id,
    type: createdActivity.type,
    title: createdActivity.title,
    description: createdActivity.description,
    timeAgo: "Just now",
    amount: createdActivity.amount,
    bidName: createdActivity.bidName,
    rank: createdActivity.rank,
    timestamp: now.toISOString(),
  };

  return { bids: updatedBids, event };
}

/** Increment clicks in database */
export async function incrementClicks(id: number): Promise<Bid | null> {
  if (!db) return null;

  try {
    const rows = await db
      .update(bids)
      .set({ clicks: sql`${bids.clicks} + 1` })
      .where(eq(bids.id, id))
      .returning();

    return rows[0] ?? null;
  } catch (err) {
    console.error("[incrementClicks] DB error:", err);
    return null;
  }
}
