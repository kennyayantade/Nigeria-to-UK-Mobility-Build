import type { ElementType, ReactNode } from "react";

type Size = "display" | "title" | "heading" | "subheading";

const sizes: Record<Size, string> = {
  display: "text-display text-balance",
  title: "text-title text-balance",
  heading: "text-2xl font-bold tracking-tight sm:text-3xl",
  subheading: "text-lg font-semibold tracking-tight",
};

/** Semantic level (`as`) is independent of visual size, so outline order never bends to styling. */
export function Heading({
  as = "h2",
  size = "heading",
  id,
  className = "",
  children,
}: {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: Size;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const Tag = as as ElementType;
  return (
    <Tag id={id} className={`${sizes[size]} ${className}`}>
      {children}
    </Tag>
  );
}

export function Lead({ className = "", children }: { className?: string; children: ReactNode }) {
  return <p className={`text-lead max-w-[62ch] text-pretty text-muted ${className}`}>{children}</p>;
}
