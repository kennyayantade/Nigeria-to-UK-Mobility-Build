import Image, { type StaticImageData } from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Heading, Lead } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

const stagger = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;


export function Hero({
  title,
  lead,
  actions,
  facts,
  image,
  badge,
  overlay,
}: {
  title: ReactNode;
  lead: ReactNode;
  actions: ReactNode;
  facts: string[];
  image: { src: string | StaticImageData; alt: string; focus?: string };
  badge?: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden pb-20 pt-10 sm:pt-14 lg:pb-32 lg:pt-20">
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14 xl:gap-20">
        <div className="max-w-[36rem]">
          <Heading as="h1" size="display" id="hero-title" className="animate-rise delay-var">
            {title}
          </Heading>
          <div className="mt-6 animate-rise delay-var" style={stagger(120)}>
            <Lead>{lead}</Lead>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3 animate-rise delay-var" style={stagger(240)}>
            {actions}
          </div>
          <ul className="mt-9 grid gap-2.5 text-sm text-muted animate-rise delay-var sm:flex sm:flex-wrap sm:gap-x-6" style={stagger(360)}>
            {facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-brand-blue-50 text-brand-blue">
                  <Icon name="check" className="size-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:ml-6">
          <span aria-hidden="true" className="absolute inset-0 hidden translate-x-5 translate-y-5 rounded-[var(--radius-frame)] bg-brand-blue-50 sm:block" />

          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-frame)] bg-surface lg:aspect-[5/4]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              quality={90}
              sizes="(min-width: 1280px) 860px, (min-width: 1024px) 70vw, 140vw"
              className="animate-settle object-cover"
              style={{ objectPosition: image.focus ?? "center" }}
            />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5 bg-brand-gradient" />
          </div>

          {badge && (
            <div className="absolute right-4 top-4 animate-rise delay-var sm:right-6 sm:top-6" style={stagger(500)}>
              {badge}
            </div>
          )}

          {overlay && (
            <div
              className="relative z-10 mx-auto -mt-12 max-w-sm px-4 animate-rise delay-var sm:-mt-16 lg:absolute lg:-bottom-14 lg:-left-10 lg:mx-0 lg:mt-0 lg:w-[17.5rem] lg:max-w-none lg:px-0"
              style={stagger(650)}
            >
              {overlay}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function RouteChip({ from, to }: { from: string; to: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full bg-paper px-4 py-2 text-xs font-semibold shadow-float">
      {from}
      <span aria-hidden="true" className="flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-brand-blue" />
        <span className="w-6 border-t-2 border-dotted border-brand-purple/60" />
        <span className="size-1.5 rounded-full bg-brand-purple" />
      </span>
      <span className="sr-only">to</span>
      {to}
    </span>
  );
}