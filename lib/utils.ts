import { randomBytes } from "crypto";

export class InvalidUrlError extends Error {}

/**
 * Accepts loose input ("example.com", "http://example.com/path") and returns
 * a normalized https URL plus its hostname. Rejects anything that isn't a
 * plausible public hostname (no localhost/IPs/internal names).
 */
export function normalizeUrl(input: string): { url: string; hostname: string } {
  const trimmed = input.trim();
  if (!trimmed) throw new InvalidUrlError("Enter a URL to scan.");

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new InvalidUrlError("That doesn't look like a valid URL.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  ) {
    throw new InvalidUrlError("Private and local addresses can't be scanned.");
  }

  if (!hostname.includes(".")) {
    throw new InvalidUrlError("Enter a full domain, e.g. example.com");
  }

  return { url: `https://${hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`, hostname };
}

export function generateSlug(): string {
  return randomBytes(6).toString("base64url");
}

export function timeoutSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}
