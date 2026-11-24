/**
 * POST /api/v1/diagnostics/match — anonymous, transient diagnosis.
 *
 * Privacy (Document 07): the profile is processed in request memory only.
 * Nothing is persisted, and the request body must never be logged or traced.
 */
import { diagnosticRequestSchema, MAX_JSON_BYTES } from "@/contracts/diagnostic";
import { evaluate } from "@/domain/matching/engine";
import { getCatalogueRepository } from "@/server/catalogue/repository";
import { errorResponse, okResponse, readJsonLimited, zodFields } from "@/server/http/json";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return errorResponse(415, "unsupported_media_type", "Send the request as application/json.");
  }

  let body: unknown;
  try {
    body = await readJsonLimited(request, MAX_JSON_BYTES);
  } catch {
    return errorResponse(400, "invalid_json", "The request body is not valid JSON.");
  }
  if (body === null) {
    return errorResponse(413, "payload_too_large", "The request is larger than the permitted size.");
  }

  const parsed = diagnosticRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(422, "validation_failed", "Some answers need correcting before comparison.", zodFields(parsed.error));
  }

  const snapshot = await getCatalogueRepository().currentSnapshot();
  const result = evaluate({
    profile: parsed.data.profile,
    preferences: parsed.data.preferences,
    snapshot,
    now: new Date().toISOString(),
  });
  return okResponse(result);
}
