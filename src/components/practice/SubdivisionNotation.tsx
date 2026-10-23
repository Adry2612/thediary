/** Dónde cae cada nota de la notación según la subdivisión. */
export const SUBDIVISION_NOTE_POSITIONS: Record<number, number[]> = {
  1: [25],
  2: [19, 33],
  3: [14, 26, 38],
  4: [12, 22, 32, 42],
};

/**
 * Dibujo de la subdivisión elegida: las notas, su barra, el tresillo y el
 * puntillo. Es solo geometría, sin estado.
 */
export function SubdivisionNotation({
  subdivision,
  isDotted,
  isHalfNote,
  isTuplet,
}: {
  subdivision: number;
  isDotted: boolean;
  isHalfNote: boolean;
  isTuplet: boolean;
}) {
  const notePositions = SUBDIVISION_NOTE_POSITIONS[subdivision];
  const firstNote = notePositions[0];
  const lastNote = notePositions[notePositions.length - 1];

  return (
    <svg
      viewBox="0 0 56 38"
      aria-hidden="true"
      className="size-10 text-inherit"
    >
      {notePositions.map((position) => (
        <g key={position}>
          <ellipse
            cx={position}
            cy="26"
            rx="4.5"
            ry="3"
            transform={`rotate(-20 ${position} 26)`}
            fill={isHalfNote ? "none" : "currentColor"}
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d={`M ${position + 4} 24 V 7`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </g>
      ))}
      {subdivision > 1 && (
        <path
          d={`M ${firstNote + 4} 7 L ${lastNote + 4} 11`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      )}
      {subdivision === 4 && (
        <path
          d={`M ${firstNote + 4} 11 L ${lastNote + 4} 15`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      )}
      {isTuplet && (
        <text
          x="26"
          y="8"
          textAnchor="middle"
          className="fill-current font-mono text-[8px]"
        >
          3
        </text>
      )}
      {isDotted && (
        <circle cx={firstNote + 12} cy="25" r="1.5" fill="currentColor" />
      )}
    </svg>
  );
}
