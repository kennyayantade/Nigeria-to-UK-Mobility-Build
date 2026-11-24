"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useDiagnostic } from "@/features/diagnostic/DiagnosticProvider";
import { Container } from "./Container";

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#whats-free", label: "What's free" },
] as const;


export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="All-Encompassing Global Consult, home">
      <Image src="/aegc-logo.png" alt="" width={214} height={42} priority className="h-8 w-auto sm:h-10" />
    </Link>
  );
}

function ShortlistLink({ count, className }: { count: number; className: string }) {
  return (
    <Link href="/shortlist" className={`inline-flex items-center gap-2 ${className}`}>
      <Icon name="bookmark" filled={count > 0} className="size-4 text-brand-purple" />
      Shortlist
      {count > 0 && (
        <span className="rounded-full bg-brand-purple px-2 py-0.5 text-xs font-semibold text-paper">
          {count}
          <span className="sr-only"> saved</span>
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { shortlist } = useDiagnostic();


  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
          <ShortlistLink count={shortlist.length} className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink" />
          <ButtonLink href="/start" className="ml-2">
            Start comparison
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} className="size-6" />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </Container>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="animate-drop border-t border-line bg-paper md:hidden">
          <Container className="grid gap-1 py-4">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-3 text-base font-medium hover:bg-surface" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <ShortlistLink count={shortlist.length} className="rounded-xl px-3 py-3 text-base font-medium hover:bg-surface" />
            <ButtonLink href="/start" size="lg" className="mt-2 w-full">
              Start comparison
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}