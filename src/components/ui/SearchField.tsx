import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { TextField } from "@/components/ui/Field";
import { SearchIcon } from "@/components/ui/icons";

type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className"
> & {
  label: ReactNode;
  /** Ref del input, para enfocar el buscador al abrir un diálogo. */
  inputRef?: Ref<HTMLInputElement>;
  /** Clases extra del input, no del contenedor. */
  className?: string;
};

/**
 * Buscador único de la app: etiqueta visible, lupa decorativa y la misma altura
 * y tipografía que el resto de campos. La etiqueta envuelve al input, así que
 * su nombre accesible es el texto que el usuario lee.
 */
export function SearchField({
  label,
  inputRef,
  className = "",
  ...props
}: SearchFieldProps) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <span className="relative mt-1 block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <TextField
          {...props}
          inputRef={inputRef}
          type="search"
          className={`pl-10 ${className}`}
        />
      </span>
    </label>
  );
}
