import type {
  CategoryGrade,
  DnsResult,
  HeadersResult,
  MobileFriendlinessResult,
  PerformanceResult,
  SslResult,
} from "./types";

/**
 * Overall grade is a weighted average of five categories. Weights reflect
 * how much each area affects a real visitor and how reliably we can
 * measure it without a paid API:
 *
 *   Performance        35%  — biggest visible impact on real users
 *   Security headers    25%  — cheap to fix, meaningfully reduces attack surface
 *   SSL/TLS             20%  — table stakes for trust and modern browsers
 *   Mobile-friendliness 10%  — derived from the PageSpeed mobile run
 *   DNS/WHOIS           10%  — mostly informational, small scoring impact
 */
const WEIGHTS = {
  performance: 0.35,
  headers: 0.25,
  ssl: 0.2,
  mobile: 0.1,
  dns: 0.1,
} as const;

export function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function deriveMobileFriendliness(performance: PerformanceResult): MobileFriendlinessResult {
  if (performance.status === "skipped") {
    return { status: "skipped", score: null, error: "Requires the performance check." };
  }
  if (performance.mobileScore === null) {
    return { status: "error", score: null, error: "Mobile PageSpeed run did not return a score." };
  }
  const score = performance.mobileScore;
  return {
    status: score >= 90 ? "ok" : score >= 50 ? "warn" : "fail",
    score,
  };
}

function performanceScore(performance: PerformanceResult): number | null {
  const scores = [performance.mobileScore, performance.desktopScore].filter(
    (s): s is number => s !== null
  );
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function computeOverallGrade(
  performance: PerformanceResult,
  headers: HeadersResult,
  ssl: SslResult,
  dns: DnsResult,
  mobile: MobileFriendlinessResult
): { overallScore: number; overallGrade: string; categories: CategoryGrade[] } {
  const perfScore = performanceScore(performance);

  const raw: { key: string; label: string; weight: number; score: number | null }[] = [
    { key: "performance", label: "Performance", weight: WEIGHTS.performance, score: perfScore },
    { key: "headers", label: "Security Headers", weight: WEIGHTS.headers, score: headers.score },
    { key: "ssl", label: "SSL/TLS", weight: WEIGHTS.ssl, score: ssl.score },
    { key: "mobile", label: "Mobile-Friendliness", weight: WEIGHTS.mobile, score: mobile.score },
    { key: "dns", label: "DNS", weight: WEIGHTS.dns, score: dns.score },
  ];

  const available = raw.filter((c) => c.score !== null);
  const totalWeight = available.reduce((sum, c) => sum + c.weight, 0);

  const overallScore =
    totalWeight > 0
      ? Math.round(
          available.reduce((sum, c) => sum + (c.score as number) * c.weight, 0) / totalWeight
        )
      : 0;

  const categories: CategoryGrade[] = raw.map((c) => ({
    ...c,
    grade: c.score !== null ? scoreToGrade(c.score) : null,
  }));

  return { overallScore, overallGrade: scoreToGrade(overallScore), categories };
}
