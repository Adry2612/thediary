import type { MouseEvent, ReactNode, Ref, SyntheticEvent } from "react";

type Variant = "md" | "lg" | "wide" | "confirm";

interface ModalDialogProps {
  /** Ref del `<dialog>`; lo entrega `useDialogModal`. */
  dialogRef?: Ref<HTMLDialogElement>;
  labelledBy?: string;
  open?: boolean;
  /** Añade la animación de salida antes de que el `<dialog>` se cierre. */
  isClosing?: boolean;
  variant?: Variant;
  className?: string;
  onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;
  onClose?: () => void;
  onMouseDown?: (event: MouseEvent<HTMLDialogElement>) => void;
  children: ReactNode;
}

const baseStyles =
  "overlay-motion m-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70";

const variants: Record<Variant, string> = {
  md: "w-[calc(100%-2rem)] max-w-md",
  lg: "max-h-[calc(90dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-[calc(100%-2rem)] max-w-lg overflow-y-auto",
  wide: "max-h-[calc(90dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto",
  confirm:
    "fixed inset-0 w-[calc(100%-2rem)] max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
};

/**
 * Cáscara de un `<dialog>` nativo. No abre ni cierra: eso lo hace
 * `useDialogModal` sobre la ref, y así el componente sigue siendo válido en un
 * componente de servidor.
 */
export function ModalDialog({
  dialogRef,
  labelledBy,
  open,
  isClosing = false,
  variant = "md",
  className = "",
  onCancel,
  onClose,
  onMouseDown,
  children,
}: ModalDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      open={open}
      data-closing={isClosing ? "true" : undefined}
      onCancel={onCancel}
      onClose={onClose}
      onMouseDown={onMouseDown}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </dialog>
  );
}
