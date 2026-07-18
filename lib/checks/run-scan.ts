import { checkPerformance } from "./performance";
import { checkHeaders } from "./headers";
import { checkSsl } from "./ssl";
import { checkDns } from "./dns";
import { computeOverallGrade, deriveMobileFriendliness } from "./grade";
import type { ScanReport } from "./types";

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export async function runScan(url: string, hostname: string): Promise<ScanReport> {
  const [performanceResult, headersResult, sslResult, dnsResult] = await Promise.allSettled([
    checkPerformance(url),
    checkHeaders(url),
    checkSsl(hostname),
    checkDns(hostname),
  ]);

  const performance = settled(performanceResult, {
    status: "error" as const,
    mobileScore: null,
    desktopScore: null,
    mobileVitals: [],
    desktopVitals: [],
    error: "Performance check crashed unexpectedly.",
  });

  const headers = settled(headersResult, {
    status: "error" as const,
    score: null,
    findings: [],
    error: "Header check crashed unexpectedly.",
  });

  const ssl = settled(sslResult, {
    status: "error" as const,
    score: null,
    valid: false,
    issuer: null,
    subject: null,
    validFrom: null,
    validTo: null,
    daysUntilExpiry: null,
    protocol: null,
    error: "SSL check crashed unexpectedly.",
  });

  const dns = settled(dnsResult, {
    status: "error" as const,
    score: null,
    records: [],
    whois: null,
    whoisSkipped: true,
    error: "DNS check crashed unexpectedly.",
  });

  const mobile = deriveMobileFriendliness(performance);
  const { overallScore, overallGrade, categories } = computeOverallGrade(
    performance,
    headers,
    ssl,
    dns,
    mobile
  );

  return {
    url,
    hostname,
    scannedAt: new Date().toISOString(),
    overallScore,
    overallGrade,
    categories,
    performance,
    headers,
    ssl,
    dns,
    mobile,
  };
}
