"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDiagnostic } from "./DiagnosticProvider";

/** Sends the user back to the adult gate (A02) if it hasn't been completed this session. */
export function useRequireAdult(): boolean {
  const { draft } = useDiagnostic();
  const router = useRouter();
  useEffect(() => {
    if (!draft.adultConfirmed) router.replace("/start");
  }, [draft.adultConfirmed, router]);
  return draft.adultConfirmed;
}
