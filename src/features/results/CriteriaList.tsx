import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CriterionResult } from "@/domain/types";
import { CRITERION_LABEL, reasonText } from "./reasons";


export function CriteriaList({ criteria }: { criteria: CriterionResult[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-3">
      {criteria.map((c) => (
        <li key={c.key} className="rounded-2xl bg-surface p-3.5">
          <StatusBadge outcome={c.outcome} label={CRITERION_LABEL[c.key]} />
          <p className="mt-2 text-[13px] leading-snug text-muted">{reasonText(c)}</p>
        </li>
      ))}
    </ul>
  );
}