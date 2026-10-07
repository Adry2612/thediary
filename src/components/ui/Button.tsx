import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:bg-white",
  ghost: "border border-line text-ink hover:bg-white/5",
};

export function Button({
  variant = "ghost",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium tracking-wide transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 ${variants[variant]} ${className}`}
    />
  );
}
