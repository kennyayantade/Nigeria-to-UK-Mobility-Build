"use client";


import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Heading, Lead } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/domain/money";
import { REGION_LABEL } from "@/domain/taxonomy";
import type { CandidateResult, CriterionKey } from "@/domain/types";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { SimplePage } from "@/features/diagnostic/Stepper";
import { AFFORDABILITY, formatIntake, reasonText } from "@/features/results/reasons";

const GROUP = {
  potential: { label: "Potential match", className: "bg-status-met-bg text-status-met" },
  review: { label: "Needs review", className: "bg-status-unknown-bg text-status-unknown" },
  excluded: { label: "Not in main list", className: "bg-status-notmet-bg text-status-notmet" },
} as const;

function criterion(c: CandidateResult, key: CriterionKey) {
  const cr = c.criteria.find((x) => x.key === key);
  if (!cr) return <span className="text-muted">Not available</span>;
  return (
    <>
      <StatusBadge outcome={cr.outcome} />
      <p className="mt-1.5 text-xs leading-snug text-muted">{reasonText(cr)}</p>
    </>
  );
}

const ROWS: { label: string; cell: (c: CandidateResult) => ReactNode }[] = [
  { label: "Your result", cell: (c) => <Pill className={GROUP[c.displayGroup].className}>{GROUP[c.displayGroup].label}</Pill> },
  {
    label: "Tuition fee",
    cell: (c) => (
      <>
        <span className="font-bold">{formatMoney(c.tuition.amount, c.tuition.currency)}</span>
        <span className="text-muted"> {c.tuition.basis === "annual" ? "a year" : "in total"}</span>
      </>
    ),
  },
  { label: "Budget", cell: (c) => <Pill className={AFFORDABILITY[c.affordability].className}>{AFFORDABILITY[c.affordability].label}</Pill> },
  { label: "Grade", cell: (c) => criterion(c, "grade") },
  { label: "Subject", cell: (c) => criterion(c, "prior_subject") },
  { label: "English", cell: (c) => criterion(c, "english") },
  { label: "Fit with your preferences", cell: (c) => <span className="font-semibold">{c.points.total} of 100</span> },
  { label: "Location", cell: (c) => `${c.city}, ${REGION_LABEL[c.region]}` },
  { label: "Starts", cell: (c) => formatIntake(c.intake) },
];

export default function ComparePage() {
  const { result, compare, toggleCompare } = useDiagnostic();

  if (!result) {
    return (
      <SimplePage title="Nothing to compare yet" intro="Run a comparison first, then pick two or three courses from your results.">
        <ButtonLink href="/start" size="lg">
          Start a comparison
        </ButtonLink>
      </SimplePage>
    );
  }

  const all = [...result.potential, ...result.review, ...result.excluded];
  const items = compare.map((id) => all.find((c) => c.intakeId === id)).filter((c): c is CandidateResult => Boolean(c));

  if (items.length < 2) {
    return (
      <SimplePage title="Pick courses to compare" intro="Tick “Compare” on two or three courses in your results to see them side by side.">
        <ButtonLink href="/results" size="lg">
          Back to results
        </ButtonLink>
      </SimplePage>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <Link href="/results" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
        <Icon name="arrowRight" className="size-4 rotate-180" />
        Back to results
      </Link>
      <Heading as="h1" size="title" className="mt-6">
        Compare courses
      </Heading>
      <Lead className="mt-3">The same checks for each course, side by side. Open a course for its sources and review dates.</Lead>

      <div className="mt-10 overflow-x-auto rounded-3xl border border-line">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">Comparison of {items.length} courses</caption>
          <thead>
            <tr className="align-top">
              <td className="sticky left-0 z-10 w-44 bg-paper p-5" />
              {items.map((c) => (
                <th key={c.intakeId} scope="col" className="border-l border-line p-5 font-normal">
                  <p className="text-xs text-muted">{c.institution}</p>
                  <Link href={`/programmes/${encodeURIComponent(c.intakeId)}`} className="mt-1 block text-base font-bold leading-snug hover:text-brand-blue">
                    {c.title}
                  </Link>
                  <button type="button" onClick={() => toggleCompare(c.intakeId)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
                    <Icon name="close" className="size-3.5" />
                    Remove<span className="sr-only"> {c.title} from comparison</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-line align-top">
                <th scope="row" className="sticky left-0 z-10 bg-surface p-5 text-sm font-semibold">
                  {row.label}
                </th>
                {items.map((c) => (
                  <td key={c.intakeId} className="border-l border-line p-5">
                    {row.cell(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}