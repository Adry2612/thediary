import type { TabPaletteGroup } from "@/utils/tab-score/palette";

/**
 * Icono de una opción de la paleta. El catálogo no guarda un icono por opción:
 * se dibuja a partir de su id, y si la opción es nueva y aún no tiene uno, se
 * usa el icono de su grupo. Todos son decorativos: el nombre accesible lo pone
 * el botón.
 */
export function TabPaletteIcon({
  id,
  group,
}: {
  id: string;
  group: TabPaletteGroup;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {content(id, group)}
    </svg>
  );
}

function glyph(text: string, size = 10) {
  return (
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize={size}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fill="currentColor"
      stroke="none"
    >
      {text}
    </text>
  );
}

function note({
  hollow = false,
  stem = true,
  flags = 0,
  dot = false,
  x = 8,
}: {
  hollow?: boolean;
  stem?: boolean;
  flags?: number;
  dot?: boolean;
  x?: number;
}) {
  return (
    <>
      <ellipse
        cx={x}
        cy="17"
        rx="3.8"
        ry="2.3"
        transform={`rotate(-18 ${x} 17)`}
        fill={hollow ? "none" : "currentColor"}
      />
      {stem && <path d={`M${x + 3.4} 17V4`} />}
      {Array.from({ length: flags }, (_, index) => (
        <path
          key={index}
          d={`M${x + 3.4} ${5 + index * 3}c3.1 1 4.1 3.2 3.1 5.6`}
        />
      ))}
      {dot && (
        <circle cx={x + 6.4} cy="17" r="1.2" fill="currentColor" stroke="none" />
      )}
    </>
  );
}

const BEND_LABELS: Record<string, string> = {
  "bend-0.25": "¼",
  "bend-0.5": "½",
  "bend-1": "1",
  "bend-1.5": "1½",
  "bend-2": "2",
};

const TRASH = (
  <>
    <path d="M4 6h16" />
    <path d="M9 6V4h6v2" />
    <path d="M18 6l-1 14H7L6 6" />
  </>
);

function content(id: string, group: TabPaletteGroup) {
  switch (id) {
    case "duration-1":
      return note({ hollow: true, stem: false });
    case "duration-2":
      return note({ hollow: true });
    case "duration-4":
      return note({});
    case "duration-8":
      return note({ flags: 1 });
    case "duration-16":
      return note({ flags: 2 });
    case "duration-32":
      return note({ flags: 3 });
    case "duration-64":
      return note({ flags: 4 });
    case "dots":
      return note({ dot: true });
    case "tuplet":
      return (
        <>
          {glyph("3")}
          <path d="M5 5h14" />
          <path d="M5 5v4M19 5v4" />
        </>
      );
    case "rest":
      return (
        <>
          <path d="M9 5c0 3 6 3 6 6s-5 2-5 4 4 2 4 4" />
          <path d="M9 19h6" />
        </>
      );
    case "split-beat":
      return (
        <>
          <path d="M12 3v18" />
          <ellipse cx="5" cy="16" rx="2.4" ry="1.8" fill="currentColor" />
          <path d="M7.4 16V7" />
          <ellipse cx="16.6" cy="16" rx="2.4" ry="1.8" fill="currentColor" />
          <path d="M19 16V7" />
        </>
      );
    case "tie":
      return (
        <>
          <ellipse cx="6" cy="16" rx="2.6" ry="1.9" fill="currentColor" />
          <ellipse cx="17" cy="16" rx="2.6" ry="1.9" fill="currentColor" />
          <path d="M5 12c3 4 9 4 13 0" />
        </>
      );
    case "legato-hammer":
      return glyph("H");
    case "legato-pull":
      return glyph("P");
    case "slide-up":
      return (
        <>
          <ellipse cx="6" cy="18" rx="2.6" ry="1.9" fill="currentColor" />
          <ellipse cx="17" cy="8" rx="2.6" ry="1.9" fill="currentColor" />
          <path d="M8 16 15 10" />
        </>
      );
    case "slide-down":
      return (
        <>
          <ellipse cx="6" cy="7" rx="2.6" ry="1.9" fill="currentColor" />
          <ellipse cx="17" cy="17" rx="2.6" ry="1.9" fill="currentColor" />
          <path d="M8 9 15 15" />
        </>
      );
    case "slide-position":
      return (
        <>
          <ellipse cx="6" cy="18" rx="2.6" ry="1.9" fill="currentColor" />
          <ellipse cx="17" cy="8" rx="2.6" ry="1.9" fill="currentColor" />
          <path d="M8 16 15 10" strokeDasharray="2 2" />
        </>
      );
    case "vibrato-slight":
      return <path d="M4 12c1.5-2.5 3-2.5 4.5 0s3 2.5 4.5 0 3-2.5 4.5 0 2 2.5 2 2.5" />;
    case "vibrato-wide":
      return <path d="M4 12c1.5-4.5 3-4.5 4.5 0s3 4.5 4.5 0 3-4.5 4.5 0 2 4.5 2 4.5" />;
    case "palm-mute":
      return glyph("PM", 8);
    case "let-ring":
      return (
        <>
          <circle cx="12" cy="12" r="6.5" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </>
      );
    case "tapping":
      return glyph("T");
    case "harmonic-natural":
      return <path d="M12 5l5 7-5 7-5-7z" />;
    case "harmonic-artificial":
      return (
        <>
          <path d="M11 5l5 7-5 7-5-7z" />
          {glyph("A", 7)}
        </>
      );
    case "harmonic-pinch":
      return <path d="M12 5l5 7-5 7-5-7z" fill="currentColor" />;
    case "harmonic-tap":
      return (
        <>
          <path d="M11 5l5 7-5 7-5-7z" />
          {glyph("T", 7)}
        </>
      );
    case "dead":
      return (
        <>
          <path d="M9 13l6 6M15 13l-6 6" />
          <path d="M14 13V4" />
        </>
      );
    case "ghost":
      return (
        <>
          <ellipse cx="12" cy="15" rx="2.8" ry="2" fill="currentColor" />
          <path d="M12 12V5" />
          <path d="M6 8c-1 4-1 8 0 12M18 8c1 4 1 8 0 12" />
        </>
      );
    case "tremolo":
      return (
        <>
          <ellipse cx="9" cy="18" rx="2.8" ry="2" fill="currentColor" />
          <path d="M11.8 18V4" />
          <path d="M15 7l-6 3M15 10.5l-6 3M15 14l-6 3" />
        </>
      );
    case "trill":
      return (
        <>
          {glyph("tr", 8)}
          <path d="M4 17c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0" />
        </>
      );
    case "slap":
      return glyph("S");
    case "pop":
      return glyph("P");
    case "accent-normal":
      return <path d="M7 8l7 4-7 4" />;
    case "accent-heavy":
      return <path d="M5 7l7 4-7 4M11 7l7 4-7 4" />;
    case "bend-0.25":
    case "bend-0.5":
    case "bend-1":
    case "bend-1.5":
    case "bend-2": {
      const amount = BEND_LABELS[id] ?? "";
      return (
        <>
          <path d="M6 20c0-7 4-12 10-14" />
          <path d="M12 5l4 1-1 4" />
          <text
            x="10"
            y="12"
            textAnchor="middle"
            fontSize="7"
            fontFamily="ui-monospace, monospace"
            fill="currentColor"
            stroke="none"
          >
            {amount}
          </text>
        </>
      );
    }
    case "bend-release":
      return (
        <>
          <path d="M6 18c0-6 4-10 10-12" />
          <path d="M16 3v6M13 6l3 3 3-3" />
        </>
      );
    case "bend-prebend":
      return (
        <>
          <path d="M8 20V6M5 9l3-3 3 3" />
          {glyph("P", 8)}
        </>
      );
    case "bar-insert":
      return (
        <>
          <rect x="3" y="6" width="10" height="12" rx="1" />
          <path d="M18 7v10M13 12h10" />
        </>
      );
    case "bar-append":
      return (
        <>
          <rect x="3" y="6" width="10" height="12" rx="1" />
          <path d="M18 8v8M14 12h8" />
        </>
      );
    case "bar-duplicate":
      return (
        <>
          <rect x="3" y="8" width="11" height="11" rx="1" />
          <path d="M8 5h12v12" />
        </>
      );
    case "bar-delete":
      return TRASH;
    case "bar-time-signature":
      return glyph("4/4", 9);
    case "bar-tempo":
      return (
        <>
          <path d="M8 18V5l9-2v12" />
          <ellipse cx="5.5" cy="18" rx="2.5" ry="1.8" fill="currentColor" />
          <text
            x="17"
            y="17"
            textAnchor="middle"
            fontSize="6"
            fontFamily="ui-monospace, monospace"
            fill="currentColor"
            stroke="none"
          >
            90
          </text>
        </>
      );
    default:
      return groupIcon(group);
  }
}

function groupIcon(group: TabPaletteGroup) {
  switch (group) {
    case "duration":
      return note({});
    case "rhythm":
      return note({ flags: 1 });
    case "tie":
      return <path d="M4 12c4 6 12 6 16 0" />;
    case "bend":
      return <path d="M6 19c0-7 5-12 12-14M15 4l3 1-1 3" />;
    case "bar":
      return <rect x="4" y="6" width="16" height="12" rx="1" />;
    case "technique":
      return (
        <path d="M12 3l2.4 5.2 5.6.7-4.2 3.9 1.1 5.6-4.9-2.8-4.9 2.8 1.1-5.6L4 8.9l5.6-.7z" />
      );
  }
}
