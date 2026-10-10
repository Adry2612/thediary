import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";
type Size = "default" | "field";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:bg-white",
  ghost: "border border-line text-ink hover:bg-white/5",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium tracking-wide transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "ghost",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`${baseStyles} ${size === "field" ? "h-11 px-3 sm:h-12 sm:px-4" : "h-12 min-w-12 px-4 sm:h-14 sm:min-w-14 sm:px-6"} ${variants[variant]} ${className}`}
    />
  );
}
