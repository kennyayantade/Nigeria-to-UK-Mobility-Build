"use client";

/** A03 — Qualifications. Captures the original grade and scale; pending or unknown results are allowed. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Choice, ErrorSummary, Fieldset, SelectField, TextField } from "@/components/ui/Field";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { StepPage } from "@/features/diagnostic/Stepper";
import { useRequireAdult } from "@/features/diagnostic/useRequireAdult";
import { validateQualifications, type FieldErrors } from "@/features/diagnostic/draft";
import { DEGREE_CLASS_OPTIONS, QUALIFICATION_LABEL, SCALE_LABEL, SCALE_RANGE, SUBJECTS } from "@/domain/taxonomy";
import type { EnglishStatus, GradeScale, QualificationType, ResultStatus } from "@/domain/types";

const LABELS: Record<string, string> = {
  "highestQualification.value": "Grade",
  "highestQualification.subjectCode": "Subject",
};

export default function QualificationsPage() {
  const ready = useRequireAdult();
  const router = useRouter();
  const { draft, update } = useDiagnostic();
  const [errors, setErrors] = useState<FieldErrors>({});
  const q = draft.qualification;
  const range = SCALE_RANGE[q.scale];

  if (!ready) return null;

  const setQ = (patch: Partial<typeof q>) => update((d) => ({ ...d, qualification: { ...d.qualification, ...patch } }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateQualifications(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) router.push("/profile/preferences");
  }

  return (
    <StepPage step={1} title="Your qualifications" intro="Use your highest completed or expected qualification, exactly as it appears on your result. We never convert your grade to another scale.">
      <form onSubmit={onSubmit} noValidate className="grid gap-6">
        <ErrorSummary errors={errors} labels={LABELS} />

        <SelectField id="qual-type" label="Highest qualification" value={q.type} onChange={(e) => setQ({ type: e.target.value as QualificationType })}>
          {Object.entries(QUALIFICATION_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="qual-subject"
          label="Subject studied"
          hint="Choose the closest match. If yours isn't listed, choose “Not listed” and an adviser can review it."
          value={q.subjectCode}
          onChange={(e) => setQ({ subjectCode: e.target.value })}
          error={errors["highestQualification.subjectCode"]}
        >
          <option value="">Not listed / prefer not to say</option>
          {SUBJECTS.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </SelectField>

        <Fieldset id="result-status" legend="Is your final result available?">
          {(
            [
              ["final", "Yes, I have my final result"],
              ["pending", "No, I'm still waiting for it"],
              ["unknown", "I'm not sure"],
            ] as [ResultStatus, string][]
          ).map(([value, label]) => (
            <Choice
              key={value}
              type="radio"
              name="result-status"
              value={value}
              label={label}
              checked={q.resultStatus === value}
              onChange={() => setQ({ resultStatus: value, value: value === "final" ? q.value : "" })}
            />
          ))}
        </Fieldset>

        {q.resultStatus === "final" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField id="qual-scale" label="Grading scale" value={q.scale} onChange={(e) => setQ({ scale: e.target.value as GradeScale, value: "" })}>
              {Object.entries(SCALE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>

            {q.scale === "degree_class" ? (
              <SelectField id="qual-value" label="Degree class" value={q.value} onChange={(e) => setQ({ value: e.target.value })} error={errors["highestQualification.value"]}>
                <option value="">Select class</option>
                {DEGREE_CLASS_OPTIONS.map((o) => (
                  <option key={o.value} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
            ) : (
              <TextField
                id="qual-value"
                label="Your grade"
                hint={`Between ${range.min} and ${range.max}`}
                inputMode="decimal"
                autoComplete="off"
                value={q.value}
                onChange={(e) => setQ({ value: e.target.value })}
                error={errors["highestQualification.value"]}
              />
            )}
          </div>
        )}

        <Fieldset id="english" legend="English language evidence" hint="For example an IELTS/UKVI score, or a university-accepted WAEC English result.">
          {(
            [
              ["met", "I have evidence I expect to meet typical requirements"],
              ["not_met", "I don't have evidence yet"],
              ["unknown", "I'm not sure"],
            ] as [EnglishStatus, string][]
          ).map(([value, label]) => (
            <Choice key={value} type="radio" name="english" value={value} label={label} checked={draft.english === value} onChange={() => update((d) => ({ ...d, english: value }))} />
          ))}
        </Fieldset>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg">
            Continue
          </Button>
          <ButtonLink href="/start" variant="secondary" size="lg">
            Back
          </ButtonLink>
        </div>
      </form>
    </StepPage>
  );
}
