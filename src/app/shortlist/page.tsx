"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heading, Lead } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { Pill } from "@/components/ui/Pill";
import { formatMoney } from "@/domain/money";
import { REGION_LABEL } from "@/domain/taxonomy";
import type { ProgrammeIntake } from "@/domain/types";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { formatDate, formatIntake } from "@/features/results/reasons";
import { api } from "@/lib/api-client";

type Facts = Record<string, ProgrammeIntake | "missing">;

const GROUP = {
  potential: { label: "Potential match", className: "bg-status-met-bg text-status-met" },
  review: { label: "Needs review", className: "bg-status-unknown-bg text-status-unknown" },
  excluded: { label: "Not in main list", className: "bg-status-notmet-bg text-status-notmet" },
} as const;

export default function ShortlistPage() {
  const { shortlist, toggleShortlist, result } = useDiagnostic();
  const [facts, setFacts] = useState<Facts>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      shortlist.map(async (id): Promise<[string, ProgrammeIntake | "missing"]> => {
        try {
          return [id, await api.getProgramme(id)];
        } catch {
          return [id, "missing"];
        }
      }),
    ).then((entries) => {
      if (!cancelled) setFacts(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [shortlist]);

  const resultFor = (id: string) => (result ? [...result.potential, ...result.review, ...result.excluded].find((c) => c.intakeId === id) : undefined);

  return (
    <Container size="medium" className="py-12 sm:py-16">
      <Heading as="h1" size="title">
        Your shortlist
      </Heading>
      <Lead className="mt-3">Courses you saved during this visit, checked again against the latest reviewed information.</Lead>

      <div className="mt-8">
        <Notice>Your shortlist lasts until you refresh or close this tab. Saving it to an account comes with sign-in.</Notice>
      </div>

      {shortlist.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-surface p-8 text-center">
          <Icon name="bookmark" className="mx-auto size-8 text-brand-purple" />
          <p className="mt-4 font-semibold">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted">Use “Save” on any course in your results to keep it here.</p>
          <ButtonLink href={result ? "/results" : "/start"} className="mt-6">
            {result ? "Back to results" : "Start a comparison"}
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5">
          {shortlist.map((id) => {
            const f = facts[id];
            const r = resultFor(id);
            const expired = f && f !== "missing" && Date.now() >= Date.parse(f.reviewDueAt);

            return (
              <Card as="li" key={id} className="grid gap-4 sm:p-7">
                {f === undefined ? (
                  <div className="grid animate-pulse gap-2" aria-label="Loading course">
                    <span className="h-3 w-32 rounded-full bg-line" />
                    <span className="h-5 w-64 rounded-full bg-line" />
                  </div>
                ) : f === "missing" ? (
                  <Notice tone="warning" title="This course is no longer listed">
                    It may have been withdrawn or closed since you saved it.
                  </Notice>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-muted">{f.institution}</p>
                        <Link href={`/programmes/${encodeURIComponent(id)}`} className="text-lg font-bold tracking-tight hover:text-brand-blue">
                          {f.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted">
                          {f.city}, {REGION_LABEL[f.region]}. Starts {formatIntake(f.intake)}.
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-bold">
                        {formatMoney(f.tuition.amount, f.tuition.currency)}
                        <span className="text-sm font-normal text-muted"> {f.tuition.basis === "annual" ? "a year" : "in total"}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r ? (
                        <Pill className={GROUP[r.displayGroup].className}>{GROUP[r.displayGroup].label}</Pill>
                      ) : (
                        <Pill>Run a comparison to see your result</Pill>
                      )}
                      {expired ? (
                        <Pill className="bg-status-unknown-bg text-status-unknown">Past review date: confirm before relying on it</Pill>
                      ) : (
                        <Pill>Reviewed {formatDate(f.reviewedAt)}</Pill>
                      )}
                      {f.intakeStatus !== "open" && <Pill className="bg-status-notmet-bg text-status-notmet">No longer accepting applications</Pill>}
                    </div>
                  </>
                )}
                <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                  {f && f !== "missing" && (
                    <ButtonLink href={`/programmes/${encodeURIComponent(id)}`} variant="secondary">
                      View evidence
                    </ButtonLink>
                  )}
                  <button type="button" onClick={() => toggleShortlist(id)} className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface hover:text-ink">
                    Remove
                    <span className="sr-only"> from shortlist</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </Container>
  );
}