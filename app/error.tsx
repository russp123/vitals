"use client";

import Link from "next/link";
import { Header } from "@/components/Header";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
          Error
        </p>
        <h1 className="mt-4 font-display text-4xl text-text-primary">Something went wrong</h1>
        <p className="mt-4 max-w-sm text-[15px] text-text-secondary">
          That request hit an unexpected error. Try again in a moment.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono-label text-[13px] uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-mono-label text-[13px] uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary"
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
