import { NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { scans } from "@/lib/db/schema";
import { normalizeUrl, generateSlug, InvalidUrlError } from "@/lib/utils";
import { runScan } from "@/lib/checks/run-scan";

export const runtime = "nodejs";
export const maxDuration = 60;

const CACHE_WINDOW_MS = 24 * 60 * 60 * 1000;

const bodySchema = z.object({
  url: z.string().min(1, "Enter a URL to scan."),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  let normalized: { url: string; hostname: string };
  try {
    normalized = normalizeUrl(parsed.data.url);
  } catch (err) {
    const message = err instanceof InvalidUrlError ? err.message : "Invalid URL.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const cutoff = new Date(Date.now() - CACHE_WINDOW_MS);
    const existing = await db
      .select({ slug: scans.slug })
      .from(scans)
      .where(and(eq(scans.hostname, normalized.hostname), gt(scans.createdAt, cutoff)))
      .orderBy(desc(scans.createdAt))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ slug: existing[0].slug, cached: true });
    }

    const report = await runScan(normalized.url, normalized.hostname);
    const slug = generateSlug();

    await db.insert(scans).values({
      slug,
      url: normalized.url,
      hostname: normalized.hostname,
      overallGrade: report.overallGrade,
      overallScore: report.overallScore,
      scores: report,
    });

    return NextResponse.json({ slug, cached: false });
  } catch (err) {
    console.error("Scan failed:", err);
    return NextResponse.json(
      { error: "Something went wrong running that scan. Please try again." },
      { status: 500 }
    );
  }
}
