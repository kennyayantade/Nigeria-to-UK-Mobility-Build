"use client";

/** A02 — Adult gate and notice. No date of birth is collected in the pilot. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Choice, ErrorSummary, Fieldset } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { SimplePage } from "@/features/diagnostic/Stepper";

export default function AdultGatePage() {
  const router = useRouter();
  const { update } = useDiagnostic();
  const [answer, setAnswer] = useState<"adult" | "minor" | null>(null);
  const [error, setError] = useState<string | undefined>();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (answer === null) {
      setError("Select whether you are 18 or over.");
      return;
    }
    if (answer === "minor") {
      update((d) => ({ ...d, adultConfirmed: false }));
      router.push("/under-18");
      return;
    }
    update((d) => ({ ...d, adultConfirmed: true }));
    router.push("/profile/qualifications");
  }

  return (
    <SimplePage
      title="Before you start"
      intro="This service is for adults (18 and over) exploring UK study from Nigeria. Your answers are only used to run this comparison and aren't saved unless you later create an account."
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-6">
        {error && <ErrorSummary errors={{ age: error }} />}
        <Fieldset id="age" legend="Are you 18 or over?" error={error}>
          <Choice type="radio" name="age" value="adult" label="Yes, I am 18 or over" checked={answer === "adult"} onChange={() => { setAnswer("adult"); setError(undefined); }} />
          <Choice type="radio" name="age" value="minor" label="No, I am under 18" checked={answer === "minor"} onChange={() => { setAnswer("minor"); setError(undefined); }} />
        </Fieldset>

        <Notice title="How we use your answers">
          We compare your answers with reviewed course information. Nothing is sent to universities, and no one contacts you unless you ask for help.
          You can read the privacy notice at any time.
        </Notice>

        <div>
          <Button type="submit" size="lg">
            Continue
          </Button>
        </div>
      </form>
    </SimplePage>
  );
}
