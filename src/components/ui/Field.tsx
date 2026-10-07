import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const sharedFieldClasses =
  "w-full rounded-md border border-line bg-canvas px-4 text-sm text-ink transition-colors duration-200 placeholder:text-muted/70 hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg disabled:cursor-not-allowed disabled:opacity-50";

export function TextField({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 min-w-0 ${sharedFieldClasses} ${className}`}
    />
  );
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 resize-y py-3 leading-relaxed ${sharedFieldClasses} ${className}`}
    />
  );
}
