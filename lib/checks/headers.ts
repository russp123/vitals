import type { HeaderFinding, HeadersResult } from "./types";

const FETCH_TIMEOUT_MS = 12_000;

const CHECKED_HEADERS: { header: string; description: string }[] = [
  {
    header: "content-security-policy",
    description: "Restricts which sources of scripts, styles, and other resources can load.",
  },
  {
    header: "strict-transport-security",
    description: "Forces browsers to only connect over HTTPS.",
  },
  {
    header: "x-frame-options",
    description: "Prevents the page from being embedded in a clickjacking iframe.",
  },
  {
    header: "x-content-type-options",
    description: "Stops browsers from MIME-sniffing away from the declared content type.",
  },
  {
    header: "referrer-policy",
    description: "Controls how much referrer information is sent with requests.",
  },
  {
    header: "permissions-policy",
    description: "Restricts access to browser features like camera, mic, and geolocation.",
  },
];

export async function checkHeaders(targetUrl: string): Promise<HeadersResult> {
  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Vitals-Scanner/1.0 (+https://vitals.app)" },
    });

    const findings: HeaderFinding[] = CHECKED_HEADERS.map(({ header, description }) => {
      const value = res.headers.get(header);
      return { header, present: value !== null, value, description };
    });

    const presentCount = findings.filter((f) => f.present).length;
    const score = Math.round((presentCount / findings.length) * 100);

    return {
      status: score >= 70 ? "ok" : score >= 40 ? "warn" : "fail",
      score,
      findings,
    };
  } catch (err) {
    return {
      status: "error",
      score: null,
      findings: [],
      error: err instanceof Error ? err.message : "Could not reach the site to inspect headers.",
    };
  }
}
