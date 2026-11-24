"use client";

/** A04 — Study and funding preferences. Budget keeps its currency and annual/whole-course basis. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Choice, ErrorSummary, Fieldset, SelectField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { StepPage } from "@/features/diagnostic/Stepper";
import { useRequireAdult } from "@/features/diagnostic/useRequireAdult";
import { validatePreferences, type FieldErrors } from "@/features/diagnostic/draft";
import { LEVEL_LABEL, REGION_LABEL, SUBJECTS } from "@/domain/taxonomy";
import type { Currency, FeeBasis, StudyLevel, UkRegion } from "@/domain/types";

const INTAKES = [
  { value: "2027-01", label: "January 2027" },
  { value: "2027-09", label: "September 2027" },
  { value: "2028-01", label: "January 2028" },
];

const LABELS: Record<string, string> = {
  subjectCodes: "Subjects",
  regions: "Location",
  "tuitionBudget.amount": "Tuition budget",
};

export default function PreferencesPage() {
  const ready = useRequireAdult();
  const router = useRouter();
  const { draft, update } = useDiagnostic();
  const [errors, setErrors] = useState<FieldErrors>({});
  const p = draft.preferences;

  if (!ready) return null;

  const setP = (patch: Partial<typeof p>) => update((d) => ({ ...d, preferences: { ...d.preferences, ...patch } }));
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validatePreferences(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) router.push("/profile/review");
  }

  return (
    <StepPage step={2} title="Study and funding" intro="Preferences change how options are ordered. They never change whether you meet a course's academic requirements.">
      <form onSubmit={onSubmit} noValidate className="grid gap-6">
        <ErrorSummary errors={errors} labels={LABELS} />

        <SelectField id="level" label="Level of study" value={p.studyLevel} onChange={(e) => setP({ studyLevel: e.target.value as StudyLevel })}>
          {Object.entries(LEVEL_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>

        <Fieldset id="subjects" legend="Subjects you're interested in" hint="Choose up to 3. Leave empty if you're open to anything." error={errors["subjectCodes"]}>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUBJECTS.map((s) => (
              <Choice
                key={s.code}
                type="checkbox"
                name="subjects"
                value={s.code}
                label={s.label}
                checked={p.subjectCodes.includes(s.code)}
                disabled={!p.subjectCodes.includes(s.code) && p.subjectCodes.length >= 3}
                onChange={() => setP({ subjectCodes: toggle(p.subjectCodes, s.code) })}
              />
            ))}
          </div>
        </Fieldset>

        <SelectField id="intake" label="When would you like to start?" value={p.intake} onChange={(e) => setP({ intake: e.target.value })}>
          <option value="">No preference</option>
          {INTAKES.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </SelectField>

        <Fieldset id="regions" legend="Where in the UK?" error={errors["regions"]}>
          <Choice type="radio" name="region-mode" label="Anywhere in the UK" checked={p.regionMode === "any"} onChange={() => setP({ regionMode: "any", regions: [] })} />
          <Choice type="radio" name="region-mode" label="Specific nations" checked={p.regionMode === "specific"} onChange={() => setP({ regionMode: "specific" })} />
          {p.regionMode === "specific" && (
            <div className="grid gap-2 pl-6 sm:grid-cols-2">
              {(Object.keys(REGION_LABEL) as UkRegion[]).map((r) => (
                <Choice key={r} type="checkbox" name="regions" value={r} label={REGION_LABEL[r]} checked={p.regions.includes(r)} onChange={() => setP({ regions: toggle(p.regions, r) })} />
              ))}
            </div>
          )}
        </Fieldset>

        <section className="grid gap-4 rounded-3xl bg-surface p-5 sm:p-6" aria-labelledby="budget-title">
          <h2 id="budget-title" className="font-semibold">
            Tuition budget
          </h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
            <TextField
              id="budget"
              label="Amount for tuition fees"
              hint="Leave empty if you're not sure yet"
              inputMode="decimal"
              autoComplete="off"
              value={p.budgetAmount}
              onChange={(e) => setP({ budgetAmount: e.target.value })}
              error={errors["tuitionBudget.amount"]}
            />
            <SelectField id="currency" label="Currency" value={p.currency} onChange={(e) => setP({ currency: e.target.value as Currency })}>
              <option value="GBP">GBP (£)</option>
              <option value="NGN">NGN (₦)</option>
            </SelectField>
            <SelectField id="basis" label="Per" value={p.basis} onChange={(e) => setP({ basis: e.target.value as FeeBasis })}>
              <option value="annual">Year</option>
              <option value="whole_course">Whole course</option>
            </SelectField>
          </div>
          <Choice
            type="checkbox"
            name="strict"
            label="Treat this as a strict limit"
            hint="Courses with a verified fee above your budget won't appear in your main list."
            checked={p.strict}
            onChange={() => setP({ strict: !p.strict })}
          />
          {p.currency === "NGN" && (
            <Notice tone="warning">
              UK fees are published in GBP. We don&apos;t convert currencies automatically, so a naira budget will show affordability as “not assessed”.
            </Notice>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg">
            Continue
          </Button>
          <ButtonLink href="/profile/qualifications" variant="secondary" size="lg">
            Back
          </ButtonLink>
        </div>
      </form>
    </StepPage>
  );
}
