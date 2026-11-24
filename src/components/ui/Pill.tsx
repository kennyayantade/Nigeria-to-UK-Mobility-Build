import type { ReactNode } from "react";


export function Pill({ className = "bg-surface text-muted", children }: { className?: string; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}