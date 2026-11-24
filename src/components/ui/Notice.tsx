import type { ReactNode } from "react";

export function Notice({ title, children, tone = "info" }: { title?: string; children: ReactNode; tone?: "info" | "warning" }) {
  const cls = tone === "warning" ? "border-status-unknown bg-status-unknown-bg" : "border-brand-blue/20 bg-brand-blue-50";
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 text-sm ${cls}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}
