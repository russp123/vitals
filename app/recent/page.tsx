import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { scans } from "@/lib/db/schema";
import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/Pill";
import { RecentList, type RecentScanItem } from "@/components/RecentList";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recent scans — Vitals",
};

export default async function RecentPage() {
  const rows = await db
    .select({
      slug: scans.slug,
      hostname: scans.hostname,
      overallGrade: scans.overallGrade,
      overallScore: scans.overallScore,
      createdAt: scans.createdAt,
    })
    .from(scans)
    .orderBy(desc(scans.createdAt))
    .limit(50);

  const items: RecentScanItem[] = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header title="Recent" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <SectionLabel index={3}>History</SectionLabel>
        <h1 className="mt-4 font-display text-4xl text-text-primary sm:text-5xl">
          Recently scanned
        </h1>
        <p className="mt-4 max-w-lg text-[15px] text-text-secondary">
          Public scans run by anyone in the last little while. No accounts, no private data.
        </p>

        <div className="mt-10">
          <RecentList scans={items} />
        </div>
      </main>
    </div>
  );
}
