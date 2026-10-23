import type { ReactNode } from "react";

interface ToggleGroupProps {
  "aria-label": string;
  layout?: "wrap" | "row";
  className?: string;
  children: ReactNode;
}

/** Agrupa pastillas y les da un nombre accesible; el espacio lo pone el sitio. */
export function ToggleGroup({
  "aria-label": ariaLabel,
  layout = "wrap",
  className = "",
  children,
}: ToggleGroupProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex ${layout === "wrap" ? "flex-wrap" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
