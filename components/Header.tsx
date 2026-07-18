import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Logomark } from "./Logomark";

export function Header({ title }: { title?: string }) {
  return (
    <header className="w-full border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono-label text-[13px] tracking-tight text-text-primary"
        >
          <Logomark className="h-4 w-5 text-accent" />
          vitals
        </Link>

        {title ? (
          <p className="hidden font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-tertiary sm:block">
            {title}
          </p>
        ) : null}

        <nav className="flex items-center gap-4">
          <Link
            href="/recent"
            className="font-mono-label text-[11px] uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary"
          >
            Recent
          </Link>
          <ThemeToggle />
          <span className="hidden items-center gap-1.5 rounded-full border border-border px-[11px] py-1 font-mono-label text-[11px] uppercase tracking-wide text-text-secondary sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-badge-accent" />
            Free scan
          </span>
        </nav>
      </div>
    </header>
  );
}
