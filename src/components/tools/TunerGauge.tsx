"use client";

interface TunerGaugeProps {
  /** Desviación en cents, ya acotada por quien la usa. */
  cents: number;
  label: string;
  tone: "in-tune" | "off" | "idle";
}

const TONE_CLASSES: Record<TunerGaugeProps["tone"], string> = {
  "in-tune": "text-accent-green-fg",
  off: "text-amber-300",
  idle: "text-muted",
};

const TICKS = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];

function tickPosition(cents: number, radius: number) {
  const radians = ((cents / 50) * 90 * Math.PI) / 180;
  return {
    x: 120 + Math.sin(radians) * radius,
    y: 120 - Math.cos(radians) * radius,
  };
}

/**
 * Arco de afinación de -50 a +50 cents. La aguja apunta arriba cuando la nota
 * está centrada y se inclina hacia el lado en el que está desafinada.
 */
export function TunerGauge({ cents, label, tone }: TunerGaugeProps) {
  const clamped = Math.max(-50, Math.min(50, cents));
  const angle = (clamped / 50) * 90;

  return (
    <svg
      viewBox="0 0 240 148"
      role="img"
      aria-label={label}
      className="mx-auto w-full max-w-sm"
    >
      <path
        d="M24 120 A96 96 0 0 1 216 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-white/10"
      />

      {TICKS.map((tick) => {
        const outer = tickPosition(tick, 96);
        const inner = tickPosition(tick, tick === 0 ? 82 : 88);

        return (
          <line
            key={tick}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeWidth={tick === 0 ? 2 : 1}
            strokeLinecap="round"
            className={tick === 0 ? "text-ink/60" : "text-muted/50"}
          />
        );
      })}

      <line
        x1="120"
        y1="120"
        x2="120"
        y2="40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${angle} 120 120)`}
        className={`transition-transform duration-150 motion-reduce:transition-none ${TONE_CLASSES[tone]}`}
      />
      <circle
        cx="120"
        cy="120"
        r="7"
        fill="currentColor"
        className={TONE_CLASSES[tone]}
      />
      <text
        x="20"
        y="140"
        textAnchor="middle"
        className="fill-current font-mono text-[10px] text-muted"
      >
        -50
      </text>
      <text
        x="120"
        y="140"
        textAnchor="middle"
        className="fill-current font-mono text-[10px] text-muted"
      >
        0
      </text>
      <text
        x="220"
        y="140"
        textAnchor="middle"
        className="fill-current font-mono text-[10px] text-muted"
      >
        +50
      </text>
    </svg>
  );
}
