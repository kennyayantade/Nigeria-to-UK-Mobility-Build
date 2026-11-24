import { getCatalogueRepository } from "@/server/catalogue/repository";
import { errorResponse, okResponse } from "@/server/http/json";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ intakeId: string }> }) {
  const { intakeId } = await params;
  if (intakeId.length > 128) return errorResponse(400, "invalid_id", "That course id isn't valid.");

  const intake = await getCatalogueRepository().getIntake(intakeId);
  if (!intake) return errorResponse(404, "not_found", "We couldn't find that course. It may have been withdrawn.");
  return okResponse(intake);
}