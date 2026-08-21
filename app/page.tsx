"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Bid = {
  id: number;
  rank: number;
  name: string;
  favicon: string | null;
  description: string | null;
  timeAgo: string;
  clicks: number;
  amount: number;
  language: string | null;
  langColor: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString();
}

function fmtMoney(n: number) {
  return "$" + n.toLocaleString();
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

function ForkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
    </svg>
  );
}

function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.825 4.242 9.473 3.5 8 3.5c-1.473 0-2.824.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
    </svg>
  );
}

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

// ─── Rank styles ──────────────────────────────────────────────────────────────
const RANK_COLORS: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: "#3d2b00", color: "#e3b341", border: "#bb8009" },
  2: { bg: "#1c2128", color: "#8b949e", border: "#30363d" },
  3: { bg: "#2d1e0f", color: "#c0782b", border: "#6e4012" },
};
function rankStyle(rank: number) {
  return RANK_COLORS[rank] ?? { bg: "#161b22", color: "#8b949e", border: "#21262d" };
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: 6,
        padding: 16,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: "#21262d",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          background: "#21262d",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            height: 14,
            width: "30%",
            background: "#21262d",
            borderRadius: 4,
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            height: 12,
            width: "70%",
            background: "#21262d",
            borderRadius: 4,
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>
      <div
        style={{
          width: 60,
          height: 20,
          background: "#21262d",
          borderRadius: 4,
          animation: "shimmer 1.5s infinite",
        }}
      />
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── BidCard ──────────────────────────────────────────────────────────────────
function BidCard({
  bid,
  onOutbid,
  onClickBid,
}: {
  bid: Bid;
  onOutbid: (bid: Bid) => void;
  onClickBid: (bid: Bid) => void;
}) {
  const rs = rankStyle(bid.rank);
  const isTop3 = bid.rank <= 3;

  return (
    <div
      role="listitem"
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
      onClick={() => onClickBid(bid)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#58a6ff";
        (e.currentTarget as HTMLDivElement).style.background = "#1c2128";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isTop3 ? "#30363d" : "#21262d";
        (e.currentTarget as HTMLDivElement).style.background = "#161b22";
      }}
    >
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
        {bid.favicon && (
          // eslint-disable-next-line @next/next/no-img-element
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
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{ fontWeight: 600, fontSize: 14, color: "#58a6ff" }}
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

        {bid.description && (
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
        )}

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
                  background: bid.langColor ?? "#8b949e",
                  display: "inline-block",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              {bid.language}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <EyeIcon size={12} />
            {fmt(bid.clicks)} clicks
          </span>
          <span>{bid.timeAgo}</span>
        </div>
      </div>

      {/* Amount + outbid button */}
      <div
        style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: 15,
            color: "#3fb950",
            marginBottom: 6,
          }}
        >
          {fmtMoney(bid.amount)}
        </div>
        <button
          onClick={() => onOutbid(bid)}
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
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#2ea043")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#238636")
          }
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
    <div style={{ display: "flex", borderBottom: "1px solid #21262d", marginBottom: 24 }}>
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
              marginBottom: -1,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#e6edf3";
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#8b949e";
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
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [bidAmount, setBidAmount] = useState(1);
  const [activeTab, setActiveTab] = useState("Leaderboard");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const topBid = bids[0];

  // ── Fetch leaderboard ──────────────────────────────────────────────────────
  const fetchBids = useCallback(async () => {
    try {
      const res = await fetch("/api/bids");
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const data = await res.json();
      setBids(data.bids);
      if (data.bids.length > 0) {
        setBidAmount(data.bids[0].amount + 1);
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    fetchBids().finally(() => setLoading(false));
  }, [fetchBids]);

  // ── Submit outbid → Polar checkout ─────────────────────────────────────────
  async function handleOutbid(prefillBid?: Bid) {
    const targetUrl = prefillBid ? prefillBid.url : url;
    if (!targetUrl.trim()) return;

    setSubmitting(true);
    try {
      // 1. Save a pending bid and receive a Polar checkout URL
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          amount: bidAmount,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Submission failed");
      }
      const data = await res.json();

      // 2. Redirect to Polar hosted checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return; // navigation takes over
      }
      throw new Error("No checkout URL returned");
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  // ── Track click ────────────────────────────────────────────────────────────
  async function handleClickBid(bid: Bid) {
    try {
      await fetch(`/api/bids/${bid.id}/click`, { method: "POST" });
      // Optimistically update clicks in local state
      setBids((prev) =>
        prev.map((b) => (b.id === bid.id ? { ...b, clicks: b.clicks + 1 } : b))
      );
    } catch {
      // silent fail – not critical
    }
  }

  // ── Refresh ────────────────────────────────────────────────────────────────
  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchBids();
    setIsRefreshing(false);
  }

  // ── Outbid shortcut from card ──────────────────────────────────────────────
  function handleCardOutbid(bid: Bid) {
    setUrl(bid.url);
    setBidAmount(bid.amount + 1);
    document.getElementById("product-url-input")?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalStars = bids.length * 800; // decorative

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3" }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
          <a href="#" style={{ color: "#e6edf3", display: "flex", alignItems: "center" }}>
            <OctocatIcon size={32} />
          </a>

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

          <nav style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 8 }}>
            {["Pull requests", "Issues", "Marketplace", "Explore"].map((item) => (
              <a
                key={item}
                href="#"
                style={{ fontSize: 14, color: "#e6edf3", fontWeight: 600, whiteSpace: "nowrap" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8b949e")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#e6edf3")}
              >
                {item}
              </a>
            ))}
          </nav>
          <div style={{ flex: 1 }} />
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

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1012, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Repo breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <OctocatIcon size={18} />
          <div style={{ fontSize: 20, fontWeight: 400 }}>
            <a href="#" style={{ color: "#58a6ff", fontWeight: 600 }}>community</a>
            <span style={{ color: "#8b949e", margin: "0 6px" }}>/</span>
            <a href="#" style={{ color: "#58a6ff", fontWeight: 600 }}>outbid.lol</a>
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

        {/* Repo action buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { icon: <EyeIcon size={14} />, label: "Watch", count: "1.9k" },
            { icon: <ForkIcon size={14} />, label: "Fork", count: "342" },
            { icon: <StarIcon size={14} />, label: "Star", count: fmt(totalStars) },
          ].map(({ icon, label, count }) => (
            <button
              key={label}
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
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#30363d")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#21262d")
              }
            >
              {icon}
              {label}
              <span
                style={{
                  padding: "0 6px",
                  background: "#30363d",
                  borderRadius: 20,
                  color: "#e6edf3",
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            </button>
          ))}

          {/* Online indicator */}
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
                animation: "pulse 2s infinite",
              }}
            />
            <strong style={{ color: "#3fb950" }}>1,903 online</strong>
            <span>· 1,062,005 visitors</span>
          </div>
        </div>

        <Tabs active={activeTab} onChange={setActiveTab} />

        {/* README panel */}
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
              No ads, no API keys, no revenue sharing. Just outbid your competition to get to the
              top.{" "}
              <strong style={{ color: "#f78166" }}>
                Will you take #1 when this site goes viral?
              </strong>
            </p>

            {/* Info alert */}
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
                  Your bid amount decides your rank. Paying less than the #1 price still puts you on the board at whatever place that bid can take. The top spot is currently{" "}
                  <strong style={{ color: "#e6edf3", fontFamily: "monospace" }}>
                    {fmtMoney(topBid?.amount ?? 0)}
                  </strong>.
                </p>
              </div>
            </div>

            {/* Claim box */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 6,
                padding: "20px 24px",
              }}
            >
              {/* Error banner */}
              {error && (
                <div
                  style={{
                    background: "rgba(248,81,73,0.1)",
                    border: "1px solid #f85149",
                    borderRadius: 6,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#f85149",
                    marginBottom: 16,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                  </svg>
                  {error}
                  <button
                    onClick={() => setError(null)}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      color: "#f85149",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

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
                      setBidAmount((v) => Math.max(1, v - 1))
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
                    onClick={() => setBidAmount((v) => v + 1)}
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
                  >
                    +
                  </button>
                </div>
              </div>

              {/* URL input + submit */}
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8b949e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
                  onClick={() => handleOutbid()}
                  disabled={submitting}
                  style={{
                    background: submitted ? "#1a7f37" : "#238636",
                    color: "white",
                    border: "1px solid rgba(240,246,252,0.1)",
                    borderRadius: 6,
                    padding: "6px 20px",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: submitting ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting)
                      (e.currentTarget as HTMLButtonElement).style.background = "#2ea043";
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting)
                      (e.currentTarget as HTMLButtonElement).style.background = submitted
                        ? "#1a7f37"
                        : "#238636";
                  }}
                >
                  {submitting ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{ animation: "spin 0.8s linear infinite" }}
                      >
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Submitting…
                    </>
                  ) : submitted ? (
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
                Already on the list? Enter the same URL or @handle and up your bid to get back to
                the top.
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard panel */}
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
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
              {!loading && (
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
              )}
            </div>
            <button
              id="refresh-leaderboard"
              onClick={handleRefresh}
              disabled={isRefreshing}
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
                cursor: isRefreshing ? "not-allowed" : "pointer",
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
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <div
            role="list"
            style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : bids.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#8b949e",
                  fontSize: 14,
                }}
              >
                <p style={{ margin: 0 }}>No bids yet. Be the first to claim #1!</p>
              </div>
            ) : (
              bids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onOutbid={handleCardOutbid}
                  onClickBid={handleClickBid}
                />
              ))
            )}
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
          {["Terms", "Privacy", "Security", "Status", "Docs"].map((l) => (
            <a key={l} href="#" style={{ color: "#6e7681" }}>{l}</a>
          ))}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <OctocatIcon size={14} />
            Backed by SQLite · Powered by Drizzle
          </span>
        </footer>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
