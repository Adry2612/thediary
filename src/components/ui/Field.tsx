import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
} from "react";

/*
 * Los controles de texto se quedan en 16 px en cualquier ancho: por debajo de
 * esa medida los navegadores móviles amplían la página al enfocar el campo,
 * incluso en horizontal, donde ya se aplican los estilos de escritorio.
 */
const sharedFieldClasses =
  "w-full rounded-md border border-line bg-canvas px-4 text-base text-ink transition-colors duration-200 placeholder:text-muted/70 hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg disabled:cursor-not-allowed disabled:opacity-50";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Permite enfocar el campo desde un diálogo sin exponer un `forwardRef`. */
  inputRef?: Ref<HTMLInputElement>;
};

export function TextField({
  className = "",
  type,
  inputRef,
  ...props
}: TextFieldProps) {
  return (
    <input
      {...props}
      ref={inputRef}
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
