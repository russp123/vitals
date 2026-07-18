import type { ScanReport } from "@/lib/checks/types";
import { GradeBadge, Pill } from "./Pill";

function Card({ title, grade, children }: { title: string; grade: string | null; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
          {title}
        </h3>
        {grade ? <GradeBadge grade={grade} size="sm" /> : <Pill>N/A</Pill>}
      </div>
      {children}
    </div>
  );
}

function ErrorNote({ message }: { message?: string }) {
  return <p className="font-mono-label text-[12px] text-text-tertiary">{message ?? "Check unavailable."}</p>;
}

export function PerformanceCard({ report }: { report: ScanReport }) {
  const { performance } = report;
  const grade = report.categories.find((c) => c.key === "performance")?.grade ?? null;

  if (performance.status === "error" || performance.status === "skipped") {
    return (
      <Card title="Performance" grade={grade}>
        <ErrorNote message={performance.error} />
      </Card>
    );
  }

  return (
    <Card title="Performance" grade={grade}>
      <div className="mb-4 flex gap-6">
        <div>
          <p className="font-mono-label text-[10px] uppercase text-text-tertiary">Mobile</p>
          <p className="font-display text-3xl">{performance.mobileScore ?? "—"}</p>
        </div>
        <div>
          <p className="font-mono-label text-[10px] uppercase text-text-tertiary">Desktop</p>
          <p className="font-display text-3xl">{performance.desktopScore ?? "—"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {performance.mobileVitals.map((v) => (
          <div key={v.label} className="rounded-lg border border-border px-3 py-2">
            <p className="font-mono-label text-[10px] uppercase text-text-tertiary">{v.label}</p>
            <p className="font-mono-label text-[13px] text-text-primary">{v.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function HeadersCard({ report }: { report: ScanReport }) {
  const { headers } = report;
  const grade = report.categories.find((c) => c.key === "headers")?.grade ?? null;

  if (headers.status === "error") {
    return (
      <Card title="Security Headers" grade={grade}>
        <ErrorNote message={headers.error} />
      </Card>
    );
  }

  return (
    <Card title="Security Headers" grade={grade}>
      <ul className="flex flex-col gap-2">
        {headers.findings.map((f) => (
          <li key={f.header} className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono-label text-[12px] text-text-primary">{f.header}</p>
              <p className="text-[12px] text-text-secondary">{f.description}</p>
            </div>
            <Pill tone={f.present ? "accent" : "default"}>{f.present ? "Present" : "Missing"}</Pill>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function SslCard({ report }: { report: ScanReport }) {
  const { ssl } = report;
  const grade = report.categories.find((c) => c.key === "ssl")?.grade ?? null;

  if (!ssl.valid) {
    return (
      <Card title="SSL / TLS" grade={grade}>
        <ErrorNote message={ssl.error ?? "No valid certificate found."} />
      </Card>
    );
  }

  return (
    <Card title="SSL / TLS" grade={grade}>
      <dl className="flex flex-col gap-2 font-mono-label text-[12px]">
        <Row label="Issuer" value={ssl.issuer ?? "—"} />
        <Row label="Subject" value={ssl.subject ?? "—"} />
        <Row label="Protocol" value={ssl.protocol ?? "—"} />
        <Row
          label="Expires"
          value={
            ssl.validTo
              ? `${new Date(ssl.validTo).toLocaleDateString()} (${ssl.daysUntilExpiry}d)`
              : "—"
          }
        />
      </dl>
    </Card>
  );
}

export function DnsCard({ report }: { report: ScanReport }) {
  const { dns } = report;
  const grade = report.categories.find((c) => c.key === "dns")?.grade ?? null;

  return (
    <Card title="DNS / WHOIS" grade={grade}>
      <div className="mb-4 flex flex-col gap-2">
        {dns.records
          .filter((r) => r.records.length > 0)
          .map((r) => (
            <div key={r.type} className="flex items-start justify-between gap-3">
              <Pill>{r.type}</Pill>
              <p className="flex-1 truncate text-right font-mono-label text-[11px] text-text-secondary">
                {r.records.slice(0, 2).join(", ")}
                {r.records.length > 2 ? ` +${r.records.length - 2}` : ""}
              </p>
            </div>
          ))}
      </div>
      {dns.whois ? (
        <dl className="flex flex-col gap-2 border-t border-border pt-3 font-mono-label text-[12px]">
          <Row label="Registrar" value={dns.whois.registrar ?? "—"} />
          <Row
            label="Expires"
            value={
              dns.whois.expiryDate
                ? `${new Date(dns.whois.expiryDate).toLocaleDateString()}`
                : "—"
            }
          />
        </dl>
      ) : (
        <p className="border-t border-border pt-3 font-mono-label text-[11px] text-text-tertiary">
          WHOIS data unavailable for this domain.
        </p>
      )}
    </Card>
  );
}

export function MobileCard({ report }: { report: ScanReport }) {
  const { mobile } = report;
  const grade = report.categories.find((c) => c.key === "mobile")?.grade ?? null;

  return (
    <Card title="Mobile-Friendliness" grade={grade}>
      {mobile.score !== null ? (
        <p className="font-display text-3xl">{mobile.score}</p>
      ) : (
        <ErrorNote message={mobile.error} />
      )}
      <p className="mt-2 text-[12px] text-text-secondary">
        Derived from the PageSpeed Insights mobile run.
      </p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="truncate text-text-primary">{value}</dd>
    </div>
  );
}
