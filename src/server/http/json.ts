import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { ApiError } from "@/contracts/diagnostic";

const NO_STORE = { "Cache-Control": "no-store" };

export function errorResponse(status: number, code: string, message: string, fields?: Record<string, string>) {
  const body: ApiError = { error: { code, message, ...(fields ? { fields } : {}) } };
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function okResponse<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function zodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/**
 * Reads a JSON body with a hard size ceiling (Document 07: provisional 64 KiB).
 * Returns null when too large; throws SyntaxError for malformed JSON.
 */
export async function readJsonLimited(request: Request, maxBytes: number): Promise<unknown | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return null;
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) return null;
  return JSON.parse(text);
}
