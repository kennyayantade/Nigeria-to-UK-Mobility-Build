import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Pill } from "@/components/ui/Pill";
import { formatMoney } from "@/domain/money";
import { REGION_LABEL } from "@/domain/taxonomy";
import type { CandidateResult } from "@/domain/types";
import { CriteriaList } from "./CriteriaList";
import { PreferenceFit } from "./PreferenceFit";
import { ResultActions } from "./ResultActions";
import { AFFORDABILITY, EXCLUSION_TEXT, formatIntake } from "./reasons";

export function ResultCard({ result: c }: { result: CandidateResult }) {
  const afford = AFFORDABILITY[c.affordability];
  const href = `/programmes/${encodeURIComponent(c.intakeId)}`;

  return (
    <Card as="li" className="grid gap-5 transition-colors duration-200 hover:border-brand-blue/40 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted">{c.institution}</p>
          <Heading as="h3" size="subheading" className="mt-0.5">
            <Link href={href} className="transition-colors hover:text-brand-blue">
              {c.title}
            </Link>
          </Heading>
          <p className="mt-1 text-sm text-muted">
            {c.city}, {REGION_LABEL[c.region]}. Starts {formatIntake(c.intake)}.
          </p>
        </div>
        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
          <p className="text-lg font-bold">
            {formatMoney(c.tuition.amount, c.tuition.currency)}
            <span className="text-sm font-normal text-muted"> {c.tuition.basis === "annual" ? "a year" : "in total"}</span>
          </p>
          <Pill className={afford.className}>{afford.label}</Pill>
        </div>
      </div>

      <CriteriaList criteria={c.criteria} />

      {c.exclusionReason && <p className="text-sm font-medium text-status-notmet">{EXCLUSION_TEXT[c.exclusionReason]}</p>}

      <div className="flex flex-col gap-5 border-t border-line pt-5 lg:flex-row lg:items-end lg:justify-between">
        <PreferenceFit points={c.points} />
        <div className="flex flex-wrap items-center gap-2">
          <ResultActions intakeId={c.intakeId} title={c.title} />
          <ButtonLink href={href} variant="secondary">
            View evidence<span className="sr-only"> for {c.title}</span>
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}