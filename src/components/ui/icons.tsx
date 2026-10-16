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

export function SplitViewIcon({ className, ...props }: IconProps) {
  return (
    <StrokeIcon className={className} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M12 4v16" />
    </StrokeIcon>
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
