import type { ReactNode } from "react";
import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";

export function CtaBand({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return (
    <Section tone="ink" space="md" labelledBy="cta-title">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Heading size="title" id="cta-title" className="max-w-[18ch]">
            {title}
          </Heading>
          <p className="mt-4 max-w-[52ch] text-lead text-paper/75">{body}</p>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </Section>
  );
}
