"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { MatchResult } from "@/domain/types";
import { EMPTY_DRAFT, type DiagnosticDraft } from "./draft";

export const MAX_COMPARE = 3;
export const MAX_SHORTLIST = 20;

interface DiagnosticContextValue {
  draft: DiagnosticDraft;
  update: (fn: (d: DiagnosticDraft) => DiagnosticDraft) => void;
  result: MatchResult | null;
  setResult: (r: MatchResult | null) => void;

  shortlist: string[];
  toggleShortlist: (intakeId: string) => void;

  compare: string[];
  toggleCompare: (intakeId: string) => void;
  clearCompare: () => void;
  reset: () => void;
}

const DiagnosticContext = createContext<DiagnosticContextValue | null>(null);

function toggle(list: string[], id: string, max: number): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  return list.length >= max ? list : [...list, id];
}



export function DiagnosticProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<DiagnosticDraft>(EMPTY_DRAFT);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  const update = useCallback((fn: (d: DiagnosticDraft) => DiagnosticDraft) => {
    setDraft((d) => fn(d));

    setResult(null);
    setCompare([]);
  }, []);

  const toggleShortlist = useCallback((id: string) => setShortlist((l) => toggle(l, id, MAX_SHORTLIST)), []);
  const toggleCompare = useCallback((id: string) => setCompare((l) => toggle(l, id, MAX_COMPARE)), []);
  const clearCompare = useCallback(() => setCompare([]), []);

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setResult(null);
    setShortlist([]);
    setCompare([]);
  }, []);

  const value = useMemo(
    () => ({ draft, update, result, setResult, shortlist, toggleShortlist, compare, toggleCompare, clearCompare, reset }),
    [draft, update, result, shortlist, toggleShortlist, compare, toggleCompare, clearCompare, reset],
  );
  return <DiagnosticContext.Provider value={value}>{children}</DiagnosticContext.Provider>;
}

export function useDiagnostic(): DiagnosticContextValue {
  const ctx = useContext(DiagnosticContext);
  if (!ctx) throw new Error("useDiagnostic must be used inside <DiagnosticProvider>");
  return ctx;
}