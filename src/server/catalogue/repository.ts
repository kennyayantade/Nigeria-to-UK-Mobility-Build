import type { CatalogueSnapshot, ProgrammeIntake } from "@/domain/types";
import type { CoverageResponse } from "@/contracts/catalogue";
import { SYNTHETIC_SNAPSHOT } from "./fixtures";

export interface CatalogueRepository {

  currentSnapshot(): Promise<CatalogueSnapshot>;
  coverage(now: Date): Promise<CoverageResponse>;

  getIntake(intakeId: string): Promise<ProgrammeIntake | null>;
}

class MemoryCatalogueRepository implements CatalogueRepository {
  constructor(private readonly snapshot: CatalogueSnapshot) {}

  async currentSnapshot(): Promise<CatalogueSnapshot> {
    return this.snapshot;
  }

  async getIntake(intakeId: string): Promise<ProgrammeIntake | null> {
    return this.snapshot.intakes.find((i) => i.intakeId === intakeId && i.publicationStatus === "published") ?? null;
  }

  async coverage(now: Date): Promise<CoverageResponse> {
    const active = this.snapshot.intakes.filter(
      (i) => i.publicationStatus === "published" && i.intakeStatus === "open" && Date.parse(i.reviewDueAt) > now.getTime(),
    );
    const byLevel: CoverageResponse["byLevel"] = {};
    const byRegion: CoverageResponse["byRegion"] = {};
    for (const i of active) {
      byLevel[i.studyLevel] = (byLevel[i.studyLevel] ?? 0) + 1;
      byRegion[i.region] = (byRegion[i.region] ?? 0) + 1;
    }
    return {
      snapshotId: this.snapshot.snapshotId,
      asOf: this.snapshot.asOf,
      activeIntakes: active.length,
      institutions: new Set(active.map((i) => i.institution)).size,
      byLevel,
      byRegion,
      synthetic: true,
    };
  }
}

let instance: CatalogueRepository | null = null;

export function getCatalogueRepository(): CatalogueRepository {
  if (!instance) {
    const source = process.env.CATALOGUE_SOURCE ?? "memory";
    if (source !== "memory") {
      throw new Error(`CATALOGUE_SOURCE "${source}" is not implemented yet. Use "memory" until the reviewed catalogue (W05) exists.`);
    }
    instance = new MemoryCatalogueRepository(SYNTHETIC_SNAPSHOT);
  }
  return instance;
}