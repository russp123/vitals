import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl text-text-primary">
          That report doesn&rsquo;t exist
        </h1>
        <p className="mt-4 max-w-sm text-[15px] text-text-secondary">
          The scan you&rsquo;re looking for may have expired or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono-label text-[13px] uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
        >
          Run a new scan →
        </Link>
      </main>
    </div>
  );
}
