/**
 * SYNTHETIC catalogue fixture. All institutions, programmes, criteria and fees are
 * fictional. Do not present as real admissions data. Replace via the reviewed
 * catalogue pipeline (W04/W05) once sources and rights are approved.
 */
import type { CatalogueSnapshot, EvidenceRef, ProgrammeIntake } from "@/domain/types";

const REVIEWED = "2026-11-01T09:00:00Z";
const DUE = "2027-03-01T00:00:00Z";

function ev(prefix: string): EvidenceRef[] {
  return ["GRADE", "SUBJECT", "ENGLISH", "FEE"].map((k) => ({
    id: `${prefix}-${k}`,
    sourceType: "reviewed_reference" as const,
    sourceUrl: "https://example.invalid/synthetic-source",
    sourceOwner: "Synthetic fixture (not a real institution)",
    retrievedAt: REVIEWED,
  }));
}

function intake(p: Partial<ProgrammeIntake> & Pick<ProgrammeIntake, "programmeId" | "institution" | "title" | "region" | "city">, fee: string, minCgpa5: number): ProgrammeIntake {
  const id = p.programmeId;
  return {
    intakeId: `${id}-2027-09`,
    studyLevel: "taught_postgraduate",
    subjectCodes: ["computing"],
    relatedSubjectCodes: ["data_science", "engineering"],
    intake: "2027-09",
    intakeStatus: "open",
    publicationStatus: "published",
    tuition: { amount: fee, currency: "GBP", basis: "annual", status: "known", evidenceId: `${id}-FEE` },
    requirements: {
      grades: [
        { scale: "cgpa_5", minimum: minCgpa5, status: "known", evidenceId: `${id}-GRADE` },
        { scale: "degree_class", minimum: 4, status: "known", evidenceId: `${id}-GRADE` },
      ],
      priorSubject: { codes: ["computing", "data_science", "engineering"], status: "known", evidenceId: `${id}-SUBJECT` },
      english: { required: true, status: "known", evidenceId: `${id}-ENGLISH` },
    },
    evidence: ev(id),
    reviewedAt: REVIEWED,
    reviewDueAt: DUE,
    officialUrl: "https://example.invalid/synthetic-programme",
    ...p,
  };
}

export const SYNTHETIC_SNAPSHOT: CatalogueSnapshot = {
  snapshotId: "SYNTH-2027-V1",
  asOf: REVIEWED,
  intakes: [
    intake({ programmeId: "P-NORTHBRIDGE-MSC-AC", institution: "Northbridge University", title: "MSc Applied Computing", region: "england", city: "Northbridge" }, "20500", 3.5),
    intake({ programmeId: "P-ALDER-MSC-DS", institution: "Alder University", title: "MSc Data & Society", region: "scotland", city: "Alder", subjectCodes: ["data_science", "social_science"], relatedSubjectCodes: ["computing"] }, "18500", 3.2),
    intake({ programmeId: "P-WESTMERE-MSC-DI", institution: "Westmere Institute", title: "MSc Digital Innovation", region: "wales", city: "Westmere" }, "24500", 3.7),
    intake(
      {
        programmeId: "P-HARTFIELD-MSC-PH",
        institution: "Hartfield University",
        title: "MSc Global Public Health",
        region: "england",
        city: "Hartfield",
        subjectCodes: ["public_health"],
        relatedSubjectCodes: ["social_science"],
        requirements: {
          grades: [{ scale: "cgpa_5", minimum: 3.0, status: "known", evidenceId: "P-HARTFIELD-MSC-PH-GRADE" }],
          priorSubject: null,
          // English requirement not yet confirmed by source review → UNKNOWN for everyone.
          english: { required: true, status: "unknown", evidenceId: "P-HARTFIELD-MSC-PH-ENGLISH" },
        },
      },
      "19000",
      3.0,
    ),
    intake(
      { programmeId: "P-KESTREL-MSC-BA", institution: "Kestrel Business School", title: "MSc Business Analytics", region: "northern_ireland", city: "Kestrel", subjectCodes: ["business", "data_science"], relatedSubjectCodes: ["computing"], reviewDueAt: "2026-10-01T00:00:00Z", reviewedAt: "2026-04-01T09:00:00Z" },
      "17500",
      3.0,
    ),
    intake(
      { programmeId: "P-ORCHARD-MSC-SE", institution: "Orchard University", title: "MSc Software Engineering", region: "england", city: "Orchard", intakeStatus: "closed" },
      "21000",
      3.5,
    ),
    intake(
      { programmeId: "P-ALDER-BSC-CS", institution: "Alder University", title: "BSc Computer Science", region: "scotland", city: "Alder", studyLevel: "undergraduate", intakeId: "P-ALDER-BSC-CS-2027-09" },
      "16500",
      0,
    ),
  ],
};
