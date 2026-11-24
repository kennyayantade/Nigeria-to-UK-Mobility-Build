import type { PreferencePoints } from "@/domain/types";

const PARTS = [
  { key: "subject", label: "subject", max: 40 },
  { key: "budget", label: "budget", max: 30 },
  { key: "intake", label: "start date", max: 20 },
  { key: "location", label: "location", max: 10 },
] as const;



export function PreferenceFit({ points }: { points: PreferencePoints }) {
  const notAssessed = PARTS.filter((p) => points.unassessed.includes(p.key)).map((p) => p.label);

  return (
    <div className="min-w-0 flex-1 sm:max-w-xs">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold">Fit with your preferences</span>
        <span className="text-muted">{points.total} of 100</span>
      </div>
      <div className="mt-2 flex h-2 gap-1" aria-hidden="true">
        {PARTS.map((p) => (
          <span key={p.key} className="basis-0 overflow-hidden rounded-full bg-line" style={{ flexGrow: p.max }}>
            <span className="block h-full rounded-full bg-brand-gradient" style={{ width: `${(points[p.key] / p.max) * 100}%` }} />
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        {PARTS.map((p) => `${p.label} ${points[p.key]}/${p.max}`).join(", ")}
        {notAssessed.length > 0 && `. Not assessed: ${notAssessed.join(", ")}.`}
      </p>
    </div>
  );
}