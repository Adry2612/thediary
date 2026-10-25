import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

function StrokeIcon({
  className = "size-5",
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function EditIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
    </StrokeIcon>
  );
}

export function TrashIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </StrokeIcon>
  );
}

export function ArrowLeftIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </StrokeIcon>
  );
}

export function SplitViewIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M12 4v16" />
    </StrokeIcon>
  );
}

export function PlusIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <path d="M12 5v14M5 12h14" />
    </StrokeIcon>
  );
}

/** Nota musical: relleno de las carátulas que faltan. */
export function MusicNoteIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </StrokeIcon>
  );
}

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </StrokeIcon>
  );
}

/**
 * Chevron relleno de las secciones plegables. Gira con `open`, que es estado de
 * la sección y no del icono; en un `<details>` el giro lo pone `group-open`.
 */
export function ChevronIcon({
  open = false,
  className = "",
}: {
  open?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""} ${className}`}
    >
      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
    </svg>
  );
}

/** Flecha fina de navegación entre periodos de los calendarios. */
export function ChevronLeftIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={16}
      height={16}
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="m12.5 4.5-5 5.5 5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={16}
      height={16}
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="m7.5 4.5 5 5.5-5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SettingsIcon({ className = "size-5", ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      {...props}
    >
      <path
        d="M10.4 3.5h3.2l.5 2.1a6.9 6.9 0 0 1 1.5.9l2.1-.6 1.6 2.8-1.6 1.5a7 7 0 0 1 0 1.8l1.6 1.5-1.6 2.8-2.1-.6a6.9 6.9 0 0 1-1.5.9l-.5 2.1h-3.2l-.5-2.1a6.9 6.9 0 0 1-1.5-.9l-2.1.6-1.6-2.8 1.6-1.5a7 7 0 0 1 0-1.8L4.7 8.7l1.6-2.8 2.1.6a6.9 6.9 0 0 1 1.5-.9l.5-2.1Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <circle
        cx={12}
        cy={11.5}
        r={2.5}
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/** Papelera compacta de las filas de lista; `TrashIcon` es la de tamaño grande. */
export function DeleteIcon({ className = "size-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M5 7h14m-9 4v6m4-6v6M9 7V5.5h6V7m-8 0 .8 12h8.4L17 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function PlayIcon({ className = "size-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M4 2.5 13 8l-9 5.5z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon({ className = "size-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
    </svg>
  );
}

export function StopIcon({ className = "size-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="currentColor" />
    </svg>
  );
}

export function GoogleDriveIcon({ className = "size-5", ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 87.3 78"
      className={className}
      {...props}
    >
      <path
        d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      <path
        d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
        fill="#00ac47"
      />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path
        d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
        fill="#00832d"
      />
      <path
        d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
        fill="#2684fc"
      />
      <path
        d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  );
}

export function OneDriveIcon({ className = "size-5", ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <path
        d="M19.35 10.04A7.49 7.49 0 0 0 12 4a7.48 7.48 0 0 0-6.65 4.04A5.99 5.99 0 0 0 0 14a6 6 0 0 0 6 6h13a5 5 0 0 0 .35-9.96Z"
        fill="#0078d4"
      />
    </svg>
  );
}

export function CloudSyncProviderIcon({
  provider,
  className = "size-5",
}: {
  provider: "google-drive" | "onedrive";
  className?: string;
}) {
  return provider === "google-drive" ?
      <GoogleDriveIcon className={className} />
    : <OneDriveIcon className={className} />;
}
