import type { Outcome } from "@/domain/types";

const styles: Record<Outcome | "NOT_APPLICABLE", { label: string; className: string; symbol: string }> = {
  MET: { label: "Met", className: "bg-status-met-bg text-status-met", symbol: "✓" },
  NOT_MET: { label: "Not met", className: "bg-status-notmet-bg text-status-notmet", symbol: "✕" },
  UNKNOWN: { label: "Unknown", className: "bg-status-unknown-bg text-status-unknown", symbol: "?" },
  NOT_APPLICABLE: { label: "Not required", className: "bg-surface text-muted", symbol: "–" },
};

/** Status uses text + symbol + colour, never colour alone (WCAG 1.4.1). */
export function StatusBadge({ outcome, label }: { outcome: Outcome | "NOT_APPLICABLE"; label?: string }) {
  const s = styles[outcome];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>
      <span aria-hidden="true">{s.symbol}</span>
      {label ? `${label}: ${s.label}` : s.label}
    </span>
  );
}
