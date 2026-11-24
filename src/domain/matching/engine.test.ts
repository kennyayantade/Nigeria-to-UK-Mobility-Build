import { describe, expect, it } from "vitest";
import { evaluate, WEIGHTS_VERSION } from "@/domain/matching/engine";
import { SYNTHETIC_SNAPSHOT } from "@/server/catalogue/fixtures";
import type { ApplicantProfile, Preferences } from "@/domain/types";

const NOW = "2026-11-17T09:00:00Z";

function profile(overrides: Partial<ApplicantProfile["highestQualification"]> = {}, english: ApplicantProfile["english"]["status"] = "met"): ApplicantProfile {
  return {
    adultConfirmed: true,
    highestQualification: { type: "bachelors", subjectCode: "computing", scale: "cgpa_5", value: 4.2, resultStatus: "final", ...overrides },
    english: { status: english },
  };
}

function prefs(overrides: Partial<Preferences> = {}): Preferences {
  return {
    studyLevel: "taught_postgraduate",
    subjectCodes: ["computing"],
    intake: "2027-09",
    regions: "any",
    tuitionBudget: { amount: "22000", currency: "GBP", basis: "annual", strict: true },
    ...overrides,
  };
}

const run = (p = profile(), q = prefs()) => evaluate({ profile: p, preferences: q, snapshot: SYNTHETIC_SNAPSHOT, now: NOW });
const ids = (list: { programmeId: string }[]) => list.map((c) => c.programmeId);

describe("matching engine", () => {
  it("records versions for reproducibility", () => {
    const r = run();
    expect(r.weightsVersion).toBe(WEIGHTS_VERSION);
    expect(r.snapshotId).toBe("SYNTH-2027-V1");
    expect(r.evaluatedAt).toBe(NOW);
  });

  it("is deterministic for identical input", () => {
    expect(run()).toEqual(run());
  });

  it("filters closed intakes and other levels without calling them academic failures", () => {
    const r = run();
    expect(r.filtered).toEqual(
      expect.arrayContaining([
        { programmeId: "P-ORCHARD-MSC-SE", intakeId: "P-ORCHARD-MSC-SE-2027-09", reasonCode: "intake_not_open" },
        { programmeId: "P-ALDER-BSC-CS", intakeId: "P-ALDER-BSC-CS-2027-09", reasonCode: "study_level_mismatch" },
      ]),
    );
    expect(ids(r.excluded)).not.toContain("P-ORCHARD-MSC-SE");
  });

  it("excludes verified excess under a strict budget without changing the academic outcome", () => {
    const westmere = run().excluded.find((c) => c.programmeId === "P-WESTMERE-MSC-DI");
    expect(westmere?.academic).toBe("MET");
    expect(westmere?.affordability).toBe("over_budget");
    expect(westmere?.exclusionReason).toBe("tuition_above_strict_cap");
  });

  it("sends non-strict over-budget programmes to review, not potential", () => {
    const r = run(profile(), prefs({ tuitionBudget: { amount: "22000", currency: "GBP", basis: "annual", strict: false } }));
    expect(ids(r.review)).toContain("P-WESTMERE-MSC-DI");
  });

  it("never converts UNKNOWN to a pass: unconfirmed English requirement goes to review", () => {
    const hartfield = run().review.find((c) => c.programmeId === "P-HARTFIELD-MSC-PH");
    expect(hartfield?.academic).toBe("UNKNOWN");
    expect(hartfield?.criteria.find((c) => c.key === "english")?.outcome).toBe("UNKNOWN");
  });

  it("treats facts at or after review_due_at as expired → UNKNOWN", () => {
    const kestrel = run().review.find((c) => c.programmeId === "P-KESTREL-MSC-BA");
    expect(kestrel?.academic).toBe("UNKNOWN");
    expect(kestrel?.affordability).toBe("unassessed");
    expect(kestrel?.criteria.every((c) => c.outcome === "UNKNOWN")).toBe(true);
  });

  it("does not convert between grade scales", () => {
    const r = run(profile({ scale: "cgpa_4", value: 3.9 }));
    const northbridge = [...r.potential, ...r.review].find((c) => c.programmeId === "P-NORTHBRIDGE-MSC-AC");
    expect(northbridge?.criteria.find((c) => c.key === "grade")?.reasonCode).toBe("no_reviewed_threshold_for_scale");
    expect(northbridge?.displayGroup).toBe("review");
  });

  it("marks a pending result as UNKNOWN, not a fail", () => {
    const r = run(profile({ value: null, resultStatus: "pending" }));
    expect(r.excluded.filter((c) => c.exclusionReason === "academic_not_met")).toHaveLength(0);
    expect(r.potential).toHaveLength(0);
  });

  it("excludes a grade below the minimum as academic NOT_MET", () => {
    const r = run(profile({ value: 3.4 }));
    const northbridge = r.excluded.find((c) => c.programmeId === "P-NORTHBRIDGE-MSC-AC");
    expect(northbridge?.academic).toBe("NOT_MET");
    expect(northbridge?.exclusionReason).toBe("academic_not_met");
  });

  it("does not compare different currencies or bases", () => {
    const r = run(profile(), prefs({ tuitionBudget: { amount: "30000000", currency: "NGN", basis: "annual", strict: true } }));
    expect(r.potential).toHaveLength(0);
    expect(r.review.every((c) => c.affordability === "unassessed" || c.academic === "UNKNOWN")).toBe(true);
  });

  it("scores 40/30/20/10 and ranks by points then programme id", () => {
    const r = run();
    expect(ids(r.potential)).toEqual(["P-NORTHBRIDGE-MSC-AC", "P-ALDER-MSC-DS"]);
    const [first, second] = r.potential;
    expect(first?.points).toMatchObject({ subject: 40, budget: 30, intake: 20, location: 10, total: 100 });
    expect(second?.points).toMatchObject({ subject: 20, budget: 30, intake: 20, location: 10, total: 80 });
  });

  it("records missing preferences as unassessed with zero points, without rescaling", () => {
    const r = run(profile(), prefs({ subjectCodes: [], intake: null, regions: null }));
    const top = r.potential[0];
    expect(top?.points.total).toBe(30);
    expect(top?.points.unassessed).toEqual(["subject", "intake", "location"]);
  });
});
