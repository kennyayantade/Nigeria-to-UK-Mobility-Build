/**
 * Deterministic matching engine (W09).
 *
 * Rules from Data Catalogue & AI Specification v01, sections 16–19:
 * - Three-valued evaluation: MET / NOT_MET / UNKNOWN. Unknown, conflicting or
 *   expired decisive facts → UNKNOWN. UNKNOWN never becomes a pass.
 * - No arithmetic grade conversion: the programme must publish a reviewed
 *   threshold on the applicant's own scale, otherwise UNKNOWN.
 * - Closed/expired/withdrawn intakes and other levels are filtered out before
 *   matching; they are NOT reported as academic failures.
 * - Academic outcome and affordability are separate. Strict budget: verified
 *   excess → excluded; unassessed → review.
 * - Preference weights 40/30/20/10 (subject/budget/intake/location), never
 *   redistributed or rescaled. Missing inputs are recorded as unassessed.
 * - Ranking: potential group first, then review group, each by points desc,
 *   then programmeId, then intakeId (stable tie-break).
 * - No commercial input of any kind is accepted by this module.
 *
 * Pure function: no I/O, no clock reads (pass `now`), no randomness.
 */

import { toMinorUnits } from "@/domain/money";
import type {
  ApplicantProfile,
  Affordability,
  CandidateResult,
  CatalogueSnapshot,
  CriterionResult,
  DisplayGroup,
  FilteredIntake,
  MatchResult,
  Outcome,
  Preferences,
  PreferencePoints,
  ProgrammeIntake,
  ValueStatus,
} from "@/domain/types";

export const RULES_VERSION = "rules-proposed-1";
export const WEIGHTS_VERSION = "40-30-20-10-v1";

export const WEIGHTS = { subject: 40, subjectRelated: 20, budget: 30, intake: 20, location: 10 } as const;

export interface EvaluateInput {
  profile: ApplicantProfile;
  preferences: Preferences;
  snapshot: CatalogueSnapshot;
  /** Evaluation instant (ISO 8601). Injected so runs are reproducible. */
  now: string;
}

// ---------------------------------------------------------------------------
// Criteria
// ---------------------------------------------------------------------------

function isExpired(intake: ProgrammeIntake, now: string): boolean {
  return Date.parse(now) >= Date.parse(intake.reviewDueAt);
}

/** Effective status of a fact once record-level freshness is applied. */
function effectiveStatus(status: ValueStatus, expired: boolean): ValueStatus {
  return expired && status === "known" ? "expired" : status;
}

function unknownFor(status: ValueStatus): string {
  return status === "known" ? "unknown" : `requirement_${status}`;
}

function evaluateGrade(profile: ApplicantProfile, intake: ProgrammeIntake, expired: boolean): CriterionResult {
  const q = profile.highestQualification;
  const req = intake.requirements.grades.find((g) => g.scale === q.scale);

  if (!req) {
    return { key: "grade", outcome: "UNKNOWN", reasonCode: "no_reviewed_threshold_for_scale", evidenceId: null };
  }
  const status = effectiveStatus(req.status, expired);
  if (status === "not_applicable") {
    return { key: "grade", outcome: "NOT_APPLICABLE", reasonCode: "not_applicable", evidenceId: req.evidenceId };
  }
  if (status !== "known") {
    return { key: "grade", outcome: "UNKNOWN", reasonCode: unknownFor(status), evidenceId: req.evidenceId };
  }
  if (q.resultStatus !== "final" || q.value === null) {
    return {
      key: "grade",
      outcome: "UNKNOWN",
      reasonCode: q.resultStatus === "pending" ? "applicant_result_pending" : "applicant_grade_unknown",
      evidenceId: req.evidenceId,
    };
  }
  return {
    key: "grade",
    outcome: q.value >= req.minimum ? "MET" : "NOT_MET",
    reasonCode: q.value >= req.minimum ? "meets_minimum" : "below_minimum",
    evidenceId: req.evidenceId,
  };
}

function evaluatePriorSubject(profile: ApplicantProfile, intake: ProgrammeIntake, expired: boolean): CriterionResult {
  const req = intake.requirements.priorSubject;
  if (req === null) {
    return { key: "prior_subject", outcome: "NOT_APPLICABLE", reasonCode: "no_subject_requirement", evidenceId: null };
  }
  const status = effectiveStatus(req.status, expired);
  if (status === "not_applicable") {
    return { key: "prior_subject", outcome: "NOT_APPLICABLE", reasonCode: "not_applicable", evidenceId: req.evidenceId };
  }
  if (status !== "known") {
    return { key: "prior_subject", outcome: "UNKNOWN", reasonCode: unknownFor(status), evidenceId: req.evidenceId };
  }
  const subject = profile.highestQualification.subjectCode;
  if (subject === null) {
    return { key: "prior_subject", outcome: "UNKNOWN", reasonCode: "applicant_subject_unknown", evidenceId: req.evidenceId };
  }
  const met = req.codes.includes(subject);
  return {
    key: "prior_subject",
    outcome: met ? "MET" : "NOT_MET",
    reasonCode: met ? "subject_accepted" : "subject_not_accepted",
    evidenceId: req.evidenceId,
  };
}

function evaluateEnglish(profile: ApplicantProfile, intake: ProgrammeIntake, expired: boolean): CriterionResult {
  const req = intake.requirements.english;
  const status = effectiveStatus(req.status, expired);
  if (status !== "known") {
    return { key: "english", outcome: "UNKNOWN", reasonCode: unknownFor(status), evidenceId: req.evidenceId };
  }
  if (!req.required) {
    return { key: "english", outcome: "NOT_APPLICABLE", reasonCode: "not_required", evidenceId: req.evidenceId };
  }
  const map: Record<ApplicantProfile["english"]["status"], Outcome> = {
    met: "MET",
    not_met: "NOT_MET",
    unknown: "UNKNOWN",
  };
  const outcome = map[profile.english.status];
  return { key: "english", outcome, reasonCode: `applicant_english_${profile.english.status}`, evidenceId: req.evidenceId };
}

export function combineAcademic(criteria: CriterionResult[]): Outcome {
  if (criteria.some((c) => c.outcome === "NOT_MET")) return "NOT_MET";
  if (criteria.some((c) => c.outcome === "UNKNOWN")) return "UNKNOWN";
  return "MET";
}

// ---------------------------------------------------------------------------
// Affordability and preference points
// ---------------------------------------------------------------------------

export function assessAffordability(preferences: Preferences, intake: ProgrammeIntake, expired: boolean): Affordability {
  const budget = preferences.tuitionBudget;
  const fee = intake.tuition;
  if (effectiveStatus(fee.status, expired) !== "known") return "unassessed";
  if (budget.amount === null) return "unassessed";
  // No currency conversion or annual↔whole-course arithmetic without an approved basis.
  if (budget.currency !== fee.currency || budget.basis !== fee.basis) return "unassessed";
  return toMinorUnits(fee.amount) <= toMinorUnits(budget.amount) ? "fit" : "over_budget";
}

export function scorePreferences(preferences: Preferences, intake: ProgrammeIntake, affordability: Affordability): PreferencePoints {
  const unassessed: PreferencePoints["unassessed"] = [];

  let subject = 0;
  if (preferences.subjectCodes.length === 0) {
    unassessed.push("subject");
  } else if (preferences.subjectCodes.some((c) => intake.subjectCodes.includes(c))) {
    subject = WEIGHTS.subject;
  } else if (preferences.subjectCodes.some((c) => intake.relatedSubjectCodes.includes(c))) {
    subject = WEIGHTS.subjectRelated;
  }

  let budget = 0;
  if (affordability === "unassessed") unassessed.push("budget");
  else if (affordability === "fit") budget = WEIGHTS.budget;

  let intakePts = 0;
  if (preferences.intake === null) unassessed.push("intake");
  else if (preferences.intake === intake.intake) intakePts = WEIGHTS.intake;

  let location = 0;
  if (preferences.regions === null) unassessed.push("location");
  else if (preferences.regions === "any" || preferences.regions.includes(intake.region)) location = WEIGHTS.location;

  return { subject, budget, intake: intakePts, location, total: subject + budget + intakePts + location, unassessed };
}

function groupFor(academic: Outcome, affordability: Affordability, strict: boolean): { group: DisplayGroup; reason: string | null } {
  if (academic === "NOT_MET") return { group: "excluded", reason: "academic_not_met" };
  if (strict && affordability === "over_budget") return { group: "excluded", reason: "tuition_above_strict_cap" };
  if (academic === "UNKNOWN") return { group: "review", reason: null };
  // Academic MET: only an assessed tuition fit counts as a potential match.
  // Decision to confirm with Product: non-strict over-budget goes to review rather than potential.
  if (affordability === "fit") return { group: "potential", reason: null };
  return { group: "review", reason: null };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function filterReason(intake: ProgrammeIntake, preferences: Preferences): FilteredIntake["reasonCode"] | null {
  if (intake.publicationStatus !== "published") return "not_published";
  if (intake.intakeStatus !== "open") return "intake_not_open";
  if (intake.studyLevel !== preferences.studyLevel) return "study_level_mismatch";
  return null;
}

function compareCandidates(a: CandidateResult, b: CandidateResult): number {
  if (b.points.total !== a.points.total) return b.points.total - a.points.total;
  if (a.programmeId !== b.programmeId) return a.programmeId < b.programmeId ? -1 : 1;
  if (a.intakeId !== b.intakeId) return a.intakeId < b.intakeId ? -1 : 1;
  return 0;
}

export function evaluate({ profile, preferences, snapshot, now }: EvaluateInput): MatchResult {
  const filtered: FilteredIntake[] = [];
  const candidates: CandidateResult[] = [];

  for (const intake of snapshot.intakes) {
    const reason = filterReason(intake, preferences);
    if (reason) {
      filtered.push({ programmeId: intake.programmeId, intakeId: intake.intakeId, reasonCode: reason });
      continue;
    }

    const expired = isExpired(intake, now);
    const criteria = [
      evaluateGrade(profile, intake, expired),
      evaluatePriorSubject(profile, intake, expired),
      evaluateEnglish(profile, intake, expired),
    ];
    const academic = combineAcademic(criteria);
    const affordability = assessAffordability(preferences, intake, expired);
    const points = scorePreferences(preferences, intake, affordability);
    const { group, reason: exclusionReason } = groupFor(academic, affordability, preferences.tuitionBudget.strict);

    candidates.push({
      programmeId: intake.programmeId,
      intakeId: intake.intakeId,
      institution: intake.institution,
      title: intake.title,
      city: intake.city,
      region: intake.region,
      intake: intake.intake,
      tuition: { amount: intake.tuition.amount, currency: intake.tuition.currency, basis: intake.tuition.basis },
      academic,
      criteria,
      affordability,
      displayGroup: group,
      exclusionReason,
      points,
      officialUrl: intake.officialUrl,
    });
  }

  const byGroup = (g: DisplayGroup) => candidates.filter((c) => c.displayGroup === g).sort(compareCandidates);

  return {
    rulesVersion: RULES_VERSION,
    weightsVersion: WEIGHTS_VERSION,
    snapshotId: snapshot.snapshotId,
    evaluatedAt: now,
    potential: byGroup("potential"),
    review: byGroup("review"),
    excluded: byGroup("excluded"),
    filtered,
  };
}
