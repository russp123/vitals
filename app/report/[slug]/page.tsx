import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { scans } from "@/lib/db/schema";
import type { ScanReport } from "@/lib/checks/types";
import { Header } from "@/components/Header";
import { GradeBadge, SectionLabel } from "@/components/Pill";
import {
  PerformanceCard,
  HeadersCard,
  SslCard,
  DnsCard,
  MobileCard,
} from "@/components/ReportCards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getScan(slug: string) {
  const rows = await db.select().from(scans).where(eq(scans.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scan = await getScan(slug);
  if (!scan) return { title: "Report not found — Vitals" };
  return {
    title: `${scan.hostname} — ${scan.overallGrade} — Vitals`,
    description: `Site health report for ${scan.hostname}: overall grade ${scan.overallGrade}.`,
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scan = await getScan(slug);
  if (!scan) notFound();

  const report = scan.scores as ScanReport;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header title="Report" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <SectionLabel index={2}>Results</SectionLabel>

        <div className="mt-4 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-4xl text-text-primary sm:text-5xl">
              {scan.hostname}
            </h1>
            <p className="mt-2 font-mono-label text-[12px] text-text-tertiary">
              Scanned {new Date(scan.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GradeBadge grade={scan.overallGrade} size="lg" />
            <div>
              <p className="font-mono-label text-[11px] uppercase text-text-tertiary">
                Overall score
              </p>
              <p className="font-display text-2xl text-text-primary">{scan.overallScore}/100</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <PerformanceCard report={report} />
          <HeadersCard report={report} />
          <SslCard report={report} />
          <DnsCard report={report} />
          <MobileCard report={report} />
        </div>
      </main>
    </div>
  );
}
