import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { Pill } from "@/components/ui/Pill";
import { formatMoney } from "@/domain/money";
import { DEGREE_CLASS_OPTIONS, LEVEL_LABEL, REGION_LABEL, SCALE_LABEL, SUBJECT_LABEL } from "@/domain/taxonomy";
import type { EvidenceRef, GradeRequirement, ProgrammeIntake, SourceType, ValueStatus } from "@/domain/types";
import { YourResult } from "@/features/results/YourResult";
import { FACT_STATUS, formatDate, formatIntake } from "@/features/results/reasons";
import { getCatalogueRepository } from "@/server/catalogue/repository";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ intakeId: string }> };

export async function generateMetadata({ params }: Props) {
  const { intakeId } = await params;
  const intake = await getCatalogueRepository().getIntake(decodeURIComponent(intakeId));
  return { title: intake ? `${intake.title}, ${intake.institution}` : "Course not found" };
}

const SOURCE_TYPE: Record<SourceType, string> = {
  official: "Official university source",
  licensed_feed: "Licensed data feed",
  reviewed_reference: "Reviewed reference",
};

function gradeText(req: GradeRequirement): string {
  if (req.scale === "degree_class") {
    const label = DEGREE_CLASS_OPTIONS.find((o) => o.value === req.minimum)?.label ?? String(req.minimum);
    return `${label} or above`;
  }
  return `${req.minimum} or above (${SCALE_LABEL[req.scale]})`;
}


function FactRow({ label, value, status, source }: { label: string; value: ReactNode; status: ValueStatus; source?: EvidenceRef }) {
  const s = FACT_STATUS[status];
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr_auto] sm:items-start sm:gap-6">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="text-sm">
        {value}
        {source && (
          <span className="mt-1 block text-xs text-muted">
            Source: {source.sourceOwner}, retrieved {formatDate(source.retrievedAt)}
          </span>
        )}
      </dd>
      <dd>
        <Pill className={s.className}>{s.label}</Pill>
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${title}-h`.replace(/\s+/g, "-").toLowerCase()}>
      <Heading as="h2" size="subheading" id={`${title}-h`.replace(/\s+/g, "-").toLowerCase()}>
        {title}
      </Heading>
      <Card className="mt-4 py-1 sm:py-2">{children}</Card>
    </section>
  );
}

export default async function ProgrammePage({ params }: Props) {
  const { intakeId } = await params;
  const intake: ProgrammeIntake | null = await getCatalogueRepository().getIntake(decodeURIComponent(intakeId));
  if (!intake) notFound();

  const expired = Date.now() >= Date.parse(intake.reviewDueAt);
  const eff = (s: ValueStatus): ValueStatus => (expired && s === "known" ? "expired" : s);
  const source = (id: string) => intake.evidence.find((e) => e.id === id);
  const req = intake.requirements;

  return (
    <Container size="medium" className="py-10 sm:py-14">
      <Link href="/results" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
        <Icon name="arrowRight" className="size-4 rotate-180" />
        Back to results
      </Link>

      <header className="mt-6">
        <p className="text-muted">{intake.institution}</p>
        <Heading as="h1" size="title" className="mt-1">
          {intake.title}
        </Heading>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{LEVEL_LABEL[intake.studyLevel].split(" (")[0]}</Pill>
          <Pill>
            {intake.city}, {REGION_LABEL[intake.region]}
          </Pill>
          <Pill>Starts {formatIntake(intake.intake)}</Pill>
          <Pill className={intake.intakeStatus === "open" ? "bg-status-met-bg text-status-met" : "bg-surface text-muted"}>
            {intake.intakeStatus === "open" ? "Accepting applications" : "Not currently open"}
          </Pill>
        </div>
      </header>

      {expired && (
        <div className="mt-8">
          <Notice tone="warning" title="This information is past its review date">
            Reviewed {formatDate(intake.reviewedAt)} and due again {formatDate(intake.reviewDueAt)}. Until it is re-checked, we treat its requirements and
            fee as unknown. Confirm with the university before relying on them.
          </Notice>
        </div>
      )}

      <div className="mt-10">
        <YourResult intakeId={intake.intakeId} />
      </div>

      <div className="mt-12 grid gap-12">
        <Section title="Entry requirements">
          <dl className="divide-y divide-line">
            {req.grades.map((g) => (
              <FactRow key={g.scale} label={`Grade: ${SCALE_LABEL[g.scale].split(" (")[0]}`} value={gradeText(g)} status={eff(g.status)} source={source(g.evidenceId)} />
            ))}
            {req.priorSubject ? (
              <FactRow
                label="Previous subject"
                value={req.priorSubject.codes.map((c) => SUBJECT_LABEL[c] ?? c).join(", ")}
                status={eff(req.priorSubject.status)}
                source={source(req.priorSubject.evidenceId)}
              />
            ) : (
              <FactRow label="Previous subject" value="No particular subject required" status="not_applicable" />
            )}
            <FactRow
              label="English language"
              value={req.english.required ? "Evidence required, in a form the university accepts" : "No separate evidence required"}
              status={eff(req.english.status)}
              source={source(req.english.evidenceId)}
            />
          </dl>
        </Section>

        <Section title="Costs">
          <dl className="divide-y divide-line">
            <FactRow
              label="Tuition fee"
              value={
                <>
                  <span className="text-base font-bold">{formatMoney(intake.tuition.amount, intake.tuition.currency)}</span>{" "}
                  {intake.tuition.basis === "annual" ? "a year" : "for the whole course"}
                  <span className="mt-1 block text-xs text-muted">International fee. Living costs, visa and travel are not included.</span>
                </>
              }
              status={eff(intake.tuition.status)}
              source={source(intake.tuition.evidenceId)}
            />
          </dl>
          <p className="border-t border-line py-4 text-xs text-muted">
            Fees are shown in the currency the university publishes. We don&apos;t convert to naira automatically, because exchange rates change.
          </p>
        </Section>

        <Section title="Where this comes from">
          <ul className="divide-y divide-line">
            {intake.evidence
              .filter((e, i, all) => all.findIndex((x) => x.sourceUrl === e.sourceUrl && x.sourceOwner === e.sourceOwner) === i)
              .map((e) => (
                <li key={e.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{e.sourceOwner}</p>
                    <p className="text-xs text-muted">
                      {SOURCE_TYPE[e.sourceType]}, retrieved {formatDate(e.retrievedAt)}
                    </p>
                  </div>
                  <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-blue hover:underline">
                    Open source<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
          </ul>
          <p className="border-t border-line py-4 text-xs text-muted">
            Reviewed by AEGC on {formatDate(intake.reviewedAt)}. Next review due {formatDate(intake.reviewDueAt)}.
          </p>
        </Section>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <ButtonLink href={intake.officialUrl} target="_blank" rel="noopener noreferrer" size="lg">
          Visit the official course page<span className="sr-only"> (opens in a new tab)</span>
        </ButtonLink>
        <ButtonLink href="/results" variant="secondary" size="lg">
          Back to results
        </ButtonLink>
      </div>
    </Container>
  );
}