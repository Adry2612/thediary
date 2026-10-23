import type { ReactNode } from "react";

type Variant = "dashed" | "plain";
type Element = "div" | "section" | "p";
type Size = "default" | "compact";

interface EmptyStateProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: Variant;
  size?: Size;
  as?: Element;
  className?: string;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  dashed: "border border-dashed border-line",
  plain: "",
};

const titleClasses: Record<Size, string> = {
  default: "font-sans text-2xl font-semibold",
  compact: "text-lg font-semibold text-ink",
};

const descriptionClasses: Record<Size, string> = {
  default: "mx-auto mt-2 max-w-lg text-sm text-muted",
  compact: "mt-2 text-sm text-muted",
};

const actionClasses: Record<Size, string> = {
  default: "mt-6",
  compact: "mt-4",
};

/**
 * Hueco de una lista vacía. La caja solo aporta el borde discontinuo: el radio,
 * el relleno y la alineación cambian en cada sitio y llegan por `className`.
 * `size="compact"` es la variante de las listas que ya tenían su propio bloque
 * separador (biblioteca de grabaciones).
 */
export function EmptyState({
  title,
  description,
  action,
  variant = "dashed",
  size = "default",
  as = "div",
  className = "",
  children,
}: EmptyStateProps) {
  const Component = as;

  return (
    <Component className={`${variants[variant]} ${className}`}>
      {title ? <h2 className={titleClasses[size]}>{title}</h2> : null}
      {description ? (
        <p className={descriptionClasses[size]}>{description}</p>
      ) : null}
      {children}
      {action ? <div className={actionClasses[size]}>{action}</div> : null}
    </Component>
  );
}
