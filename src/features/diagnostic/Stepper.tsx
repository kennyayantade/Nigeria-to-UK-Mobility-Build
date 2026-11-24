import { Container } from "@/components/layout/Container";
import { Heading, Lead } from "@/components/ui/Heading";

const STEPS = ["Qualifications", "Study and funding", "Review"] as const;

export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={label} aria-current={state === "current" ? "step" : undefined}>
            <span className="block h-1.5 overflow-hidden rounded-full bg-line">
              <span
                className={`block h-full rounded-full bg-brand-gradient transition-[width] duration-500 ease-out ${state === "todo" ? "w-0" : "w-full"}`}
              />
            </span>
            <span className={`mt-2 block text-xs font-semibold sm:text-sm ${state === "todo" ? "text-muted" : "text-ink"}`}>
              <span className="hidden sm:inline">{n}. </span>
              {label}
              {state === "done" && <span className="sr-only"> (completed)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Page frame for a step in the applicant profile journey. */
export function StepPage({ step, title, intro, children }: { step: 1 | 2 | 3; title: string; intro: string; children: React.ReactNode }) {
  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <Stepper current={step} />
      <Heading as="h1" size="title" className="mt-10">
        {title}
      </Heading>
      <Lead className="mt-3">{intro}</Lead>
      <div className="mt-10">{children}</div>
    </Container>
  );
}

/** Page frame for single pages outside the stepped journey. */
export function SimplePage({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <Heading as="h1" size="title">
        {title}
      </Heading>
      {intro && <Lead className="mt-4">{intro}</Lead>}
      <div className="mt-10">{children}</div>
    </Container>
  );
}
