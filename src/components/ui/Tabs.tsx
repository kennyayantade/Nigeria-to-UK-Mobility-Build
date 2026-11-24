"use client";

import type { KeyboardEvent, ReactNode } from "react";

export interface TabItem<K extends string> {
  key: K;
  label: string;
  count?: number;
}



export function Tabs<K extends string>({
  idPrefix,
  label,
  items,
  value,
  onChange,
}: {
  idPrefix: string;
  label: string;
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((i) => i.key === value);
    const last = items.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    const target = items[next];
    if (!target) return;
    onChange(target.key);
    document.getElementById(`${idPrefix}-tab-${target.key}`)?.focus();
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1">
      {items.map((item) => {
        const selected = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.key}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.key)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              selected ? "bg-paper text-ink shadow-sm ring-1 ring-black/5" : "text-muted hover:text-ink"
            }`}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${selected ? "bg-brand-blue text-paper" : "bg-line text-muted"}`}>{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ idPrefix, activeKey, children }: { idPrefix: string; activeKey: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel`} aria-labelledby={`${idPrefix}-tab-${activeKey}`} tabIndex={0} className="focus-visible:outline-offset-8">
      {children}
    </div>
  );
}