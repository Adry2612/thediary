"use client";

import { TabScoreView } from "@/components/tab-score/TabScoreView";
import { tokenizeTabLine } from "@/utils/licks/tab-highlight";
import { resolveTabScore } from "@/utils/tab-score/resolve";
import type { RepertoireTab } from "@/types/practice";
import type { TabScore } from "@/types/tab-score";

export function LickTab({
  score,
  tab,
  content,
  emptyLabel,
  ariaLabel,
  maxLines,
  maxBars,
  variant,
  playback = false,
  className = "",
}: {
  score?: TabScore;
  tab?: RepertoireTab;
  content?: string;
  emptyLabel: string;
  ariaLabel: string;
  maxLines?: number;
  maxBars?: number;
  variant?: "compact" | "full";
  playback?: boolean;
  className?: string;
}) {
  const hasNotes = tab !== undefined && tab.notes.length > 0;

  if (score || hasNotes) {
    return (
      <TabScoreView
        score={resolveTabScore({ score, tab })}
        label={ariaLabel}
        maxBars={maxBars}
        variant={variant}
        playback={playback}
        className={className}
      />
    );
  }

  if (!content?.trim()) {
    return (
      <p className={`rounded-lg border border-dashed border-line bg-canvas/60 px-4 py-6 text-sm text-muted ${className}`}>
        {emptyLabel}
      </p>
    );
  }

  const allLines = content.split("\n");
  const lines = maxLines ? allLines.slice(0, maxLines) : allLines;

  return (
    <pre
      tabIndex={0}
      aria-label={ariaLabel}
      className={`overflow-x-auto rounded-lg border border-line bg-canvas/70 p-4 font-mono text-xs leading-6 whitespace-pre text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 ${className}`}
    >
      {lines.map((line, index) => (
        <span key={index}>
          {tokenizeTabLine(line).map((token, tokenIndex) => (
            <span
              key={tokenIndex}
              className={
                token.kind === "fret" ? "text-accent-green-fg" : undefined
              }
            >
              {token.text}
            </span>
          ))}
          {index < lines.length - 1 ? "\n" : null}
        </span>
      ))}
    </pre>
  );
}
