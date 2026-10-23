import type { AnchorHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "ghost";

interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: Variant;
}

/**
 * Una llamada a la acción que navega. Reutiliza el alto y el relleno de los
 * enlaces del proyecto, que no son los de `Button`: aquí el botón no tiene
 * estados deshabilitados y su feedback es `opacity`, no un cambio de fondo.
 */
const baseStyles =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60";

const variants: Record<Variant, string> = {
  primary: "bg-ink font-medium text-canvas hover:opacity-90",
  ghost: "border border-line text-ink hover:bg-white/5",
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      {...props}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    />
  );
}
