"use client";


import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Pill } from "@/components/ui/Pill";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { CriteriaList } from "./CriteriaList";
import { PreferenceFit } from "./PreferenceFit";
import { AFFORDABILITY, EXCLUSION_TEXT } from "./reasons";

const GROUP_LABEL = {
  potential: { label: "Potential match", className: "bg-status-met-bg text-status-met" },
  review: { label: "Needs review", className: "bg-status-unknown-bg text-status-unknown" },
  excluded: { label: "Not in your main list", className: "bg-status-notmet-bg text-status-notmet" },
} as const;

export function YourResult({ intakeId }: { intakeId: string }) {
  const { result } = useDiagnostic();
  const match = result ? [...result.potential, ...result.review, ...result.excluded].find((c) => c.intakeId === intakeId) : undefined;

  if (!match) {
    return (
      <Card variant="surface" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading as="h2" size="subheading">
            See how your results compare
          </Heading>
          <p className="mt-1 text-sm text-muted">Run a free comparison and this page will show which requirements you meet.</p>
        </div>
        <ButtonLink href="/start" className="shrink-0">
          Start free comparison
        </ButtonLink>
      </Card>
    );
  }

  const group = GROUP_LABEL[match.displayGroup];
  const afford = AFFORDABILITY[match.affordability];

  return (
    <Card className="grid gap-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading as="h2" size="subheading">
          Your result for this course
        </Heading>
        <div className="flex flex-wrap gap-2">
          <Pill className={group.className}>{group.label}</Pill>
          <Pill className={afford.className}>{afford.label}</Pill>
        </div>
      </div>
      <CriteriaList criteria={match.criteria} />
      {match.exclusionReason && <p className="text-sm font-medium text-status-notmet">{EXCLUSION_TEXT[match.exclusionReason]}</p>}
      <div className="border-t border-line pt-5">
        <PreferenceFit points={match.points} />
      </div>
    </Card>
  );
}