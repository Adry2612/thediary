import type { ReactNode } from "react";

interface RemovableChipProps {
  children: ReactNode;
  onRemove: () => void;
  /** Nombre accesible del botón de borrado. */
  removeAriaLabel: string;
  /** `×` por defecto; el editor de materiales usa la palabra "Quitar". */
  removeLabel?: ReactNode;
  className?: string;
  removeClassName?: string;
}

/**
 * Fila borrable de una lista corta (ejercicios, materiales). La caja solo fija
 * el borde y el reparto; relleno, separación y tipografía llegan del sitio.
 */
export function RemovableChip({
  children,
  onRemove,
  removeAriaLabel,
  removeLabel = "×",
  className = "",
  removeClassName = "",
}: RemovableChipProps) {
  return (
    <li className={`flex items-center border border-line ${className}`}>
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeAriaLabel}
        className={`text-muted hover:text-ink ${removeClassName}`}
      >
        {removeLabel}
      </button>
    </li>
  );
}

interface ChipListProps {
  /** `wrap` reparte en varias líneas; `stack` apila una por fila. */
  layout?: "wrap" | "stack";
  className?: string;
  children: ReactNode;
}

export function ChipList({
  layout = "wrap",
  className = "",
  children,
}: ChipListProps) {
  return (
    <ul
      className={`${layout === "wrap" ? "flex flex-wrap gap-2" : "space-y-2"} ${className}`}
    >
      {children}
    </ul>
  );
}
