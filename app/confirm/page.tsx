"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

function ConfirmContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");

  useEffect(() => {
    if (!checkoutId) {
      setStatus("error");
      return;
    }
    // Give Polar's webhook a couple seconds to fire, then show success
    const timer = setTimeout(() => setStatus("success"), 2500);
    return () => clearTimeout(timer);
  }, [checkoutId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ color: "#e6edf3", marginBottom: 32 }}>
        <OctocatIcon size={48} />
      </div>

      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 12,
          padding: "40px 48px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid #30363d",
                borderTopColor: "#3fb950",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 24px",
              }}
            />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: "0 0 8px" }}>
              Confirming your payment…
            </h1>
            <p style={{ color: "#8b949e", fontSize: 14, margin: 0 }}>
              Talking to Polar to verify your bid
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(63,185,80,0.15)",
                border: "2px solid #3fb950",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 16 16" fill="#3fb950">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e6edf3", margin: "0 0 8px" }}>
              🎉 You&apos;re on the board!
            </h1>
            <p style={{ color: "#8b949e", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
              Payment confirmed. Your bid is now live on the leaderboard.
              It may take a few seconds to appear.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "#238636",
                color: "white",
                border: "1px solid rgba(240,246,252,0.1)",
                borderRadius: 6,
                padding: "8px 24px",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              View Leaderboard →
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(248,81,73,0.1)",
                border: "2px solid #f85149",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 16 16" fill="#f85149">
                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
              </svg>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: "0 0 8px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#8b949e", fontSize: 14, margin: "0 0 24px" }}>
              No checkout ID found. Please try again.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "#21262d",
                color: "#e6edf3",
                border: "1px solid #30363d",
                borderRadius: 6,
                padding: "8px 24px",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Back to home
            </a>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  );
}
