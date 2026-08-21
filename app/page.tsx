"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Bid = {
  rank: number;
  name: string;
  favicon: string;
  description: string;
  timeAgo: string;
  clicks: number;
  amount: number;
  stars?: number;
  language?: string;
  langColor?: string;
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_BIDS: Bid[] = [
  {
    rank: 1,
    name: "trycomp.ai",
    favicon: "https://www.google.com/s2/favicons?domain=trycomp.ai&sz=64",
    description:
      "Automate SOC 2, ISO 27001, HIPAA, and GDPR. 580+ integrations, 1,000+ companies, audit-ready in days.",
    timeAgo: "10 hours ago",
    clicks: 8505,
    amount: 10000,
    stars: 4821,
    language: "TypeScript",
    langColor: "#3178c6",
  },
  {
    rank: 2,
    name: "lathire.com",
    favicon: "https://www.google.com/s2/favicons?domain=lathire.com&sz=64",
    description:
      "Latin America's largest talent marketplace. Hire vetted tech and generalist professionals in as little as 24 hours, for up to 80% less.",
    timeAgo: "7 hours ago",
    clicks: 1556,
    amount: 3100,
    stars: 1203,
    language: "JavaScript",
    langColor: "#f1e05a",
  },
  {
    rank: 3,
    name: "mytb.ai",
    favicon: "https://www.google.com/s2/favicons?domain=mytb.ai&sz=64",
    description:
      "Automated, accurate, actionable bookkeeping and trial balance software for modern accounting firms.",
    timeAgo: "8 hours ago",
    clicks: 767,
    amount: 2999,
    stars: 892,
    language: "Python",
    langColor: "#3572A5",
  },
  {
    rank: 4,
    name: "linear.app",
    favicon: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
    description:
      "The issue tracking tool that developers love. Built for speed and designed for clarity.",
    timeAgo: "2 hours ago",
    clicks: 432,
    amount: 2499,
    stars: 3401,
    language: "TypeScript",
    langColor: "#3178c6",
  },
  {
    rank: 5,
    name: "vercel.com",
    favicon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
    description:
      "Frontend cloud for developers. Frameworks, workflows, and infrastructure to build a faster, more personalized Web.",
    timeAgo: "5 hours ago",
    clicks: 389,
    amount: 1999,
    stars: 7823,
    language: "Go",
    langColor: "#00ADD8",
  },
  {
    rank: 6,
    name: "raycast.com",
    favicon: "https://www.google.com/s2/favicons?domain=raycast.com&sz=64",
    description:
      "A blazingly fast, totally extendable launcher for developers. Complete tasks, calculate, share links.",
    timeAgo: "3 hours ago",
    clicks: 251,
    amount: 1500,
    stars: 2190,
    language: "Swift",
    langColor: "#F05138",
  },
  {
    rank: 7,
    name: "retool.com",
    favicon: "https://www.google.com/s2/favicons?domain=retool.com&sz=64",
    description:
      "Build internal tools, remarkably fast. Drag-and-drop building blocks connected to your databases and APIs.",
    timeAgo: "6 hours ago",
    clicks: 198,
    amount: 1200,
    stars: 1567,
    language: "JavaScript",
    langColor: "#f1e05a",
  },
  {
    rank: 8,
    name: "resend.com",
    favicon: "https://www.google.com/s2/favicons?domain=resend.com&sz=64",
    description:
      "The email API for developers. Build, test, and deliver transactional emails at scale.",
    timeAgo: "1 hour ago",
    clicks: 143,
    amount: 850,
    stars: 934,
    language: "TypeScript",
    langColor: "#3178c6",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString();
}

function fmtMoney(n: number) {
  return "$" + n.toLocaleString();
}

// ─── Star icon ────────────────────────────────────────────────────────────────
function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

// ─── Fork icon ────────────────────────────────────────────────────────────────
function ForkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
    </svg>
  );
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.825 4.242 9.473 3.5 8 3.5c-1.473 0-2.824.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
    </svg>
  );
}

// ─── Octocat / GitHub mark ────────────────────────────────────────────────────
function OctocatIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 98 96" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0Z"
      />
    </svg>
  );
}

// ─── Rank badge variants ──────────────────────────────────────────────────────
const RANK_COLORS: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: "#3d2b00", color: "#e3b341", border: "#bb8009" },
  2: { bg: "#1c2128", color: "#8b949e", border: "#30363d" },
  3: { bg: "#2d1e0f", color: "#c0782b", border: "#6e4012" },
};
function rankStyle(rank: number) {
  return (
    RANK_COLORS[rank] ?? { bg: "#161b22", color: "#8b949e", border: "#21262d" }
  );
}

// ─── BidCard ──────────────────────────────────────────────────────────────────
function BidCard({ bid }: { bid: Bid }) {
  const rs = rankStyle(bid.rank);
  const isTop3 = bid.rank <= 3;

  return (
    <div
      style={{
        background: "#161b22",
        border: `1px solid ${isTop3 ? "#30363d" : "#21262d"}`,
        borderRadius: 6,
        padding: "16px",
        display: "flex",
        gap: 12,
        transition: "border-color 0.15s, background 0.15s",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#58a6ff";
        (e.currentTarget as HTMLDivElement).style.background = "#1c2128";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isTop3 ? "#30363d" : "#21262d";
        (e.currentTarget as HTMLDivElement).style.background = "#161b22";
      }}
    >
      {/* Left accent stripe for top 3 */}
      {isTop3 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: rs.border,
            borderRadius: "6px 0 0 6px",
          }}
        />
      )}

      {/* Rank badge */}
      <div
        style={{
          minWidth: 32,
          height: 32,
          borderRadius: 6,
          background: rs.bg,
          border: `1px solid ${rs.border}`,
          color: rs.color,
          fontWeight: 600,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "monospace",
          letterSpacing: "-0.5px",
          marginLeft: isTop3 ? 8 : 0,
        }}
      >
        #{bid.rank}
      </div>

      {/* Favicon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          overflow: "hidden",
          background: "#0d1117",
          border: "1px solid #30363d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bid.favicon}
          alt={bid.name}
          width={28}
          height={28}
          style={{ objectFit: "contain" }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "#58a6ff",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLSpanElement).style.textDecoration = "underline")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLSpanElement).style.textDecoration = "none")}
          >
            {bid.name}
          </span>
          {bid.rank === 1 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: "#bb8009",
                color: "#0d1117",
                padding: "1px 7px",
                borderRadius: 20,
              }}
            >
              #1 · Trending
            </span>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: "#8b949e",
            margin: "0 0 8px",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {bid.description}
        </p>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 12,
            color: "#8b949e",
            flexWrap: "wrap",
          }}
        >
          {bid.language && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: bid.langColor,
                  display: "inline-block",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              {bid.language}
            </span>
          )}
          {bid.stars !== undefined && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StarIcon size={12} />
              {fmt(bid.stars)}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <EyeIcon size={12} />
            {fmt(bid.clicks)} clicks
          </span>
          <span>{bid.timeAgo}</span>
        </div>
      </div>

      {/* Bid amount */}
      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: 15,
            color: "#3fb950",
            marginBottom: 4,
          }}
        >
          {fmtMoney(bid.amount)}
        </div>
        <button
          style={{
            fontSize: 11,
            padding: "3px 10px",
            background: "#238636",
            border: "1px solid rgba(240,246,252,0.1)",
            borderRadius: 6,
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#2ea043")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#238636")}
        >
          Outbid
        </button>
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
function Tabs({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const tabs = ["Leaderboard", "About", "Rules"];
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #21262d",
        marginBottom: 24,
        gap: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: isActive ? "2px solid #f78166" : "2px solid transparent",
              color: isActive ? "#e6edf3" : "#8b949e",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              transition: "color 0.15s",
              marginBottom: -1,
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.color = "#e6edf3";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.color = "#8b949e";
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [bids, setBids] = useState<Bid[]>(SEED_BIDS);
  const [url, setUrl] = useState("");
  const [bidAmount, setBidAmount] = useState(SEED_BIDS[0].amount + 1);
  const [activeTab, setActiveTab] = useState("Leaderboard");
  const [submitted, setSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const topBid = bids[0];

  function handleOutbid() {
    if (!url.trim()) return;
    const rawName = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const newBid: Bid = {
      rank: 1,
      name: rawName,
      favicon: `https://www.google.com/s2/favicons?domain=${rawName}&sz=64`,
      description: "Newly added to the leaderboard via outbid.",
      timeAgo: "Just now",
      clicks: 0,
      amount: bidAmount,
      stars: 0,
      language: "TypeScript",
      langColor: "#3178c6",
    };
    const updated = [newBid, ...bids]
      .sort((a, b) => b.amount - a.amount)
      .map((b, i) => ({ ...b, rank: i + 1 }));
    setBids(updated);
    setUrl("");
    setBidAmount(updated[0].amount + 1);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3" }}>
      {/* ── Header ── */}
      <header
        style={{
          background: "#161b22",
          borderBottom: "1px solid #21262d",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1012,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            height: 62,
            gap: 16,
          }}
        >
          {/* GitHub mark */}
          <a
            href="#"
            style={{ color: "#e6edf3", display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <OctocatIcon size={32} />
          </a>

          {/* Search bar */}
          <div
            style={{
              flex: 1,
              maxWidth: 280,
              display: "flex",
              alignItems: "center",
              background: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: 6,
              padding: "5px 12px",
              gap: 8,
              cursor: "text",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#8b949e">
              <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
            </svg>
            <span style={{ fontSize: 14, color: "#8b949e" }}>Search or jump to…</span>
            <kbd
              style={{
                marginLeft: "auto",
                fontSize: 11,
                padding: "2px 5px",
                background: "#21262d",
                border: "1px solid #30363d",
                borderRadius: 4,
                color: "#8b949e",
              }}
            >
              /
            </kbd>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 8 }}>
            {["Pull requests", "Issues", "Marketplace", "Explore"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: 14,
                  color: "#e6edf3",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8b949e")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#e6edf3")}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Avatar placeholder */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#21262d",
              border: "1px solid #30363d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#8b949e">
              <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 0 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM8 4a2.5 2.5 0 1 0-.001 4.999A2.5 2.5 0 0 0 8 4Z" />
            </svg>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1012, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Repo header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <OctocatIcon size={18} />
          <div style={{ fontSize: 20, fontWeight: 400 }}>
            <a href="#" style={{ color: "#58a6ff", fontWeight: 600 }}>
              community
            </a>
            <span style={{ color: "#8b949e", margin: "0 6px" }}>/</span>
            <a href="#" style={{ color: "#58a6ff", fontWeight: 600 }}>
              outbid.lol
            </a>
          </div>
          <span
            style={{
              fontSize: 12,
              padding: "2px 8px",
              border: "1px solid #58a6ff",
              borderRadius: 20,
              color: "#58a6ff",
              fontWeight: 500,
            }}
          >
            Public
          </span>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {/* Watch */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#21262d",
              border: "1px solid #30363d",
              borderRadius: 6,
              color: "#e6edf3",
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#30363d")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#21262d")}
          >
            <EyeIcon size={14} />
            Watch
            <span
              style={{
                padding: "0 6px",
                background: "#30363d",
                borderRadius: 20,
                color: "#e6edf3",
                fontWeight: 600,
              }}
            >
              1.9k
            </span>
          </button>

          {/* Fork */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#21262d",
              border: "1px solid #30363d",
              borderRadius: 6,
              color: "#e6edf3",
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#30363d")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#21262d")}
          >
            <ForkIcon size={14} />
            Fork
            <span
              style={{
                padding: "0 6px",
                background: "#30363d",
                borderRadius: 20,
                color: "#e6edf3",
                fontWeight: 600,
              }}
            >
              342
            </span>
          </button>

          {/* Star */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#21262d",
              border: "1px solid #30363d",
              borderRadius: 6,
              color: "#e6edf3",
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#30363d")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#21262d")}
          >
            <StarIcon size={14} />
            Star
            <span
              style={{
                padding: "0 6px",
                background: "#30363d",
                borderRadius: 20,
                color: "#e6edf3",
                fontWeight: 600,
              }}
            >
              {fmt(bids.reduce((s, b) => s + (b.stars ?? 0), 0))}
            </span>
          </button>

          {/* Online pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: "auto",
              fontSize: 12,
              color: "#8b949e",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#3fb950",
                display: "inline-block",
                boxShadow: "0 0 0 3px rgba(63,185,80,0.2)",
              }}
            />
            <strong style={{ color: "#3fb950" }}>1,903 online</strong>
            <span>· 1,062,005 visitors since launch</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs active={activeTab} onChange={setActiveTab} />

        {/* README / hero callout */}
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 6,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          {/* File header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              borderBottom: "1px solid #21262d",
              background: "#161b22",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#8b949e">
                <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.5A3.744 3.744 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" />
              </svg>
              <span style={{ fontWeight: 600, color: "#e6edf3" }}>README.md</span>
            </div>
            <span style={{ fontSize: 12, color: "#8b949e" }}>
              Updated {topBid?.timeAgo ?? "recently"}
            </span>
          </div>

          {/* README body */}
          <div style={{ padding: "24px 32px" }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#e6edf3",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              outbid.lol
            </h1>
            <p style={{ color: "#8b949e", fontSize: 15, marginBottom: 16, lineHeight: 1.6 }}>
              No ads, no API keys, no revenue sharing. Just outbid your competition
              to get to the top.{" "}
              <strong style={{ color: "#f78166" }}>
                Will you take #1 when this site goes viral?
              </strong>
            </p>

            {/* Alert box */}
            <div
              style={{
                border: "1px solid #3fb950",
                background: "rgba(63,185,80,0.05)",
                borderRadius: 6,
                padding: "12px 16px",
                marginBottom: 20,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#3fb950" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm6.5-.25A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>
              <div>
                <strong style={{ color: "#3fb950", fontSize: 13 }}>How it works</strong>
                <p style={{ color: "#8b949e", fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>
                  Your bid amount decides your rank. Paying less than the #1 price still puts you on
                  the board at whatever place that bid can take. The top spot is currently{" "}
                  <strong style={{ color: "#e6edf3" }}>{fmtMoney(topBid?.amount ?? 0)}</strong>.
                </p>
              </div>
            </div>

            {/* Claim heading */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 6,
                padding: "20px 24px",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: 0,
                    color: "#e6edf3",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Claim <span style={{ color: "#f78166" }}>#2</span> for
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    id="bid-decrease"
                    onClick={() =>
                      setBidAmount((v) =>
                        Math.max((topBid?.amount ?? 0) + 1, v - 100)
                      )
                    }
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      border: "1px solid #30363d",
                      background: "#21262d",
                      color: "#e6edf3",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.12s",
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background = "#30363d")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background = "#21262d")
                    }
                    aria-label="Decrease bid"
                  >
                    –
                  </button>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#3fb950",
                      letterSpacing: "-1px",
                    }}
                  >
                    {fmtMoney(bidAmount)}
                  </span>
                  <button
                    id="bid-increase"
                    onClick={() => setBidAmount((v) => v + 100)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      border: "1px solid #30363d",
                      background: "#21262d",
                      color: "#e6edf3",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.12s",
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background = "#30363d")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background = "#21262d")
                    }
                    aria-label="Increase bid"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Input row */}
              <div style={{ display: "flex", gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    background: "#0d1117",
                    border: `1px solid ${isFocused ? "#58a6ff" : "#30363d"}`,
                    borderRadius: 6,
                    padding: "5px 12px",
                    gap: 8,
                    boxShadow: isFocused ? "0 0 0 3px rgba(31,111,235,0.3)" : "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <input
                    id="product-url-input"
                    type="text"
                    placeholder="Your product URL or @handle"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => e.key === "Enter" && handleOutbid()}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: 14,
                      color: "#e6edf3",
                      background: "transparent",
                      padding: "6px 0",
                    }}
                  />
                </div>
                <button
                  id="outbid-submit-button"
                  onClick={handleOutbid}
                  style={{
                    background: submitted ? "#238636" : "#238636",
                    color: "white",
                    border: "1px solid rgba(240,246,252,0.1)",
                    borderRadius: 6,
                    padding: "6px 20px",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#2ea043")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#238636")
                  }
                >
                  {submitted ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                      Submitted!
                    </>
                  ) : (
                    "Outbid"
                  )}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#6e7681", marginTop: 8, marginBottom: 0 }}>
                Already on the list? Enter the same URL or @handle and up your bid to get back to the top.
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard section */}
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid #21262d",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#8b949e">
                <path d="M6 2a.75.75 0 0 1 .75.75v1.5h2.5V2.75a.75.75 0 0 1 1.5 0v1.5h1.75A1.75 1.75 0 0 1 14.25 6v7.25A1.75 1.75 0 0 1 12.5 15h-9a1.75 1.75 0 0 1-1.75-1.75V6A1.75 1.75 0 0 1 3.5 4.25H5.25V2.75A.75.75 0 0 1 6 2ZM3.5 5.75A.25.25 0 0 0 3.25 6v7.25c0 .138.112.25.25.25h9a.25.25 0 0 0 .25-.25V6a.25.25 0 0 0-.25-.25H3.5Z" />
              </svg>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#e6edf3" }}>
                Leaderboard
              </span>
              <span
                style={{
                  fontSize: 12,
                  padding: "1px 7px",
                  background: "#30363d",
                  borderRadius: 20,
                  color: "#e6edf3",
                  fontWeight: 600,
                }}
              >
                {bids.length}
              </span>
            </div>
            <button
              id="refresh-leaderboard"
              onClick={handleRefresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "1px solid #30363d",
                borderRadius: 6,
                color: "#8b949e",
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#21262d";
                (e.currentTarget as HTMLButtonElement).style.color = "#e6edf3";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#8b949e";
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                style={{
                  transition: "transform 0.5s",
                  transform: isRefreshing ? "rotate(360deg)" : "none",
                }}
              >
                <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Bid list */}
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {bids.map((bid) => (
              <BidCard key={`${bid.name}-${bid.rank}`} bid={bid} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #21262d",
            fontSize: 12,
            color: "#6e7681",
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span>© 2025 outbid.lol</span>
          <a href="#" style={{ color: "#6e7681" }}>Terms</a>
          <a href="#" style={{ color: "#6e7681" }}>Privacy</a>
          <a href="#" style={{ color: "#6e7681" }}>Security</a>
          <a href="#" style={{ color: "#6e7681" }}>Status</a>
          <a href="#" style={{ color: "#6e7681" }}>Docs</a>
          <a href="#" style={{ color: "#6e7681" }}>Contact</a>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <OctocatIcon size={14} />
            Made with GitHub spirit
          </span>
        </footer>
      </main>
    </div>
  );
}
