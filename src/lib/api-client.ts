import type { ApiError, DiagnosticRequest } from "@/contracts/diagnostic";
import type { MatchResult, ProgrammeIntake } from "@/domain/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init.headers } });
  } catch {
    throw new ApiClientError(0, "network_error", "We couldn't reach the service. Check your connection and try again.");
  }
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json as ApiError | null)?.error;
    throw new ApiClientError(res.status, err?.code ?? "unknown_error", err?.message ?? "Something went wrong. Please try again.", err?.fields);
  }
  return json as T;
}

export const api = {
  runDiagnostic: (body: DiagnosticRequest) =>
    request<MatchResult>("/diagnostics/match", { method: "POST", body: JSON.stringify(body) }),
  getProgramme: (intakeId: string) => request<ProgrammeIntake>(`/programmes/${encodeURIComponent(intakeId)}`, { method: "GET" }),
};