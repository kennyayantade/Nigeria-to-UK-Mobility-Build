"use client";


import { Container } from "@/components/layout/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MAX_COMPARE, useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";

export function CompareTray() {
  const { compare, clearCompare } = useDiagnostic();
  if (compare.length === 0) return null;
  const ready = compare.length >= 2;

  return (
    <div role="region" aria-label="Courses to compare" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 shadow-float backdrop-blur animate-rise">
      <Container className="flex items-center justify-between gap-4 py-3">
        <p className="flex items-center gap-2 text-sm" aria-live="polite">
          <Icon name="columns" className="size-5 text-brand-blue" />
          <span>
            <span className="font-semibold">
              {compare.length} of {MAX_COMPARE}
            </span>{" "}
            selected{!ready && <span className="text-muted">. Pick one more to compare.</span>}
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" onClick={clearCompare}>
            Clear
          </Button>
          {ready ? <ButtonLink href="/compare">Compare</ButtonLink> : <Button disabled>Compare</Button>}
        </div>
      </Container>
    </div>
  );
}