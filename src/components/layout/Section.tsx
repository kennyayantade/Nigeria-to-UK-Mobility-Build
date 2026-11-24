import type { ReactNode } from "react";
import { Container } from "./Container";

type Tone = "paper" | "surface" | "ink";
type Space = "md" | "lg";

const tones: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  surface: "bg-surface text-ink",
  ink: "bg-ink text-paper",
};

const spaces: Record<Space, string> = {
  md: "py-14 sm:py-16",
  lg: "py-16 sm:py-24",
};

/** Full-width band with consistent vertical rhythm. Owns its own padding so sections never double up. */
export function Section({
  id,
  tone = "paper",
  space = "lg",
  size = "default",
  labelledBy,
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  space?: Space;
  size?: "narrow" | "medium" | "default" | "wide";
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${tones[tone]} ${spaces[space]} scroll-mt-20 ${className}`}>
      <Container size={size}>{children}</Container>
    </section>
  );
}
