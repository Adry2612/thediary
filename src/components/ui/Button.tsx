import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "icon" | "link" | "danger";
type Size = "default" | "field" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Contorno neutro que comparten los botones fantasma y los de solo icono. */
const outlineStyles = "border border-line text-ink hover:bg-white/5";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:bg-white",
  ghost: outlineStyles,
  icon: outlineStyles,
  link: "text-muted underline underline-offset-4 hover:text-ink",
  danger:
    "border border-red-400/40 text-red-300 hover:border-red-400/70 hover:bg-red-500/10 focus-visible:outline-red-400",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium tracking-wide transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Un enlace de texto no es un botón con otra ropa: no lleva alto fijo, relleno,
 * borde ni micro-animación. Por eso tiene su propia base en vez de anular la de
 * `Button`.
 */
const linkStyles =
  "inline-flex items-center gap-2 text-muted underline underline-offset-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 disabled:cursor-not-allowed disabled:opacity-50";

const sizeStyles: Record<Size, string> = {
  default: "h-12 min-w-12 px-4 sm:h-14 sm:min-w-14 sm:px-6",
  field: "h-11 px-3 sm:h-12 sm:px-4",
  icon: "size-11",
};

/** Botón cuadrado: conserva el alto del tamaño elegido y anula el relleno. */
const iconSizeStyles: Record<Exclude<Size, "icon">, string> = {
  default: "h-12 min-w-12 sm:h-14 sm:min-w-14",
  field: "h-11 sm:h-12",
};

/** En un enlace, el tamaño elige el cuerpo del texto. */
const linkSizeStyles: Record<Size, string> = {
  default: "text-sm",
  field: "text-xs",
  icon: "text-sm",
};

export function Button({
  variant = "ghost",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const isLink = variant === "link";
  const isIcon = variant === "icon";

  const sizeClass = isLink
    ? linkSizeStyles[size]
    : isIcon
      ? size === "icon"
        ? sizeStyles.icon
        : iconSizeStyles[size]
      : sizeStyles[size];

  return (
    <button
      {...props}
      className={`${isLink ? linkStyles : baseStyles} ${sizeClass} ${variants[variant]} ${className}`}
    />
  );
}
