"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GradeBadge } from "./Pill";

export interface RecentScanItem {
  slug: string;
  hostname: string;
  overallGrade: string;
  overallScore: number;
  createdAt: string;
}

const FILTERS = ["ALL", "A", "B", "C", "D", "F"] as const;

export function RecentList({ scans }: { scans: RecentScanItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: scans.length, A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const s of scans) c[s.overallGrade] = (c[s.overallGrade] ?? 0) + 1;
    return c;
  }, [scans]);

  const filtered = filter === "ALL" ? scans : scans.filter((s) => s.overallGrade === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-[13px] py-1.5 font-mono-label text-[11px] uppercase tracking-wide transition-colors ${
              filter === f
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            {f} <span className="opacity-70">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col divide-y divide-border">
        {filtered.length === 0 ? (
          <p className="py-8 text-center font-mono-label text-[12px] text-text-tertiary">
            No scans in this range yet.
          </p>
        ) : (
          filtered.map((s) => (
            <Link
              key={s.slug}
              href={`/report/${s.slug}`}
              className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-bg-elevated"
            >
              <div className="flex items-center gap-4">
                <GradeBadge grade={s.overallGrade} size="sm" />
                <div>
                  <p className="font-mono-label text-[13px] text-text-primary">{s.hostname}</p>
                  <p className="text-[12px] text-text-tertiary">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="font-mono-label text-[12px] text-text-secondary">
                {s.overallScore}/100
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
