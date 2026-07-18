import { resolve4, resolve6, resolveMx, resolveTxt, resolveNs } from "node:dns/promises";
import type { DnsRecordSet, DnsResult, WhoisInfo } from "./types";

const RDAP_TIMEOUT_MS = 8_000;
const WHOIS_TIMEOUT_MS = 8_000;

async function safeResolve<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}

function registrableDomain(hostname: string): string {
  const parts = hostname.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
}

interface RdapEvent {
  eventAction?: string;
  eventDate?: string;
}
interface RdapEntity {
  roles?: string[];
  vcardArray?: [string, unknown[]];
}
interface RdapResponse {
  events?: RdapEvent[];
  entities?: RdapEntity[];
}

function extractRegistrarName(entities: RdapEntity[] | undefined): string | null {
  const registrar = entities?.find((e) => e.roles?.includes("registrar"));
  const vcard = registrar?.vcardArray?.[1];
  if (!Array.isArray(vcard)) return null;
  const fnEntry = vcard.find((field) => Array.isArray(field) && field[0] === "fn");
  return Array.isArray(fnEntry) ? (fnEntry[3] as string) ?? null : null;
}

async function lookupRdap(domain: string): Promise<WhoisInfo | null> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
      headers: { Accept: "application/rdap+json" },
    });
    if (!res.ok) return null;

    const data: RdapResponse = await res.json();
    const created = data.events?.find((e) => e.eventAction === "registration")?.eventDate ?? null;
    const expiry = data.events?.find((e) => e.eventAction === "expiration")?.eventDate ?? null;
    const registrar = extractRegistrarName(data.entities);

    const daysUntilExpiry = expiry
      ? Math.round((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      registrar,
      createdDate: created,
      expiryDate: expiry,
      daysUntilExpiry,
    };
  } catch {
    return null;
  }
}

async function lookupWhoisFallback(domain: string): Promise<WhoisInfo | null> {
  const apiKey = process.env.WHOIS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${encodeURIComponent(
        domain
      )}&outputFormat=JSON`,
      { signal: AbortSignal.timeout(WHOIS_TIMEOUT_MS) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const record = data?.WhoisRecord;
    if (!record) return null;

    const expiry = record.expiresDate ?? null;
    const daysUntilExpiry = expiry
      ? Math.round((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      registrar: record.registrarName ?? null,
      createdDate: record.createdDate ?? null,
      expiryDate: expiry,
      daysUntilExpiry,
    };
  } catch {
    return null;
  }
}

export async function checkDns(hostname: string): Promise<DnsResult> {
  const domain = registrableDomain(hostname);

  const [a, aaaa, mx, txt, ns, rdapWhois] = await Promise.all([
    safeResolve(() => resolve4(hostname)),
    safeResolve(() => resolve6(hostname)),
    safeResolve(() => resolveMx(hostname)),
    safeResolve(() => resolveTxt(hostname)),
    safeResolve(() => resolveNs(hostname)),
    lookupRdap(domain),
  ]);

  const whois = rdapWhois ?? (await lookupWhoisFallback(domain));
  const whoisSkipped = whois === null;

  const records: DnsRecordSet[] = [
    { type: "A", records: a },
    { type: "AAAA", records: aaaa },
    { type: "MX", records: mx.map((r) => `${r.exchange} (priority ${r.priority})`) },
    { type: "TXT", records: txt.map((r) => r.join("")) },
    { type: "NS", records: ns },
  ];

  const hasAddress = a.length > 0 || aaaa.length > 0;
  const hasNs = ns.length > 0;

  let score = 0;
  if (hasAddress) score += 60;
  if (hasNs) score += 25;
  if (whois && whois.daysUntilExpiry !== null) {
    score += whois.daysUntilExpiry > 30 ? 15 : whois.daysUntilExpiry > 0 ? 5 : 0;
  } else {
    score += 10;
  }
  score = Math.min(100, score);

  return {
    status: hasAddress ? (score >= 70 ? "ok" : "warn") : "fail",
    score,
    records,
    whois,
    whoisSkipped,
  };
}
