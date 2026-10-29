"use client";

import { PracticeWaveformBars } from "@/components/practice/PracticeWaveformBars";

interface PracticeRecorderDisplayProps {
  levels: number[];
  progress?: number | null;
  statusLabel: string;
  timeLabel: string;
  tone: "idle" | "recording" | "playing" | "saving";
  ariaLabel: string;
}

const TONE_STYLES: Record<
  PracticeRecorderDisplayProps["tone"],
  { dot: string; text: string }
> = {
  idle: { dot: "bg-muted", text: "text-muted" },
  recording: {
    dot: "bg-red-400 animate-pulse",
    text: "text-red-300",
  },
  playing: { dot: "bg-accent-green-fg", text: "text-accent-green-fg" },
  saving: { dot: "bg-amber-300 animate-pulse", text: "text-amber-200" },
};

/**
 * Pantalla de la pletina: un marco oscuro con la onda dentro, el estado y el
 * tiempo. Los mandos van fuera, como en una grabadora física.
 */
export function PracticeRecorderDisplay({
  levels,
  progress = null,
  statusLabel,
  timeLabel,
  tone,
  ariaLabel,
}: PracticeRecorderDisplayProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="mt-5 rounded-2xl border border-line bg-[#0c0f0d] p-4 shadow-[inset_0_1px_12px_rgba(0,0,0,0.65)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${styles.dot}`}
          />
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.16em] ${styles.text}`}
          >
            {statusLabel}
          </span>
        </span>
        <span className="font-mono text-xs tabular-nums text-muted">
          {timeLabel}
        </span>
      </div>
      <div className="mt-3 rounded-lg border border-white/5 bg-black/40 px-3 py-3">
        <PracticeWaveformBars
          levels={levels}
          progress={progress}
          ariaLabel={ariaLabel}
        />
      </div>
    </div>
  );
}
