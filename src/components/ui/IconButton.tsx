import type { ComponentPropsWithRef, ReactNode } from "react";

type Variant = "bordered" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface IconButtonProps
  extends Omit<ComponentPropsWithRef<"button">, "aria-label" | "children"> {
  /** Un botón de solo icono no tiene texto visible: el nombre es obligatorio. */
  "aria-label": string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

/**
 * Base común de los controles cuadrados de icono. No fija radio, color de texto
 * ni color de foco: los seis lugares que lo usan no coinciden en eso, y esas
 * clases llegan por `className` desde cada sitio.
 */
const baseStyles =
  "inline-flex items-center justify-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  bordered: "border border-line hover:bg-white/5 hover:text-ink",
  ghost: "hover:bg-white/10",
  danger:
    "text-red-300 hover:bg-red-400/10 hover:text-red-200 focus-visible:outline-red-300",
};

const sizeStyles: Record<Size, string> = {
  sm: "size-9",
  md: "size-10",
  lg: "size-11",
};

export function IconButton({
  variant = "bordered",
  size = "md",
  type = "button",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
    />
  );
}
