"use client";

import { Icon } from "@/components/ui/Icon";
import { MAX_COMPARE, useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";

const chip =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors duration-200";

export function ResultActions({ intakeId, title }: { intakeId: string; title: string }) {
  const { shortlist, compare, toggleShortlist, toggleCompare } = useDiagnostic();
  const saved = shortlist.includes(intakeId);
  const comparing = compare.includes(intakeId);
  const compareFull = !comparing && compare.length >= MAX_COMPARE;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => toggleShortlist(intakeId)}
        className={`${chip} ${saved ? "border-brand-purple bg-brand-purple-50 text-brand-purple-700" : "border-line text-ink hover:border-ink/40"}`}
      >
        <Icon name="bookmark" filled={saved} className="size-4" />
        {saved ? "Saved" : "Save"}
        <span className="sr-only"> {title} to your shortlist</span>
      </button>
      <label
        title={compareFull ? `You can compare up to ${MAX_COMPARE} courses` : undefined}
        className={`${chip} ${comparing ? "border-brand-blue bg-brand-blue-50 text-brand-blue" : "border-line text-ink hover:border-ink/40"} ${
          compareFull ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <input type="checkbox" checked={comparing} disabled={compareFull} onChange={() => toggleCompare(intakeId)} className="size-4 accent-brand-blue" />
        Compare
        <span className="sr-only"> {title}</span>
      </label>
    </div>
  );
}