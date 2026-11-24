import type { ComponentProps, ElementType } from "react";

type Size = "narrow" | "medium" | "default" | "wide";

const widths: Record<Size, string> = {
  narrow: "max-w-2xl",
  medium: "max-w-4xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

/** Horizontal page gutter + max width. Every page and section uses this. */
export function Container({
  as = "div",
  size = "default",
  className = "",
  ...props
}: { as?: "div" | "section" | "nav" | "header" | "footer"; size?: Size } & ComponentProps<"div">) {
  const Tag = as as ElementType;
  return <Tag className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${widths[size]} ${className}`} {...props} />;
}
