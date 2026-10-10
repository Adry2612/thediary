import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  bare?: boolean;
}

export function Card({
  bare = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <section
      {...props}
      className={`${bare ? "" : "rounded-xl border border-line bg-surface p-8 sm:p-10"} ${className}`}
    />
  );
}
