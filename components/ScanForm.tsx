"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const PROGRESS_STEPS = [
  "Checking performance…",
  "Inspecting security headers…",
  "Verifying SSL/TLS…",
  "Resolving DNS & WHOIS…",
  "Scoring mobile-friendliness…",
];

export function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    setStepIndex(0);

    intervalRef.current = setInterval(() => {
      setStepIndex((i) => (i < PROGRESS_STEPS.length - 1 ? i + 1 : i));
    }, 2400);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      router.push(`/report/${data.slug}`);
    } catch {
      setError("Couldn't reach the scanner. Check your connection and try again.");
      setLoading(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          disabled={loading}
          className="flex-1 rounded-full border border-border bg-bg-elevated px-5 py-3 font-mono-label text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || url.trim().length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-mono-label text-[13px] uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Scan →"}
        </button>
      </form>

      {loading ? (
        <p className="mt-3 font-mono-label text-[12px] text-text-secondary">
          {PROGRESS_STEPS[stepIndex]}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 font-mono-label text-[12px] text-[color:var(--grade-f)]">{error}</p>
      ) : null}
    </div>
  );
}
