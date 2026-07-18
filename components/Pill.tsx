import type { ReactNode } from "react";

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent";
}) {
  const toneClasses =
    tone === "accent"
      ? "border-badge-border bg-badge-bg text-badge-accent"
      : "border-border text-text-secondary";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-[11px] py-1 font-mono-label text-[11px] uppercase tracking-wide ${toneClasses}`}
    >
      {children}
    </span>
  );
}

const GRADE_VAR: Record<string, string> = {
  A: "var(--grade-a)",
  B: "var(--grade-b)",
  C: "var(--grade-c)",
  D: "var(--grade-d)",
  F: "var(--grade-f)",
};

export function GradeBadge({ grade, size = "md" }: { grade: string; size?: "sm" | "md" | "lg" }) {
  const color = GRADE_VAR[grade] ?? "var(--text-secondary)";
  const sizeClasses =
    size === "lg" ? "h-16 w-16 text-2xl" : size === "sm" ? "h-6 w-6 text-[11px]" : "h-9 w-9 text-sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-mono-label font-semibold ${sizeClasses}`}
      style={{ color, borderColor: color }}
    >
      {grade}
    </span>
  );
}

export function SectionLabel({ index, children }: { index: number; children: ReactNode }) {
  return (
    <p className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
      {children} <span className="text-badge-accent">[{index}]</span>
    </p>
  );
}
