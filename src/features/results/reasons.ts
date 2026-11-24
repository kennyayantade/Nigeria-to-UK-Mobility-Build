import type { Affordability, CriterionResult, ValueStatus } from "@/domain/types";

export const CRITERION_LABEL: Record<CriterionResult["key"], string> = {
  grade: "Grade",
  prior_subject: "Subject",
  english: "English",
};

const REASON_TEXT: Record<string, string> = {

    meets_minimum: "Your grade meets the published minimum.",
  below_minimum: "Your grade is below the published minimum.",
  no_reviewed_threshold_for_scale: "No reviewed minimum for your grading scale yet. We never convert grades between scales.",
  applicant_result_pending: "Your result is still pending.",
  applicant_grade_unknown: "You weren't sure of your grade.",

  subject_accepted: "Your subject is accepted for this course.",
  subject_not_accepted: "Your subject isn't on the course's accepted list.",
  applicant_subject_unknown: "Your subject wasn't listed, so an adviser needs to check it.",
  no_subject_requirement: "This course doesn't ask for a particular subject.",

  applicant_english_met: "You expect your English evidence to meet the requirement.",
  applicant_english_not_met: "You don't have English evidence yet.",
  applicant_english_unknown: "You weren't sure about your English evidence.",
  not_required: "This course doesn't ask for separate English evidence.",

  requirement_unknown: "The course hasn't confirmed this requirement yet.",
  requirement_expired: "This requirement is past its review date, so we can't rely on it.",
  requirement_conflicting: "Sources disagree on this requirement.",
  not_applicable: "Doesn't apply to this course.",
};

export function reasonText(c: CriterionResult): string {
  return REASON_TEXT[c.reasonCode] ?? "An adviser can explain this result.";
}

export const EXCLUSION_TEXT: Record<string, string> = {
  academic_not_met: "Not in your main list because at least one academic requirement isn't met.",
  tuition_above_strict_cap: "Not in your main list because the fee is above your strict budget.",
};

export const AFFORDABILITY: Record<Affordability, { label: string; className: string }> = {
  fit: { label: "Within your budget", className: "bg-status-met-bg text-status-met" },
  over_budget: { label: "Above your budget", className: "bg-status-notmet-bg text-status-notmet" },
  unassessed: { label: "Budget not assessed", className: "bg-status-unknown-bg text-status-unknown" },
};

export const FACT_STATUS: Record<ValueStatus, { label: string; className: string }> = {
  known: { label: "Confirmed", className: "bg-status-met-bg text-status-met" },
  unknown: { label: "Not confirmed", className: "bg-status-unknown-bg text-status-unknown" },
  conflicting: { label: "Sources disagree", className: "bg-status-unknown-bg text-status-unknown" },
  expired: { label: "Past review date", className: "bg-status-unknown-bg text-status-unknown" },
  not_applicable: { label: "Not applicable", className: "bg-surface text-muted" },
};

export function formatIntake(intake: string): string {
  return new Date(`${intake}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}