"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
type Bid = {
  id: number;
  rank: number;
  name: string;
  url: string;
  favicon: string | null;
  description: string | null;
  timeAgo: string;
  clicks: number;
  amount: number;
  stars: number;
  forks: number;
  language: string | null;
  langColor: string | null;
  paid: boolean;
};

type ActivityEvent = {
  id: string | number;
  type: string;
  title: string;
  description: string | null;
  timeAgo: string;
  amount: number;
  bidName: string;
  rank: number;
  timestamp: string;
};

type Stats = {
  totalVolume: number;
  totalClicks: number;
  totalStars: number;
  totalProjects: number;
  topBidAmount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toLocaleString();
}

function fmtMoney(n: number) {
  return "$" + n.toLocaleString();
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function CrownIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

function StarIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

function CheckIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FlameIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.6 2.16-6.7 5.25-8.1.38-.17.82.02.97.4.15.38-.04.81-.42.97C6.31 8.35 4.5 10.98 4.5 14c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-2.2-1.02-4.22-2.73-5.54-.33-.25-.4-.73-.14-1.06.25-.33.73-.4 1.06-.14C20.08 9.07 21.5 11.41 21.5 14c0 4.97-4.03 9-9.5 9zM12 18c-2.21 0-4-1.79-4-4 0-1.39.73-2.61 1.83-3.31.33-.21.78-.11.99.22.21.33.11.78-.22.99-.65.41-1.1 1.15-1.1 1.99 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-.62-.23-1.19-.62-1.63-.28-.31-.26-.79.05-1.07.31-.28.79-.26 1.07.05.62.71.99 1.63.99 2.65 0 2.21-1.79 4-4 4z" />
    </svg>
  );
}

export default function Home() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalVolume: 0,
    totalClicks: 0,
    totalStars: 0,
    totalProjects: 0,
    topBidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [urlInput, setUrlInput] = useState("");
  const [bidAmount, setBidAmount] = useState(10);
  const [customDesc, setCustomDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Metadata Preview
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaData, setMetaData] = useState<{
    name?: string;
    description?: string;
    stars?: number;
    forks?: number;
    language?: string | null;
    langColor?: string | null;
    favicon?: string;
  } | null>(null);

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<"leaderboard" | "activity" | "about" | "rules">("leaderboard");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "clicks" | "stars">("rank");

  // ── Fetch bids & activity from database API ───────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/bids");
      if (!res.ok) throw new Error("Failed to load auction board data from database");
      const data = await res.json();
      const loadedBids = data.bids || [];
      setBids(loadedBids);
      setActivities(data.activities || []);
      if (data.stats) setStats(data.stats);

      if (loadedBids.length > 0) {
        setBidAmount(loadedBids[0].amount + 1);
      } else {
        setBidAmount(10);
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const res = await fetch("/api/bids");
        if (!res.ok) throw new Error("Failed to load auction board data");
        const data = await res.json();
        if (!ignore) {
          const loadedBids = data.bids || [];
          setBids(loadedBids);
          setActivities(data.activities || []);
          if (data.stats) setStats(data.stats);
          if (loadedBids.length > 0) {
            setBidAmount(loadedBids[0].amount + 1);
          }
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const status = params.get("status");
            if (status === "failed") {
              setError("Payment was cancelled or failed on Dodo Payments.");
              setPaymentSuccess(false);
            } else if (params.get("payment") === "success" && status !== "failed") {
              setPaymentSuccess(true);
            }
          }
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

  // ── URL Metadata Auto-Enrichment ──────────────────────────────────────────
  useEffect(() => {
    const trimmed = urlInput.trim();
    const isValid = trimmed.length >= 4 && (trimmed.includes(".") || trimmed.includes("/"));

    const timer = setTimeout(async () => {
      if (!isValid) {
        setMetaData(null);
        return;
      }

      setMetaLoading(true);
      try {
        const res = await fetch(`/api/meta?url=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setMetaData(data);
          if (data.description && !customDesc) {
            setCustomDesc(data.description);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch meta:", err);
      } finally {
        setMetaLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [urlInput, customDesc]);

  // ── Simulated Rank Calculation ────────────────────────────────────────────
  const simulatedRank = useMemo(() => {
    if (!bids.length) return 1;
    const index = bids.findIndex((b) => bidAmount > b.amount);
    return index === -1 ? bids.length + 1 : index + 1;
  }, [bids, bidAmount]);

  const topBid = bids[0];
  const thirdBid = bids[2];

  // ── Quick Bid Presets ─────────────────────────────────────────────────────
  function handleQuickBidChip(action: "top1" | "top3" | 50 | 100 | 500) {
    if (action === "top1") {
      setBidAmount((topBid?.amount ?? 0) + 1);
    } else if (action === "top3") {
      setBidAmount((thirdBid?.amount ?? 50) + 1);
    } else {
      setBidAmount((prev) => prev + action);
    }
  }

  // ── Submit Bid to Database ────────────────────────────────────────────────
  async function handlePlaceBid(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        url: urlInput.trim(),
        name: metaData?.name,
        description: customDesc || metaData?.description,
        amount: bidAmount,
        language: metaData?.language,
        langColor: metaData?.langColor,
        stars: metaData?.stars,
        forks: metaData?.forks,
        favicon: metaData?.favicon,
      };

      // Call Dodo Checkout API
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to initiate Dodo checkout");
      }

      const data = await res.json();

      // If Dodo checkout URL is returned, redirect customer to payment page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setUrlInput("");
      setCustomDesc("");
      setMetaData(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Outbid from Card ──────────────────────────────────────────────────────
  function handleCardOutbid(bid: Bid) {
    setUrlInput(bid.url);
    setBidAmount(bid.amount + 1);
    const input = document.getElementById("bid-url-input");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // ── Click Tracker ─────────────────────────────────────────────────────────
  async function handleCardClick(bid: Bid) {
    try {
      fetch(`/api/bids/${bid.id}/click`, { method: "POST" });
      setBids((prev) =>
        prev.map((b) => (b.id === bid.id ? { ...b, clicks: b.clicks + 1 } : b))
      );
      setStats((prev) => ({ ...prev, totalClicks: prev.totalClicks + 1 }));
    } catch {
      // Non-blocking
    }
  }

  // ── Filtered & Sorted Bids ────────────────────────────────────────────────
  const filteredBids = useMemo(() => {
    let list = [...bids];

    if (selectedLanguage !== "All") {
      list = list.filter((b) => b.language === selectedLanguage);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q)
      );
    }

    if (sortBy === "clicks") {
      list.sort((a, b) => b.clicks - a.clicks);
    } else if (sortBy === "stars") {
      list.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    } else {
      list.sort((a, b) => b.amount - a.amount);
    }

    return list;
  }, [bids, selectedLanguage, searchQuery, sortBy]);

  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    bids.forEach((b) => {
      if (b.language) set.add(b.language);
    });
    return ["All", ...Array.from(set)];
  }, [bids]);

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#f1f5f9] flex flex-col selection:bg-amber-500/30 selection:text-amber-300">
      {/* ── Top Live Marquee Ticker ───────────────────────────────────────── */}
      <div className="bg-[#0b1018] border-b border-[#1b2434] py-2 overflow-hidden text-xs text-[#94a3b8]">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-mono">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <strong className="text-emerald-400">DATABASE SYNCED</strong> · {stats.totalProjects} Active Projects
          </span>
          <span className="text-slate-400">
            👑 #1 Reigning: <strong className="text-amber-400">{topBid ? topBid.name : "None (Available)"}</strong> ({topBid ? fmtMoney(topBid.amount) : "$0"})
          </span>
          <span className="text-slate-400">
            📊 Total Volume: <strong className="text-emerald-400">{fmtMoney(stats.totalVolume)}</strong>
          </span>
          <span className="text-slate-400">
            ⚡ Total Clicks: <strong className="text-sky-400">{fmtNum(stats.totalClicks)}</strong>
          </span>
          <span className="text-slate-400">
            ⭐ GitHub Stars: <strong className="text-amber-300">{fmtNum(stats.totalStars)}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <strong className="text-emerald-400">DATABASE SYNCED</strong> · {stats.totalProjects} Active Projects
          </span>
        </div>
      </div>

      {/* ── Main Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#070a0f]/90 backdrop-blur-md border-b border-[#1b2434]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="size-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-extrabold text-lg">
                👑
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-lg text-white group-hover:text-amber-400 transition-colors">
                  bidopensource<span className="text-amber-400">.lol</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Open Source Auction Board
                </span>
              </div>
            </Link>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-[#0f1724] p-1 rounded-xl border border-[#1e2a3f]">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "leaderboard"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "activity"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Live Feed
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "about"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "rules"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Rules
            </button>
          </nav>
        </div>
      </header>

      {/* ── Main Body Container ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Payment Success Alert */}
        {paymentSuccess && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-[#0e1724] to-[#090d14] border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold text-lg shrink-0">
                ✓
              </div>
              <div>
                <div className="font-bold text-white text-base">Payment Succeeded! 🎉</div>
                <div className="text-xs text-slate-300">
                  Your bid has been processed by Dodo Payments and your rank is now live on the board.
                </div>
              </div>
            </div>
            <button
              onClick={() => setPaymentSuccess(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: LEADERBOARD & AUCTION CONSOLE */}
        {activeTab === "leaderboard" && (
          <>
            {/* ── King of the Hill #1 Spotlight Podium ──────────────────── */}
            {topBid ? (
              <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-b from-amber-500/10 via-[#0e1420] to-[#090d14] border-2 border-amber-500/50 glow-gold shadow-2xl overflow-hidden">
                <div className="absolute -right-10 -top-10 size-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="size-16 md:size-20 rounded-2xl bg-[#141b28] border-2 border-amber-400/80 p-2 flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden">
                        {topBid.favicon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={topBid.favicon}
                            alt={topBid.name}
                            className="size-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-black text-amber-400">
                            {topBid.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="crown-float absolute -top-3.5 -right-3.5 size-7 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                        <CrownIcon className="size-4" />
                      </div>
                    </div>

                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-black">
                          #1 Reigning Champion
                        </span>
                        <a
                          href={topBid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleCardClick(topBid)}
                          className="font-bold text-lg md:text-xl text-white hover:text-amber-400 transition-colors"
                        >
                          {topBid.name} ↗
                        </a>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                        {topBid.description || "The leading open source project holding the top spot."}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-1">
                        {topBid.language && (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: topBid.langColor || "#38bdf8" }}
                            />
                            {topBid.language}
                          </span>
                        )}
                        {topBid.stars > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <StarIcon className="size-3.5" />
                            {fmtNum(topBid.stars)} stars
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                          {fmtNum(topBid.clicks)} clicks
                        </span>
                        <span className="text-slate-500 font-mono">Held for {topBid.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* King's Price & Dethrone Button */}
                  <div className="flex flex-col items-start md:items-end gap-2 bg-[#121927]/80 p-4 rounded-xl border border-amber-500/30">
                    <span className="text-xs text-slate-400 font-medium">Reign Price</span>
                    <span className="font-mono text-2xl md:text-3xl font-extrabold text-amber-400">
                      {fmtMoney(topBid.amount)}
                    </span>
                    <button
                      onClick={() => handleCardOutbid(topBid)}
                      className="w-full md:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                      Dethrone for {fmtMoney(topBid.amount + 1)}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-b from-amber-500/5 via-[#0e1420] to-[#090d14] border border-amber-500/30 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-amber-500/20 text-amber-400 font-extrabold text-2xl flex items-center justify-center mx-auto">
                  👑
                </div>
                <h3 className="text-xl font-bold text-white">#1 Crown is Unclaimed</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Be the very first open source project to claim the top spot on the live auction board.
                </p>
              </div>
            )}

            {/* ── Interactive Bidding Console & Rank Simulator ───────────── */}
            <section className="rounded-2xl p-6 md:p-8 bg-[#0c111a] border border-[#1c273a] shadow-xl space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Claim Your Spot On The Leaderboard
                </h2>
                <p className="text-sm text-slate-400">
                  No algorithms. No ad networks. The higher your bid, the higher your rank. Paying less than #1 still places you on the board at your winning position.
                </p>
              </div>

              {/* Dynamic Rank Simulator Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-500 text-black font-black text-lg flex items-center justify-center shrink-0">
                    #{simulatedRank}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                      Live Rank Prediction
                    </div>
                    <div className="text-sm font-bold text-white">
                      A bid of <span className="font-mono text-emerald-400">{fmtMoney(bidAmount)}</span> secures{" "}
                      <span className="text-amber-400">Rank #{simulatedRank}</span>
                      {simulatedRank === 1 ? " (👑 The #1 Crown Spot!)" : ` (Beating ${Math.max(0, bids.length - simulatedRank + 1)} projects)`}
                    </div>
                  </div>
                </div>

                {/* Quick Bid Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickBidChip("top1")}
                    className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-colors"
                  >
                    👑 Claim #1
                  </button>
                  {bids.length >= 3 && (
                    <button
                      type="button"
                      onClick={() => handleQuickBidChip("top3")}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500 hover:text-black transition-colors"
                    >
                      Top 3
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQuickBidChip(50)}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-[#162030] text-slate-300 hover:bg-[#202c42] transition-colors"
                  >
                    +$50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickBidChip(100)}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-[#162030] text-slate-300 hover:bg-[#202c42] transition-colors"
                  >
                    +$100
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickBidChip(500)}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-[#162030] text-slate-300 hover:bg-[#202c42] transition-colors"
                  >
                    +$500
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* URL / Handle Input */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      GitHub Repo or Product URL
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="bid-url-input"
                        type="text"
                        required
                        placeholder="e.g. astral-sh/uv or https://turborepo.org"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full bg-[#080d15] border border-[#1f2b40] focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all pr-10 font-mono"
                      />
                      {metaLoading && (
                        <div className="absolute right-3 size-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Bid Amount Input with Stepper */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Bid Amount ($ USD)
                    </label>
                    <div className="flex items-center bg-[#080d15] border border-[#1f2b40] focus-within:border-amber-400 rounded-xl px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setBidAmount((v) => Math.max(1, v - 10))}
                        className="size-8 rounded-lg bg-[#141d2c] hover:bg-[#1f2c42] text-slate-300 font-bold text-sm flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-transparent text-center font-mono font-bold text-emerald-400 text-lg outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setBidAmount((v) => v + 10)}
                        className="size-8 rounded-lg bg-[#141d2c] hover:bg-[#1f2c42] text-slate-300 font-bold text-sm flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auto-detected Metadata Card (if loaded) */}
                {metaData && (
                  <div className="p-3.5 rounded-xl bg-[#090e17] border border-[#1b263b] flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      {metaData.favicon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={metaData.favicon}
                          alt="icon"
                          className="size-8 rounded-lg object-contain bg-black/40 border border-slate-700"
                        />
                      )}
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {metaData.name}
                          {metaData.language && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1a2538] text-sky-400 font-mono">
                              {metaData.language}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 line-clamp-1">
                          {metaData.description || "Auto-detected project metadata."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 font-mono shrink-0">
                      {metaData.stars ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <StarIcon className="size-3" />
                          {fmtNum(metaData.stars)}
                        </span>
                      ) : null}
                      <span className="text-emerald-400">✓ Auto Verified</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError(null)} className="text-rose-300 font-bold">
                      ✕
                    </button>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <span className="text-xs text-slate-500">
                    Existing project? Re-enter URL to increase your bid and climb ranks.
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
                      submitted
                        ? "bg-emerald-500 text-black shadow-emerald-500/25"
                        : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black hover:brightness-110 shadow-amber-500/25"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving to Database…
                      </>
                    ) : submitted ? (
                      <>
                        <CheckIcon className="size-4" />
                        Bid Placed Successfully!
                      </>
                    ) : (
                      <>
                        <span>Outbid for {fmtMoney(bidAmount)}</span>
                        <span className="text-xs opacity-75">→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* ── Leaderboard Roster & Filter Controls ─────────────────────── */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    Live Leaderboard
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#182335] text-slate-400 border border-[#24334b]">
                      {filteredBids.length} Projects
                    </span>
                  </h3>
                </div>

                {/* Controls: Search, Language Filter, Sort & Refresh */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Sort Selector */}
                  <div className="flex items-center gap-1 bg-[#0d141f] p-1 rounded-xl border border-[#1a2537]">
                    <button
                      onClick={() => setSortBy("rank")}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        sortBy === "rank" ? "bg-[#223048] text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Top Rank
                    </button>
                    <button
                      onClick={() => setSortBy("clicks")}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        sortBy === "clicks" ? "bg-[#223048] text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Most Clicks
                    </button>
                    <button
                      onClick={() => setSortBy("stars")}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        sortBy === "stars" ? "bg-[#223048] text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Stars
                    </button>
                  </div>

                  {/* Language Pills */}
                  {allLanguages.length > 1 && (
                    <div className="flex items-center gap-1 bg-[#0d141f] p-1 rounded-xl border border-[#1a2537] overflow-x-auto max-w-xs">
                      {allLanguages.slice(0, 5).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                            selectedLanguage === lang
                              ? "bg-[#223048] text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search Bar */}
                  <input
                    type="text"
                    placeholder="Search projects…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0d141f] border border-[#1a2537] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 w-36"
                  />

                  {/* Refresh Button */}
                  <button
                    onClick={async () => {
                      setIsRefreshing(true);
                      await fetchData();
                      setIsRefreshing(false);
                    }}
                    disabled={isRefreshing}
                    className="p-2 rounded-xl bg-[#0d141f] border border-[#1a2537] text-slate-400 hover:text-white transition-colors"
                    title="Refresh database"
                  >
                    <svg
                      className={`size-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M21 21v-5h-5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Roster Cards List */}
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-2xl bg-[#0c121c] border border-[#182335] animate-pulse"
                    />
                  ))
                ) : filteredBids.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#0b1018] border border-[#172233] text-slate-500 space-y-2">
                    <div className="text-3xl">🚀</div>
                    <div className="font-bold text-slate-300">No bids on the leaderboard yet</div>
                    <p className="text-xs max-w-sm mx-auto">
                      Be the very first project to place a bid and take the #1 Crown!
                    </p>
                  </div>
                ) : (
                  filteredBids.map((bid) => {
                    const isTop1 = bid.rank === 1;
                    const isTop2 = bid.rank === 2;
                    const isTop3 = bid.rank === 3;

                    return (
                      <div
                        key={bid.id}
                        className={`group relative rounded-2xl p-4 md:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                          isTop1
                            ? "bg-gradient-to-r from-amber-500/10 via-[#0e1522] to-[#0a0e16] border-2 border-amber-500/60 shadow-lg shadow-amber-500/10"
                            : isTop2
                            ? "bg-gradient-to-r from-slate-400/10 via-[#0e1522] to-[#0a0e16] border-2 border-slate-400/50"
                            : isTop3
                            ? "bg-gradient-to-r from-amber-700/10 via-[#0e1522] to-[#0a0e16] border-2 border-amber-700/40"
                            : "bg-[#0b1018] hover:bg-[#101724] border border-[#172233] hover:border-[#273750]"
                        }`}
                        onClick={() => {
                          handleCardClick(bid);
                          window.open(bid.url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        {/* Left: Rank + Icon + Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Rank Badge */}
                          <div
                            className={`size-10 rounded-xl font-mono font-extrabold text-sm flex items-center justify-center shrink-0 ${
                              isTop1
                                ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                                : isTop2
                                ? "bg-slate-300 text-black"
                                : isTop3
                                ? "bg-amber-700 text-white"
                                : "bg-[#141c2b] text-slate-400 border border-[#223046]"
                            }`}
                          >
                            #{bid.rank}
                          </div>

                          {/* Favicon */}
                          <div className="size-11 rounded-xl bg-[#131b29] border border-[#202d44] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                            {bid.favicon ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={bid.favicon}
                                alt={bid.name}
                                className="size-full object-contain"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="font-bold text-slate-400 text-sm">
                                {bid.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm md:text-base text-white group-hover:text-amber-400 transition-colors truncate">
                                {bid.name}
                              </span>
                              {isTop1 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black">
                                  👑 #1 Crown
                                </span>
                              )}
                            </div>

                            {bid.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 font-medium">
                                {bid.description}
                              </p>
                            )}

                            {/* Tags & Metadata */}
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                              {bid.language && (
                                <span className="inline-flex items-center gap-1 text-slate-400 font-sans">
                                  <span
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: bid.langColor || "#38bdf8" }}
                                  />
                                  {bid.language}
                                </span>
                              )}
                              {bid.stars > 0 && (
                                <span className="text-amber-400/80 inline-flex items-center gap-1 font-sans">
                                  <StarIcon className="size-3" />
                                  {fmtNum(bid.stars)}
                                </span>
                              )}
                              <span className="text-emerald-400/90 inline-flex items-center gap-1 font-sans">
                                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                                {fmtNum(bid.clicks)} clicks
                              </span>
                              <span>{bid.timeAgo}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Quick Outbid Button */}
                        <div
                          className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#182335]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-right">
                            <div className="text-xs text-slate-500 font-mono">Current Bid</div>
                            <div className="font-mono text-base md:text-lg font-bold text-emerald-400">
                              {fmtMoney(bid.amount)}
                            </div>
                          </div>

                          <button
                            onClick={() => handleCardOutbid(bid)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#172338] hover:bg-amber-500 hover:text-black text-slate-200 border border-[#273854] hover:border-amber-400 transition-all active:scale-95"
                          >
                            Outbid ({fmtMoney(bid.amount + 1)})
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: LIVE ACTIVITY FEED */}
        {activeTab === "activity" && (
          <section className="rounded-2xl p-6 md:p-8 bg-[#0c111a] border border-[#1c273a] shadow-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FlameIcon className="size-6 text-orange-500" />
                Live Auction Stream
              </h2>
              <p className="text-sm text-slate-400">
                Real-time chronological audit trail of all bids, overtakes, and traffic milestones saved in the database.
              </p>
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  No activity recorded in the database yet. Place a bid to create the first event!
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl bg-[#080d16] border border-[#1b263b] flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          act.type === "dethrone"
                            ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                            : act.type === "milestone"
                            ? "bg-emerald-500 text-black"
                            : "bg-[#182438] text-sky-400 border border-[#263752]"
                        }`}
                      >
                        {act.type === "dethrone" ? "👑" : act.type === "milestone" ? "⚡" : "💰"}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm text-white">{act.title}</div>
                        {act.description && <div className="text-xs text-slate-400">{act.description}</div>}
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs text-slate-500 shrink-0">
                      <span className="font-bold text-emerald-400">{fmtMoney(act.amount)}</span>
                      <div>{act.timeAgo}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* TAB 3: ABOUT & VIRAL ECONOMICS */}
        {activeTab === "about" && (
          <section className="rounded-2xl p-6 md:p-8 bg-[#0c111a] border border-[#1c273a] shadow-xl space-y-6 text-slate-300 text-sm leading-relaxed">
            <div className="space-y-2 border-b border-[#1c273a] pb-6">
              <h2 className="text-2xl md:text-3xl font-black text-white">
                What is bidopensource.lol?
              </h2>
              <p className="text-slate-400 text-base">
                An open-source competitive leaderboard inspired by outbid.lol and Million Dollar Homepage, built to give developers, tools, and repositories uncensored visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-xl bg-[#080d16] border border-[#1a2538] space-y-2">
                <div className="text-2xl font-bold text-amber-400">01. Pure Bidding</div>
                <div className="font-bold text-white text-base">Ranked by Price</div>
                <p className="text-xs text-slate-400">
                  No hidden algorithms, paywalled SEO tricks, or editorial gatekeepers. Your bid amount purely decides your rank in the database.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#080d16] border border-[#1a2538] space-y-2">
                <div className="text-2xl font-bold text-emerald-400">02. Live Organic Traffic</div>
                <div className="font-bold text-white text-base">Real Click Delivery</div>
                <p className="text-xs text-slate-400">
                  Every rank links directly to your repo or landing page with verified referral tracking and click counters.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#080d16] border border-[#1a2538] space-y-2">
                <div className="text-2xl font-bold text-sky-400">03. Perpetual Re-bidding</div>
                <div className="font-bold text-white text-base">Fight for #1</div>
                <p className="text-xs text-slate-400">
                  If another project outbids you, you don&apos;t get removed—you simply drop down to the rank your current bid beats until you up your bid.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: RULES & FAIR PLAY */}
        {activeTab === "rules" && (
          <section className="rounded-2xl p-6 md:p-8 bg-[#0c111a] border border-[#1c273a] shadow-xl space-y-6 text-slate-300 text-sm">
            <div className="space-y-2 border-b border-[#1c273a] pb-6">
              <h2 className="text-2xl md:text-3xl font-black text-white">Board Rules & Guidelines</h2>
              <p className="text-slate-400">
                Simple rules to ensure bidopensource.lol remains an authentic, high-signal developer board.
              </p>
            </div>

            <ul className="space-y-4 list-disc list-inside text-slate-300">
              <li>
                <strong className="text-white">Legitimate Projects Only:</strong> Submissions must be open source projects, developer tools, tech SaaS, or builder profiles.
              </li>
              <li>
                <strong className="text-white">No Malicious Content:</strong> URLs linking to scams, malware, or phishing will be permanently removed with no refunds.
              </li>
              <li>
                <strong className="text-white">Tie Breaking:</strong> If two bids have the exact same amount, the earlier bid retains the higher rank.
              </li>
              <li>
                <strong className="text-white">Non-refundable:</strong> Bids represent immediate advertising placement and visibility and are non-refundable.
              </li>
            </ul>
          </section>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#182436] bg-[#080c14] py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 bidopensource.lol</span>
            <span>·</span>
            <span>Powered by Next.js 16 & Drizzle ORM Database</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab("leaderboard")} className="hover:text-slate-300">
              Leaderboard
            </button>
            <button onClick={() => setActiveTab("about")} className="hover:text-slate-300">
              About
            </button>
            <button onClick={() => setActiveTab("rules")} className="hover:text-slate-300">
              Rules
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
