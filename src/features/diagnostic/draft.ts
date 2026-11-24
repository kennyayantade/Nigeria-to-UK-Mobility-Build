/**
 * Form-friendly draft of the anonymous diagnosis, and its conversion to the
 * validated wire contract. Kept in React memory only (no storage) so an
 * anonymous profile is never persisted in the browser.
 */
import { diagnosticRequestSchema, preferencesSchema, profileSchema, type DiagnosticRequest } from "@/contracts/diagnostic";
import type {
  Currency,
  EnglishStatus,
  FeeBasis,
  GradeScale,
  QualificationType,
  ResultStatus,
  StudyLevel,
  UkRegion,
} from "@/domain/types";

export interface DiagnosticDraft {
  adultConfirmed: boolean;
  qualification: {
    type: QualificationType;
    subjectCode: string; // "" = not given
    scale: GradeScale;
    value: string; // text input; "" = empty
    resultStatus: ResultStatus;
  };
  english: EnglishStatus;
  preferences: {
    studyLevel: StudyLevel;
    subjectCodes: string[];
    intake: string; // "" = no preference
    regionMode: "any" | "specific" | "unanswered";
    regions: UkRegion[];
    budgetAmount: string; // "" = not given
    currency: Currency;
    basis: FeeBasis;
    strict: boolean;
  };
}

export const EMPTY_DRAFT: DiagnosticDraft = {
  adultConfirmed: false,
  qualification: { type: "bachelors", subjectCode: "", scale: "cgpa_5", value: "", resultStatus: "final" },
  english: "unknown",
  preferences: {
    studyLevel: "taught_postgraduate",
    subjectCodes: [],
    intake: "",
    regionMode: "unanswered",
    regions: [],
    budgetAmount: "",
    currency: "GBP",
    basis: "annual",
    strict: true,
  },
};

export type FieldErrors = Record<string, string>;

function toNumberOrNull(text: string): number | null {
  const t = text.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : Number.NaN;
}

function normaliseAmount(text: string): string | null {
  const t = text.replace(/[,\s£₦]/g, "");
  return t === "" ? null : t;
}

export function toProfile(d: DiagnosticDraft) {
  const q = d.qualification;
  return {
    adultConfirmed: d.adultConfirmed,
    highestQualification: {
      type: q.type,
      subjectCode: q.subjectCode === "" ? null : q.subjectCode,
      scale: q.scale,
      value: q.resultStatus === "final" ? toNumberOrNull(q.value) : null,
      resultStatus: q.resultStatus,
    },
    english: { status: d.english },
  };
}

export function toPreferences(d: DiagnosticDraft) {
  const p = d.preferences;
  return {
    studyLevel: p.studyLevel,
    subjectCodes: p.subjectCodes,
    intake: p.intake === "" ? null : p.intake,
    regions: p.regionMode === "any" ? ("any" as const) : p.regionMode === "specific" ? p.regions : null,
    tuitionBudget: { amount: normaliseAmount(p.budgetAmount), currency: p.currency, basis: p.basis, strict: p.strict },
  };
}

function collect(issues: { path: (string | number)[]; message: string }[], prefix = ""): FieldErrors {
  const out: FieldErrors = {};
  for (const i of issues) {
    const key = prefix + i.path.join(".");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

/** Validates the A03 step (qualification + English). */
export function validateQualifications(d: DiagnosticDraft): FieldErrors {
  const r = profileSchema.safeParse(toProfile({ ...d, adultConfirmed: true }));
  if (r.success) return {};
  const errors = collect(r.error.issues);
  if (errors["highestQualification.value"]?.startsWith("Expected number")) {
    errors["highestQualification.value"] = "Enter the grade as a number, e.g. 4.2";
  }
  return errors;
}

/** Validates the A04 step. */
export function validatePreferences(d: DiagnosticDraft): FieldErrors {
  const r = preferencesSchema.safeParse(toPreferences(d));
  const errors: FieldErrors = r.success ? {} : collect(r.error.issues);
  if (d.preferences.regionMode === "specific" && d.preferences.regions.length === 0) {
    errors["regions"] = "Choose at least one region, or select “Anywhere in the UK”.";
  }
  return errors;
}

export function buildRequest(d: DiagnosticDraft): { ok: true; request: DiagnosticRequest } | { ok: false; errors: FieldErrors } {
  const r = diagnosticRequestSchema.safeParse({ profile: toProfile(d), preferences: toPreferences(d) });
  return r.success ? { ok: true, request: r.data } : { ok: false, errors: collect(r.error.issues) };
}
