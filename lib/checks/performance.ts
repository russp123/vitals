import type { CoreWebVital, PerformanceResult } from "./types";

const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const FETCH_TIMEOUT_MS = 25_000;

interface LighthouseAudit {
  title?: string;
  displayValue?: string;
  numericValue?: number;
  score?: number | null;
}

interface PageSpeedResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score?: number | null };
    };
    audits?: Record<string, LighthouseAudit>;
  };
}

const VITAL_AUDITS: { id: string; label: string }[] = [
  { id: "largest-contentful-paint", label: "LCP" },
  { id: "cumulative-layout-shift", label: "CLS" },
  { id: "interaction-to-next-paint", label: "INP" },
  { id: "server-response-time", label: "TTFB" },
];

function extractVitals(audits: Record<string, LighthouseAudit> | undefined): CoreWebVital[] {
  if (!audits) return [];
  return VITAL_AUDITS.filter((v) => audits[v.id]).map((v) => {
    const audit = audits[v.id];
    const score = audit.score ?? null;
    return {
      label: v.label,
      value: audit.displayValue ?? "—",
      numericValue: audit.numericValue ?? null,
      status: score === null ? "warn" : score >= 0.9 ? "ok" : score >= 0.5 ? "warn" : "fail",
    } as CoreWebVital;
  });
}

async function runPageSpeed(
  targetUrl: string,
  strategy: "mobile" | "desktop",
  apiKey: string
): Promise<{ score: number | null; vitals: CoreWebVital[] }> {
  const params = new URLSearchParams({
    url: targetUrl,
    strategy,
    category: "performance",
    key: apiKey,
  });

  const res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("PageSpeed API rate limit reached. Try again shortly.");
    throw new Error(`PageSpeed API responded with ${res.status}`);
  }

  const data: PageSpeedResponse = await res.json();
  const rawScore = data.lighthouseResult?.categories?.performance?.score;
  const score = typeof rawScore === "number" ? Math.round(rawScore * 100) : null;
  const vitals = extractVitals(data.lighthouseResult?.audits);

  return { score, vitals };
}

export async function checkPerformance(targetUrl: string): Promise<PerformanceResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    return {
      status: "skipped",
      mobileScore: null,
      desktopScore: null,
      mobileVitals: [],
      desktopVitals: [],
      error: "PAGESPEED_API_KEY is not configured.",
    };
  }

  try {
    const [mobile, desktop] = await Promise.all([
      runPageSpeed(targetUrl, "mobile", apiKey),
      runPageSpeed(targetUrl, "desktop", apiKey),
    ]);

    return {
      status: "ok",
      mobileScore: mobile.score,
      desktopScore: desktop.score,
      mobileVitals: mobile.vitals,
      desktopVitals: desktop.vitals,
    };
  } catch (err) {
    return {
      status: "error",
      mobileScore: null,
      desktopScore: null,
      mobileVitals: [],
      desktopVitals: [],
      error: err instanceof Error ? err.message : "Performance check failed.",
    };
  }
}
