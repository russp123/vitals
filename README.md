# Vitals

A free, instant site health and security scanner. Paste a URL, get a real report:
performance, security headers, SSL/TLS, DNS/WHOIS, and mobile-friendliness — graded
A–F, cached, and shareable.

Built as a full-stack portfolio piece: no CMS, no no-code platform — a Next.js app
with its own API layer and database.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Postgres via [Neon](https://neon.tech)** (free tier) — chosen over Supabase for
  its HTTP-based serverless driver (`@neondatabase/serverless`), which works
  without connection pooling headaches on Vercel's serverless functions.
- **Drizzle ORM** — chosen over Prisma for this project because Prisma 7 now
  requires a custom generator output and its own engine binaries, which adds
  friction on serverless deploys. Drizzle is a thin, typed SQL layer with no
  build step.
- Deployed on **Vercel**

## Checks performed

| Check | Source | Notes |
|---|---|---|
| Performance | Google PageSpeed Insights API v5 (free) | Mobile + desktop scores, Core Web Vitals (LCP, CLS, INP, TTFB) |
| Security headers | Direct `fetch` of response headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| SSL/TLS | Node's built-in `tls` module | Certificate validity, issuer, days until expiry — no external API |
| DNS/WHOIS | Node's `dns/promises` + [RDAP](https://rdap.org) | A/AAAA/MX/TXT/NS records; RDAP is IANA's free, keyless WHOIS successor. An optional WhoisXMLAPI fallback is used only if RDAP fails and a key is configured. |
| Mobile-friendliness | Derived from the PageSpeed **mobile** category score | No separate API needed |

Each category is weighted into one overall letter grade. The weighting is
documented in [`lib/checks/grade.ts`](lib/checks/grade.ts):

- Performance — 35%
- Security headers — 25%
- SSL/TLS — 20%
- Mobile-friendliness — 10%
- DNS — 10%

All checks run in parallel via `Promise.allSettled`, so one failed check (e.g. a
PageSpeed quota error) never blocks the rest of the report.

## Free-tier limits

- **PageSpeed Insights API**: 25,000 requests/day per Google Cloud project, free.
- **Neon Postgres**: free tier covers a small hobby project comfortably (0.5 GB
  storage, generous compute hours).
- **RDAP**: free and keyless, no rate limit published by IANA for reasonable use.
- **WhoisXMLAPI** (optional fallback): 500 lookups/month free.

Nothing in this app requires a paid key. If `PAGESPEED_API_KEY` is missing, the
performance and mobile-friendliness checks report as "skipped" instead of
crashing the whole scan.

## Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

1. **`DATABASE_URL`** — create a free project at [neon.tech](https://neon.tech),
   copy the pooled connection string.
2. **`PAGESPEED_API_KEY`** — get a free key at
   [developers.google.com/speed/docs/insights/v5/get-started](https://developers.google.com/speed/docs/insights/v5/get-started).
3. **`WHOIS_API_KEY`** — optional, leave blank to skip.

Push the schema to your database:

```bash
npm run db:push
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the three environment variables from `.env.example` in the Vercel project
   settings (Production + Preview).
4. Deploy. No other configuration is needed — it's a standard Next.js app.

Run `npm run db:push` once (locally, pointed at the production `DATABASE_URL`,
or via Neon's SQL editor) to create the `scans` table before the first deploy.

## Project structure

```
app/
  page.tsx                 Home — scan form
  report/[slug]/page.tsx   Shareable report page
  recent/page.tsx          Recently run public scans
  api/scan/route.ts        POST endpoint that runs all checks and persists a scan
lib/
  checks/                  One module per check, plus grading/weighting logic
  db/                      Drizzle schema + client
components/
  Header, ScanForm, ReportCards, RecentList, Pill/GradeBadge, ThemeToggle
```

## Design

Visual language (colors, type, spacing, pill badges, monospace section labels)
matches [russelpineda.com](https://russelpineda.com) — off-white background,
Instrument Serif display headlines with an italicized emphasis word, pill-shaped
badges and CTAs, thin 1px borders, no shadows or gradients. Light/dark mode is
built in and persisted to `localStorage`.

## Out of scope

No user accounts, no billing, no paid APIs, no CMS.
