import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={`rounded-xl border border-line bg-surface p-8 sm:p-10 ${className}`}
    />
  );
}
