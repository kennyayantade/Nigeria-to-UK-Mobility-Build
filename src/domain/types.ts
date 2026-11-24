/**
 * Core domain types for the Nigeria → UK Student Mobility platform.
 *
 * Source: Data Catalogue & AI Specification v01 (Document 06) and
 * Technical Architecture Specification v01 (Document 07).
 *
 * These are framework-free so the matching engine can be unit-tested and reused
 * by API routes, background workers and the backend team. Runtime validation of
 * the same shapes lives in `src/contracts` (Zod).
 */

/** Three-valued criterion outcome. UNKNOWN is never treated as a pass. */
export type Outcome = "MET" | "NOT_MET" | "UNKNOWN";

/** Status of a single catalogue fact. Anything other than "known" cannot produce MET/NOT_MET. */
export type ValueStatus = "known" | "unknown" | "not_applicable" | "conflicting" | "expired";

export type StudyLevel = "undergraduate" | "taught_postgraduate" | "research";

export type UkRegion = "england" | "scotland" | "wales" | "northern_ireland";

export type Currency = "GBP" | "NGN";

/** Fee/budget time basis. Annual and whole-course amounts are never compared directly. */
export type FeeBasis = "annual" | "whole_course";

/**
 * Original grade scale as entered by the applicant.
 * No arithmetic conversion between scales is allowed (Document 06): a programme
 * must publish a reviewed threshold for the applicant's own scale, otherwise UNKNOWN.
 */
export type GradeScale = "cgpa_5" | "cgpa_4" | "percentage" | "degree_class";

/** Ordered degree class codes for the "degree_class" scale. Higher is better. */
export const DEGREE_CLASS = { first: 5, second_upper: 4, second_lower: 3, third: 2, pass: 1 } as const;

export type QualificationType = "waec_ssce" | "ond" | "hnd" | "bachelors" | "pgd" | "masters" | "other";

export type ResultStatus = "final" | "pending" | "unknown";

export type EnglishStatus = "met" | "not_met" | "unknown";

/** Decimal money as a string (e.g. "20500.00") plus currency and basis. Never a float on the wire. */
export interface Money {
  amount: string;
  currency: Currency;
  basis: FeeBasis;
}

// ---------------------------------------------------------------------------
// Applicant profile and preferences (transient for anonymous diagnosis)
// ---------------------------------------------------------------------------

export interface Qualification {
  type: QualificationType;
  /** Approved subject taxonomy code, or null when not given. */
  subjectCode: string | null;
  scale: GradeScale;
  /** Grade value on the original scale; null when pending or unknown. */
  value: number | null;
  resultStatus: ResultStatus;
}

export interface ApplicantProfile {
  adultConfirmed: true;
  highestQualification: Qualification;
  english: { status: EnglishStatus };
}

export interface Preferences {
  studyLevel: StudyLevel;
  /** Empty array = no subject preference given (unassessed, 0 points). */
  subjectCodes: string[];
  /** Requested intake as "YYYY-MM", or null for no preference. */
  intake: string | null;
  /** "any" = explicit no-regional-preference (10 points); null = not answered (unassessed). */
  regions: UkRegion[] | "any" | null;
  tuitionBudget: {
    /** Decimal string or null when not given. */
    amount: string | null;
    currency: Currency;
    basis: FeeBasis;
    /** Strict cap: verified excess is excluded from the main list. */
    strict: boolean;
  };
}

// ---------------------------------------------------------------------------
// Catalogue (published, reviewed programme intakes)
// ---------------------------------------------------------------------------

export type PublicationStatus = "draft" | "in_review" | "published" | "withdrawn" | "superseded";
export type IntakeStatus = "open" | "closed" | "expired" | "withdrawn" | "unknown";
export type SourceType = "official" | "licensed_feed" | "reviewed_reference";

export interface EvidenceRef {
  id: string;
  sourceType: SourceType;
  sourceUrl: string;
  sourceOwner: string;
  retrievedAt: string;
}

export interface GradeRequirement {
  scale: GradeScale;
  minimum: number;
  status: ValueStatus;
  evidenceId: string;
}

export interface ProgrammeIntake {
  programmeId: string;
  intakeId: string;
  institution: string;
  title: string;
  studyLevel: StudyLevel;
  region: UkRegion;
  city: string;
  /** Exact approved subject codes for preference scoring. */
  subjectCodes: string[];
  /** Reviewer-approved related subject codes (20 points). */
  relatedSubjectCodes: string[];
  /** "YYYY-MM" */
  intake: string;
  intakeStatus: IntakeStatus;
  publicationStatus: PublicationStatus;
  tuition: Money & { status: ValueStatus; evidenceId: string };
  requirements: {
    /** One entry per reviewed applicant scale. Missing scale → UNKNOWN (no conversion). */
    grades: GradeRequirement[];
    /** Prior-subject requirement; null = no subject requirement for this programme. */
    priorSubject: { codes: string[]; status: ValueStatus; evidenceId: string } | null;
    english: { required: boolean; status: ValueStatus; evidenceId: string };
  };
  evidence: EvidenceRef[];
  reviewedAt: string;
  /** At or after this instant, critical facts are treated as expired until re-reviewed. */
  reviewDueAt: string;
  officialUrl: string;
}

export interface CatalogueSnapshot {
  snapshotId: string;
  asOf: string;
  intakes: ProgrammeIntake[];
}

// ---------------------------------------------------------------------------
// Match results
// ---------------------------------------------------------------------------

export type CriterionKey = "grade" | "prior_subject" | "english";

export interface CriterionResult {
  key: CriterionKey;
  outcome: Outcome | "NOT_APPLICABLE";
  reasonCode: string;
  evidenceId: string | null;
}

export type Affordability = "fit" | "over_budget" | "unassessed";
export type DisplayGroup = "potential" | "review" | "excluded";

export interface PreferencePoints {
  subject: number;
  budget: number;
  intake: number;
  location: number;
  total: number;
  unassessed: Array<"subject" | "budget" | "intake" | "location">;
}

export interface CandidateResult {
  programmeId: string;
  intakeId: string;
  institution: string;
  title: string;
  city: string;
  region: UkRegion;
  intake: string;
  tuition: Money;
  academic: Outcome;
  criteria: CriterionResult[];
  affordability: Affordability;
  displayGroup: DisplayGroup;
  exclusionReason: string | null;
  points: PreferencePoints;
  officialUrl: string;
}

export interface FilteredIntake {
  programmeId: string;
  intakeId: string;
  reasonCode: "not_published" | "intake_not_open" | "study_level_mismatch";
}

export interface MatchResult {
  rulesVersion: string;
  weightsVersion: string;
  snapshotId: string;
  evaluatedAt: string;
  potential: CandidateResult[];
  review: CandidateResult[];
  excluded: CandidateResult[];
  filtered: FilteredIntake[];
}
