"use client";

import { tokenizeTabLine } from "@/lib/licks/tab-highlight";

export function LickTab({
  content,
  emptyLabel,
  ariaLabel,
  maxLines,
  className = "",
}: {
  content: string;
  emptyLabel: string;
  ariaLabel: string;
  maxLines?: number;
  className?: string;
}) {
  if (!content.trim()) {
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
