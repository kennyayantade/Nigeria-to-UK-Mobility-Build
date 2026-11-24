const paths = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  close: "M6 6l12 12M18 6L6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  question: "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01",
  minus: "M6 12h12",
  graduation: "M2 9l10-5 10 5-10 5L2 9zm4 2.2V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-4.8M22 9v6",
  scale: "M12 3v18M7 21h10M4 7h16M6 7l-3 7a3.5 3.5 0 0 0 6 0L6 7zm12 0l-3 7a3.5 3.5 0 0 0 6 0l-3-7z",
  people: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm13 9v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  bookmark: "M6.5 4h11a1 1 0 0 1 1 1v15.5L12 16.5l-6.5 4V5a1 1 0 0 1 1-1z",
  columns: "M4 5h6.5v14H4zM13.5 5H20v14h-6.5z",
  alert: "M12 9v4M12 17h.01M10.3 3.9L2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5", label, filled = false }: { name: IconName; className?: string; label?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={paths[name]} />
    </svg>
  );
}