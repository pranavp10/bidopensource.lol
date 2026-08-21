import { db } from "@/lib/db";
import { bids } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { type NextRequest } from "next/server";

// ─── Language Colors ─────────────────────────────────────────────────────────
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Zig: "#ec915c",
  Elixir: "#6e4a7e",
  Lua: "#000080",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseGithubUrl(rawUrl: string): { owner: string; repo: string } | null {
  const cleaned = rawUrl.trim().replace(/^https?:\/\//i, "").replace(/^github\.com\//i, "").replace(/\/+$/, "");
  const parts = cleaned.split("/");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  }
  return null;
}

async function fetchGithubRepoMeta(owner: string, repo: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "bidopensource-app",
      },
      next: { revalidate: 300 }, // Cache 5 mins
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      name: data.full_name ?? `${owner}/${repo}`,
      url: data.html_url ?? `https://github.com/${owner}/${repo}`,
      description: data.description ?? "",
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      language: data.language ?? null,
      langColor: data.language ? (LANGUAGE_COLORS[data.language] ?? "#8b949e") : null,
      favicon: data.owner?.avatar_url ?? `https://github.com/${owner}.png`,
    };
  } catch (err) {
    console.error("[fetchGithubRepoMeta] error:", err);
    return null;
  }
}

/** Return bids ordered by clicks/stars with computed rank. */
async function getRankedBids() {
  const rows = await db
    .select()
    .from(bids)
    .where(or(eq(bids.paid, true), eq(bids.paid, false)))
    .orderBy(desc(bids.clicks), desc(bids.stars), desc(bids.createdAt));

  return rows.map((b, i) => ({
    ...b,
    rank: i + 1,
    timeAgo: formatTimeAgo(b.updatedAt ?? b.createdAt),
  }));
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ─── GET /api/bids ─────────────────────────────────────────────────────────────
// Returns all open-source projects on the leaderboard.
export async function GET() {
  try {
    const ranked = await getRankedBids();
    return Response.json({ bids: ranked });
  } catch (err) {
    console.error("[GET /api/bids]", err);
    return Response.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// ─── POST /api/bids ────────────────────────────────────────────────────────────
// Adds or updates an open-source project directly from a GitHub repository link.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, description, language, langColor } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return Response.json({ error: "GitHub repository URL is required" }, { status: 400 });
    }

    const trimmed = url.trim();
    const gh = parseGithubUrl(trimmed);
    const now = new Date();

    let finalName = trimmed;
    let finalUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    let finalFavicon = `https://www.google.com/s2/favicons?domain=${finalUrl.replace(/^https?:\/\//, "").split("/")[0]}&sz=64`;
    let finalDescription = description ?? null;
    let finalStars = 0;
    let finalForks = 0;
    let finalLanguage = language ?? null;
    let finalLangColor = langColor ?? null;

    if (gh) {
      finalUrl = `https://github.com/${gh.owner}/${gh.repo}`;
      finalName = `${gh.owner}/${gh.repo}`;
      finalFavicon = `https://github.com/${gh.owner}.png?size=64`;

      // Auto-fetch real-time metadata from GitHub
      const ghMeta = await fetchGithubRepoMeta(gh.owner, gh.repo);
      if (ghMeta) {
        finalName = ghMeta.name;
        finalUrl = ghMeta.url;
        finalDescription = ghMeta.description || finalDescription;
        finalStars = ghMeta.stars;
        finalForks = ghMeta.forks;
        finalLanguage = ghMeta.language || finalLanguage;
        finalLangColor = ghMeta.langColor || finalLangColor;
        finalFavicon = ghMeta.favicon;
      }
    }

    // Check if repository / URL already exists
    const existing = await db
      .select()
      .from(bids)
      .where(eq(bids.url, finalUrl))
      .limit(1);

    let savedBid;

    if (existing.length > 0) {
      const current = existing[0];
      const [updated] = await db
        .update(bids)
        .set({
          name: finalName,
          description: finalDescription ?? current.description,
          favicon: finalFavicon ?? current.favicon,
          stars: finalStars || current.stars,
          forks: finalForks || current.forks,
          language: finalLanguage ?? current.language,
          langColor: finalLangColor ?? current.langColor,
          paid: true,
          updatedAt: now,
        })
        .where(eq(bids.id, current.id))
        .returning();
      savedBid = updated;
    } else {
      const [inserted] = await db
        .insert(bids)
        .values({
          name: finalName,
          url: finalUrl,
          favicon: finalFavicon,
          description: finalDescription,
          amount: 0,
          clicks: 0,
          stars: finalStars,
          forks: finalForks,
          paid: true,
          language: finalLanguage,
          langColor: finalLangColor,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      savedBid = inserted;
    }

    return Response.json({ success: true, bid: savedBid }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bids]", err);
    return Response.json({ error: "Failed to add project" }, { status: 500 });
  }
}

