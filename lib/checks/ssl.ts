import tls from "node:tls";
import type { SslResult } from "./types";

const CONNECT_TIMEOUT_MS = 10_000;

function connectTls(hostname: string): Promise<tls.PeerCertificate & { authorized: boolean; protocol: string | null }> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        timeout: CONNECT_TIMEOUT_MS,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const authorized = socket.authorized;
        const protocol = socket.getProtocol();
        socket.end();
        if (!cert || Object.keys(cert).length === 0) {
          reject(new Error("No certificate presented."));
          return;
        }
        resolve({ ...cert, authorized, protocol });
      }
    );

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Connection to port 443 timed out."));
    });

    socket.on("error", (err) => {
      reject(err);
    });
  });
}

export async function checkSsl(hostname: string): Promise<SslResult> {
  try {
    const cert = await connectTls(hostname);
    const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
    const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
    const now = new Date();

    const daysUntilExpiry = validTo
      ? Math.round((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const notExpired = validTo ? validTo.getTime() > now.getTime() : false;
    const valid = cert.authorized && notExpired;

    let score = 0;
    if (valid && daysUntilExpiry !== null) {
      if (daysUntilExpiry > 30) score = 100;
      else if (daysUntilExpiry > 7) score = 70;
      else if (daysUntilExpiry > 0) score = 40;
      else score = 0;
    } else if (notExpired && !cert.authorized) {
      score = 20;
    }

    const toSingle = (v: string | string[] | undefined): string | null =>
      Array.isArray(v) ? v[0] ?? null : v ?? null;

    return {
      status: score >= 70 ? "ok" : score >= 40 ? "warn" : "fail",
      score,
      valid,
      issuer: toSingle(cert.issuer?.O) ?? toSingle(cert.issuer?.CN),
      subject: toSingle(cert.subject?.CN),
      validFrom: validFrom ? validFrom.toISOString() : null,
      validTo: validTo ? validTo.toISOString() : null,
      daysUntilExpiry,
      protocol: cert.protocol ?? null,
    };
  } catch (err) {
    return {
      status: "fail",
      score: 0,
      valid: false,
      issuer: null,
      subject: null,
      validFrom: null,
      validTo: null,
      daysUntilExpiry: null,
      protocol: null,
      error:
        err instanceof Error
          ? `No valid HTTPS certificate found (${err.message})`
          : "No valid HTTPS certificate found.",
    };
  }
}
