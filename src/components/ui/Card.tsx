import type { ElementType, ReactNode } from "react";

type Variant = "outline" | "surface" | "float";

const variants: Record<Variant, string> = {
  outline: "border border-line bg-paper",
  surface: "bg-surface",
  float: "bg-paper/95 shadow-float ring-1 ring-black/5 backdrop-blur",
};

export function Card({
  as = "div",
  variant = "outline",
  className = "",
  children,
}: {
  as?: "div" | "li" | "article" | "section" | "aside";
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  const Tag = as as ElementType;
  return <Tag className={`rounded-2xl p-5 sm:p-6 ${variants[variant]} ${className}`}>{children}</Tag>;
}
