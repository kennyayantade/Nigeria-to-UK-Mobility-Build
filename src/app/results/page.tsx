"use client";


import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Heading, Lead } from "@/components/ui/Heading";
import { Notice } from "@/components/ui/Notice";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { SimplePage } from "@/features/diagnostic/Stepper";
import { CompareTray } from "@/features/results/CompareTray";
import { ResultCard } from "@/features/results/ResultCard";
import { formatDate } from "@/features/results/reasons";

type Group = "potential" | "review" | "excluded";

const GROUPS: Record<Group, { label: string; intro: string; empty: string }> = {
  potential: {
    label: "Potential matches",
    intro: "You meet the academic requirements on current evidence, and the fee fits your budget.",
    empty: "No potential matches yet. Check “Needs review”: those courses may still work once an unknown is confirmed.",
  },
  review: {
    label: "Needs review",
    intro: "Something is unknown, out of date or not assessable. An adviser can help you confirm it.",
    empty: "Nothing needs review for your current answers.",
  },
  excluded: {
    label: "Not in main list",
    intro: "A requirement isn't met, or the fee is above your strict budget. Shown so you can see why.",
    empty: "No courses were left out.",
  },
};

export default function ResultsPage() {
  const { result } = useDiagnostic();
  const [group, setGroup] = useState<Group>(() => (result && result.potential.length === 0 ? "review" : "potential"));

  if (!result) {
    return (
      <SimplePage title="No results yet" intro="Results aren't saved, so they clear when you refresh the page or change your answers.">
        <ButtonLink href="/start" size="lg">
          Start a comparison
        </ButtonLink>
      </SimplePage>
    );
  }

  const items = result[group];
  const total = result.potential.length + result.review.length + result.excluded.length;

  return (
    <Container size="medium" className="pb-32 pt-12 sm:pt-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading as="h1" size="title">
            Your course comparison
          </Heading>
          <Lead className="mt-3">
            We checked {total} open course {total === 1 ? "intake" : "intakes"} against your answers.
          </Lead>
        </div>
        <ButtonLink href="/profile/review" variant="secondary" className="self-start sm:self-auto">
          Change answers
        </ButtonLink>
      </div>

      <div className="mt-8">
        <Notice>
          A comparison, not an admission or visa decision. Unknown information stays unknown and never counts as a pass.
        </Notice>
      </div>

      <div className="mt-10">
        <Tabs<Group>
          idPrefix="results"
          label="Result groups"
          value={group}
          onChange={setGroup}
          items={(Object.keys(GROUPS) as Group[]).map((key) => ({ key, label: GROUPS[key].label, count: result[key].length }))}
        />
      </div>

      <TabPanel idPrefix="results" activeKey={group}>
        <p className="mt-6 max-w-[62ch] text-muted">{GROUPS[group].intro}</p>
        {items.length > 0 ? (
          <ul key={group} className="mt-6 grid gap-5 animate-drop">
            {items.map((c) => (
              <ResultCard key={c.intakeId} result={c} />
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-3xl bg-surface p-6 text-muted">{GROUPS[group].empty}</p>
        )}
      </TabPanel>

      <p className="mt-12 text-xs text-muted">
        Course data snapshot {result.snapshotId}, checked {formatDate(result.evaluatedAt)}. Rules {result.rulesVersion}, weights {result.weightsVersion}.
      </p>
      <CompareTray />
    </Container>
  );
}