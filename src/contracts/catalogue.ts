import type { StudyLevel, UkRegion } from "@/domain/types";

/** Response of GET /api/v1/catalogue/coverage. Counts only; no whole-catalogue licence implied. */
export interface CoverageResponse {
  snapshotId: string;
  asOf: string;
  activeIntakes: number;
  institutions: number;
  byLevel: Partial<Record<StudyLevel, number>>;
  byRegion: Partial<Record<UkRegion, number>>;
  synthetic: boolean;
}
