"use client";

/** A05 — Review answers. Confirming runs a comparison, not a verified eligibility assessment. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { StepPage } from "@/features/diagnostic/Stepper";
import { useRequireAdult } from "@/features/diagnostic/useRequireAdult";
import { buildRequest } from "@/features/diagnostic/draft";
import { api, ApiClientError } from "@/lib/api-client";
import { formatMoney, isDecimalAmount } from "@/domain/money";
import { DEGREE_CLASS_OPTIONS, LEVEL_LABEL, QUALIFICATION_LABEL, REGION_LABEL, SCALE_LABEL, SUBJECT_LABEL } from "@/domain/taxonomy";

function Row({ label, value, unknown }: { label: string; value: string; unknown?: boolean }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`text-sm font-medium ${unknown ? "text-status-unknown" : ""}`}>{value}</dd>
    </div>
  );
}

function Section({ title, editHref, children }: { title: string; editHref: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={editHref} className="text-sm font-semibold text-brand-blue underline-offset-4 hover:underline">
          Edit<span className="sr-only"> {title.toLowerCase()}</span>
        </Link>
      </div>
      <dl className="mt-2 divide-y divide-line">{children}</dl>
    </section>
  );
}

export default function ReviewPage() {
  const ready = useRequireAdult();
  const router = useRouter();
  const { draft, setResult } = useDiagnostic();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!ready) return null;

  const q = draft.qualification;
  const p = draft.preferences;

  const grade =
    q.resultStatus === "pending"
      ? "Pending"
      : q.resultStatus === "unknown"
        ? "Not sure"
        : q.scale === "degree_class"
          ? (DEGREE_CLASS_OPTIONS.find((o) => String(o.value) === q.value)?.label ?? "—")
          : `${q.value} (${SCALE_LABEL[q.scale]})`;

  const budgetAmount = p.budgetAmount.replace(/[,\s£₦]/g, "");
  const budget =
    budgetAmount === "" || !isDecimalAmount(budgetAmount)
      ? "Not given"
      : `${formatMoney(budgetAmount, p.currency)} per ${p.basis === "annual" ? "year" : "whole course"}${p.strict ? " · strict limit" : ""}`;

  const regions = p.regionMode === "any" ? "Anywhere in the UK" : p.regionMode === "specific" ? p.regions.map((r) => REGION_LABEL[r]).join(", ") : "Not answered";

  async function onRun() {
    const built = buildRequest(draft);
    if (!built.ok) {
      setErrors(built.errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await api.runDiagnostic(built.request);
      setResult(result);
      router.push("/results");
    } catch (err) {
      setErrors({ _: err instanceof ApiClientError ? err.message : "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StepPage step={3} title="Check your answers" intro="Unknown answers are fine. They stay visible in your results instead of being guessed.">
      <div className="grid gap-5">
        <ErrorSummary errors={errors} />

        <Section title="Education" editHref="/profile/qualifications">
          <Row label="Highest qualification" value={QUALIFICATION_LABEL[q.type]} />
          <Row label="Subject" value={q.subjectCode ? (SUBJECT_LABEL[q.subjectCode] ?? q.subjectCode) : "Not listed"} unknown={!q.subjectCode} />
          <Row label="Grade" value={grade} unknown={q.resultStatus !== "final"} />
          <Row
            label="English evidence"
            value={draft.english === "met" ? "Expect to meet requirements" : draft.english === "not_met" ? "No evidence yet" : "Not sure"}
            unknown={draft.english === "unknown"}
          />
        </Section>

        <Section title="Study and funding" editHref="/profile/preferences">
          <Row label="Level" value={LEVEL_LABEL[p.studyLevel]} />
          <Row label="Subjects" value={p.subjectCodes.length ? p.subjectCodes.map((c) => SUBJECT_LABEL[c] ?? c).join(", ") : "Open to anything"} />
          <Row label="Start date" value={p.intake || "No preference"} />
          <Row label="Location" value={regions} unknown={p.regionMode === "unanswered"} />
          <Row label="Tuition budget" value={budget} unknown={budget === "Not given"} />
        </Section>

        <Notice>
          This is a comparison against reviewed course information, not an admission or visa decision. Universities make their own decisions.
        </Notice>

        <div className="flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={onRun} disabled={submitting} aria-busy={submitting}>
            {submitting ? "Comparing…" : "Compare courses"}
          </Button>
          <ButtonLink href="/profile/preferences" variant="secondary" size="lg">
            Back
          </ButtonLink>
        </div>
      </div>
    </StepPage>
  );
}
