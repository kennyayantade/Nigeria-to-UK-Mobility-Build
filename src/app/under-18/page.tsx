/** A02 safe exit for under-18 visitors. No details are collected or stored. */
import { ButtonLink } from "@/components/ui/Button";
import { SimplePage } from "@/features/diagnostic/Stepper";

export const metadata = { title: "Service for adults" };

export default function Under18Page() {
  return (
    <SimplePage
      title="This service is for adults right now"
      intro="Our current pilot is only for people aged 18 and over, so we can't run a comparison for you yet. We haven't saved any of your answers."
    >
      <p className="max-w-[60ch] text-muted">
        A parent, guardian or school counsellor can help you explore UK study. The official UCAS and UK university websites are good places to start.
      </p>
      <ButtonLink href="/" variant="secondary" size="lg" className="mt-8">
        Back to home
      </ButtonLink>
    </SimplePage>
  );
}
