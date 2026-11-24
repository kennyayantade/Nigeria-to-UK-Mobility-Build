import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Outcome } from "@/domain/types";

export interface EvidenceRow {
  label: string;
  value: string;
  outcome: Outcome;
}

const marks: Record<Outcome, { icon: IconName; className: string; text: string }> = {
  MET: { icon: "check", className: "bg-status-met-bg text-status-met", text: "Met" },
  NOT_MET: { icon: "close", className: "bg-status-notmet-bg text-status-notmet", text: "Not met" },
  UNKNOWN: { icon: "question", className: "bg-status-unknown-bg text-status-unknown", text: "Not confirmed yet" },
};


export function EvidencePreview({
  caption,
  institution,
  programme,
  rows,
  startDelayMs = 1000,
  className = "",
}: {
  caption: string;
  institution: string;
  programme: string;
  rows: EvidenceRow[];
  startDelayMs?: number;
  className?: string;
}) {
  return (
    <figure className={`rounded-[1.75rem] bg-paper p-5 shadow-float ring-1 ring-black/5 ${className}`}>
      <figcaption className="flex items-center justify-between text-xs font-medium text-muted">
        {caption}
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px]">Fictional</span>
      </figcaption>
      <p className="mt-3 text-[13px] text-muted">{institution}</p>
      <p className="text-base font-bold leading-snug tracking-tight">{programme}</p>
      <ul className="mt-4 grid gap-2.5 border-t border-line pt-4">
        {rows.map((row, i) => {
          const m = marks[row.outcome];
          return (
            <li key={row.label} className="flex items-center gap-3">
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full animate-pop delay-var ${m.className}`}
                style={{ "--delay": `${startDelayMs + i * 220}ms` } as CSSProperties}
              >
                <Icon name={m.icon} className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 text-[13px] leading-tight">
                <span className="font-semibold">{row.label}</span>
                <span className="block truncate text-muted">{row.value}</span>
              </span>
              <span className="sr-only">{m.text}</span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}