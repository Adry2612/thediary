"use client";

interface PracticeWaveformBarsProps {
  levels: number[];
  /** Posición de reproducción de 0 a 1; sin valor no se dibuja la aguja. */
  progress?: number | null;
  ariaLabel: string;
  className?: string;
  /** Cuando lo envuelve un control interactivo, la onda no se anuncia dos veces. */
  decorative?: boolean;
}

/**
 * Barras de la onda dentro de un marco. El nivel más reciente queda a la
 * derecha, así que al añadir niveles la onda se desplaza hacia la izquierda.
 */
export function PracticeWaveformBars({
  levels,
  progress = null,
  ariaLabel,
  className = "",
  decorative = false,
}: PracticeWaveformBarsProps) {
  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative ? "true" : undefined}
      className={`relative flex h-16 w-full items-center gap-[2px] overflow-hidden ${className}`}
    >
      {levels.map((level, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="min-w-px flex-1 rounded-full bg-accent-green-fg/80"
          style={{ height: `${Math.max(6, Math.min(1, level) * 100)}%` }}
        />
      ))}
      {progress !== null && progress >= 0 && progress <= 1 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-px bg-ink/90"
          style={{ left: `${progress * 100}%` }}
        />
      )}
    </div>
  );
}
