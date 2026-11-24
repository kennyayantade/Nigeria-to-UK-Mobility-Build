import { Heading } from "@/components/ui/Heading";

export interface RouteStep {
  title: string;
  body: string;
}

/**
 * A real sequence, drawn as stops on one route line:
 * vertical on small screens, horizontal from md up.
 */
export function RouteSteps({ steps }: { steps: RouteStep[] }) {
  return (
    <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
      <span aria-hidden="true" className="absolute bottom-6 left-5 top-6 w-0.5 bg-brand-gradient md:bottom-auto md:left-5 md:right-[calc(33%-1.25rem)] md:top-5 md:h-0.5 md:w-auto" />
      {steps.map((step, i) => (
        <li key={step.title} className="relative grid grid-cols-[2.5rem_1fr] gap-4 md:grid-cols-1">
          <span className="relative z-10 grid size-10 place-items-center rounded-full border-2 border-brand-blue bg-paper text-sm font-bold text-brand-blue">
            {i + 1}
          </span>
          <div>
            <Heading as="h3" size="subheading">
              {step.title}
            </Heading>
            <p className="mt-2 max-w-[38ch] text-muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
