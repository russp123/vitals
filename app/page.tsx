import { Header } from "@/components/Header";
import { ScanForm } from "@/components/ScanForm";
import { SectionLabel } from "@/components/Pill";

const CHECKS = [
  { label: "Performance", detail: "Google PageSpeed Insights" },
  { label: "Security Headers", detail: "CSP, HSTS, X-Frame-Options…" },
  { label: "SSL / TLS", detail: "Certificate validity & expiry" },
  { label: "DNS / WHOIS", detail: "Records & registrar" },
  { label: "Mobile-Friendliness", detail: "Derived from PageSpeed" },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-24 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent opacity-[0.12] blur-[110px]"
        />
        <SectionLabel index={1}>Scan</SectionLabel>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.1] text-text-primary sm:text-6xl">
          Know your site&rsquo;s <em className="italic text-accent">real</em> health
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-secondary">
          Paste a URL and get a real report in seconds — performance, security headers, SSL,
          DNS, and mobile-friendliness. Free, no account required.
        </p>

        <div className="mt-10 w-full max-w-xl">
          <ScanForm />
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
          {CHECKS.map((c) => (
            <span
              key={c.label}
              title={c.detail}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-[11px] py-1 font-mono-label text-[11px] uppercase tracking-wide text-text-secondary transition-colors hover:border-badge-border hover:text-badge-accent"
            >
              {c.label}
            </span>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <p className="text-center font-mono-label text-[11px] text-text-tertiary">
          Vitals — built with Next.js, deployed on Vercel.
        </p>
      </footer>
    </div>
  );
}
