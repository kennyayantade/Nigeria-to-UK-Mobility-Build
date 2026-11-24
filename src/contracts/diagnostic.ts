/**
 * Wire contract for POST /api/v1/diagnostics/match (Document 07, "Core API operations").
 * Closed objects (.strict()) reject unknown keys; strings and arrays are bounded.
 * Shared by the browser (form validation) and the server (request validation).
 */
import { z } from "zod";
import type { ApplicantProfile, Preferences } from "@/domain/types";
import { isDecimalAmount } from "@/domain/money";

export const API_VERSION = "v1";
export const MAX_JSON_BYTES = 64 * 1024;

const studyLevel = z.enum(["undergraduate", "taught_postgraduate", "research"]);
const region = z.enum(["england", "scotland", "wales", "northern_ireland"]);
const currency = z.enum(["GBP", "NGN"]);
const basis = z.enum(["annual", "whole_course"]);
const gradeScale = z.enum(["cgpa_5", "cgpa_4", "percentage", "degree_class"]);
const subjectCode = z.string().min(1).max(64).regex(/^[a-z0-9_]+$/);
const decimal = z.string().max(16).refine(isDecimalAmount, "Enter an amount like 22000 or 22000.50");

const SCALE_MAX = { cgpa_5: 5, cgpa_4: 4, percentage: 100, degree_class: 5 } as const;

export const qualificationSchema = z
  .object({
    type: z.enum(["waec_ssce", "ond", "hnd", "bachelors", "pgd", "masters", "other"]),
    subjectCode: subjectCode.nullable(),
    scale: gradeScale,
    value: z.number().finite().min(0).nullable(),
    resultStatus: z.enum(["final", "pending", "unknown"]),
  })
  .strict()
  .superRefine((q, ctx) => {
    if (q.resultStatus === "final" && q.value === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Enter your final grade, or mark it as pending or unknown." });
    }
    if (q.value !== null && q.value > SCALE_MAX[q.scale]) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: `Grade must be between 0 and ${SCALE_MAX[q.scale]} on this scale.` });
    }
    if (q.resultStatus !== "final" && q.value !== null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Leave the grade empty when the result is pending or unknown." });
    }
  });

export const profileSchema = z
  .object({
    adultConfirmed: z.literal(true),
    highestQualification: qualificationSchema,
    english: z.object({ status: z.enum(["met", "not_met", "unknown"]) }).strict(),
  })
  .strict();

export const preferencesSchema = z
  .object({
    studyLevel,
    subjectCodes: z.array(subjectCode).max(10),
    intake: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).nullable(),
    regions: z.union([z.array(region).min(1).max(4), z.literal("any")]).nullable(),
    tuitionBudget: z
      .object({ amount: decimal.nullable(), currency, basis, strict: z.boolean() })
      .strict(),
  })
  .strict();

export const diagnosticRequestSchema = z
  .object({ profile: profileSchema, preferences: preferencesSchema })
  .strict();

export type DiagnosticRequest = z.infer<typeof diagnosticRequestSchema>;

// Compile-time guarantee that the wire contract and the domain types never drift.
type Assert<T extends true> = T;
export type _ProfileMatches = Assert<z.infer<typeof profileSchema> extends ApplicantProfile ? true : false>;
export type _PreferencesMatches = Assert<z.infer<typeof preferencesSchema> extends Preferences ? true : false>;

/** Standard error body for all /api/v1 routes. */
export interface ApiError {
  error: { code: string; message: string; fields?: Record<string, string> };
}
