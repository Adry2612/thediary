import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

const sharedFieldClasses =
  "w-full rounded-md border border-line bg-canvas px-4 text-sm text-ink transition-colors duration-200 placeholder:text-muted/70 hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg disabled:cursor-not-allowed disabled:opacity-50";

export function TextField({
  className = "",
  type,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type={type}
      className={`h-12 min-w-0 ${sharedFieldClasses} ${type === "number" ? "font-mono" : ""} ${className}`}
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

type FormMessageTone = "error" | "success";

interface FormMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: FormMessageTone;
}

const formMessageTones: Record<FormMessageTone, string> = {
  error: "text-sm text-red-300",
  success: "text-sm text-accent-green-fg",
};

/**
 * Aviso de un formulario. Un error se anuncia de inmediato (`alert`); una
 * confirmación espera al lector (`status`).
 */
export function FormMessage({
  tone = "error",
  className = "",
  ...props
}: FormMessageProps) {
  return (
    <p
      {...props}
      role={tone === "error" ? "alert" : "status"}
      className={`${formMessageTones[tone]} ${className}`}
    />
  );
}

interface FieldProps {
  label: ReactNode;
  htmlFor: string;
  error?: string | null;
  className?: string;
  children: ReactNode;
}

/** Etiqueta, control y ranura de error con la misma separación en todo el app. */
export function Field({
  label,
  htmlFor,
  error,
  className = "",
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <FormMessage tone="error" className="mt-2">
          {error}
        </FormMessage>
      ) : null}
    </div>
  );
}
