/**
 * Synthetic subject taxonomy and display labels.
 * Real codes and related-subject mappings must be approved by education reviewers (Document 06).
 */
import type { GradeScale, QualificationType, StudyLevel, UkRegion } from "@/domain/types";

export const SUBJECTS = [
  { code: "computing", label: "Computing and IT" },
  { code: "data_science", label: "Data science" },
  { code: "engineering", label: "Engineering" },
  { code: "business", label: "Business and management" },
  { code: "public_health", label: "Public health" },
  { code: "education", label: "Education" },
  { code: "social_science", label: "Social sciences" },
] as const;

export type SubjectCode = (typeof SUBJECTS)[number]["code"];

export const SUBJECT_LABEL: Record<string, string> = Object.fromEntries(SUBJECTS.map((s) => [s.code, s.label]));

export const QUALIFICATION_LABEL: Record<QualificationType, string> = {
  waec_ssce: "WAEC / NECO SSCE",
  ond: "OND",
  hnd: "HND",
  bachelors: "Bachelor's degree",
  pgd: "Postgraduate diploma (PGD)",
  masters: "Master's degree",
  other: "Other qualification",
};

export const SCALE_LABEL: Record<GradeScale, string> = {
  cgpa_5: "CGPA out of 5.0",
  cgpa_4: "CGPA out of 4.0",
  percentage: "Percentage (0–100)",
  degree_class: "Degree class (First, 2:1, 2:2 …)",
};

export const SCALE_RANGE: Record<GradeScale, { min: number; max: number; step: number }> = {
  cgpa_5: { min: 0, max: 5, step: 0.01 },
  cgpa_4: { min: 0, max: 4, step: 0.01 },
  percentage: { min: 0, max: 100, step: 0.1 },
  degree_class: { min: 1, max: 5, step: 1 },
};

export const LEVEL_LABEL: Record<StudyLevel, string> = {
  undergraduate: "Undergraduate",
  taught_postgraduate: "Postgraduate taught (e.g. MSc, MA)",
  research: "Postgraduate research (e.g. PhD)",
};

export const REGION_LABEL: Record<UkRegion, string> = {
  england: "England",
  scotland: "Scotland",
  wales: "Wales",
  northern_ireland: "Northern Ireland",
};

/** Options for the degree_class scale; values follow DEGREE_CLASS (higher is better). */
export const DEGREE_CLASS_OPTIONS = [
  { value: 5, label: "First Class" },
  { value: 4, label: "Second Class Upper (2:1)" },
  { value: 3, label: "Second Class Lower (2:2)" },
  { value: 2, label: "Third Class" },
  { value: 1, label: "Pass" },
] as const;
