import { Section } from "@/components/layout/Section";
import { CtaBand } from "@/components/marketing/CtaBand";
import { EvidencePreview } from "@/components/marketing/EvidencePreview";
import { Hero, RouteChip } from "@/components/marketing/Hero";
import { InfoColumns } from "@/components/marketing/InfoColumns";
import { RouteSteps } from "@/components/marketing/RouteSteps";
import { ButtonLink } from "@/components/ui/Button";
import { Heading, Lead } from "@/components/ui/Heading";
import { getCatalogueRepository } from "@/server/catalogue/repository";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Tell us about your education",
    body: "Enter your result exactly as it appears, in CGPA, degree class or percentage. Waiting for results is fine.",
  },
  {
    title: "See courses with the evidence",
    body: "Every course shows which requirements you meet, which you don't, and which still need checking, with the date each fact was reviewed.",
  },
  {
    title: "Talk to an adviser when you're ready",
    body: "Ask for help from a named adviser who can clarify unknowns and plan your next step with you.",
  },
];

export default async function LandingPage() {
  const coverage = await getCatalogueRepository().coverage(new Date());
  const reviewed = new Date(coverage.asOf).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
            <Hero
        title="UK study, matched to the grades you actually have."
        lead="Enter your Nigerian results as they are. We check them against reviewed UK course requirements and show you what's met, what isn't, and what still needs confirming."
        actions={
          <>
            <ButtonLink href="/start" size="lg">
              Start free comparison
            </ButtonLink>
            <ButtonLink href="/#how-it-works" size="lg" variant="ghost">
              See how it works
            </ButtonLink>
          </>
        }
        facts={["Takes about 5 minutes", "No account needed", "For applicants 18 and over"]}
        image={{
          src: "/images/hero-student-london.jpg",
          alt: "A young woman smiling as she takes a selfie in front of Tower Bridge in London",
          focus: "62% 40%",
        }}
        badge={<RouteChip from="Lagos" to="London" />}
        overlay={
          <EvidencePreview
            caption="Example result"
            institution="Northbridge University"
            programme="MSc Applied Computing"
            rows={[
              { label: "Grade", value: "4.2 on a 5.0 CGPA scale", outcome: "MET" },
              { label: "Subject", value: "Computer Science", outcome: "MET" },
              { label: "English", value: "Not confirmed yet", outcome: "UNKNOWN" },
              { label: "Tuition", value: "£20,500 a year, within budget", outcome: "MET" },
            ]}
          />
        }
      />

      <Section id="how-it-works" tone="surface" labelledBy="how-title">
        <div className="max-w-2xl">
          <Heading size="title" id="how-title">
            From your results to a shortlist you can trust
          </Heading>
          <Lead className="mt-4">
            Coverage today: {coverage.activeIntakes} reviewed course intakes from {coverage.institutions} UK institutions, last reviewed {reviewed}.
          </Lead>
        </div>
        <div className="mt-12 sm:mt-16">
          <RouteSteps steps={STEPS} />
        </div>
      </Section>

      <Section id="whats-free" labelledBy="free-title">
        <Heading size="title" id="free-title" className="max-w-[20ch]">
          Clear about cost, clear about limits
        </Heading>
        <div className="mt-12">
          <InfoColumns
            items={[
              {
                icon: "graduation",
                title: "Free to compare, save and ask",
                body: "Comparing courses, saving a shortlist and asking an adviser for education help cost nothing. Optional paid services always show their full price and terms before you agree, and paying never changes your results.",
              },
              {
                icon: "scale",
                title: "A comparison, not a decision",
                body: "Results show how your answers line up with reviewed course information. They aren't an admission offer or a visa decision, and when something is unknown or out of date, we tell you.",
              },
            ]}
          />
        </div>
      </Section>

      <CtaBand
        title="See where you stand in five minutes"
        body="No account, no documents. Just your results, your budget and where you'd like to study."
        action={
          <ButtonLink href="/start" size="lg" variant="inverse">
            Start free comparison
          </ButtonLink>
        }
      />
    </>
  );
}
