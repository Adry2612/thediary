import { parseTuningNotes } from "@/utils/chords";
import {
  getTabColumns,
  getTabStringOrder,
  isTabTechniqueActive,
  TAB_TECHNIQUES,
} from "@/utils/repertoire-tab";
import { repertoireTabToText } from "@/utils/licks/tab-text";
import type { RepertoireTab, RepertoireTabNote } from "@/types/practice";

type TabViewVariant = "compact" | "full";

/**
 * Tablatura de solo lectura. Comparte la geometría y las marcas de técnica con
 * el editor, pero no monta controles ni mide el ancho: se desplaza en horizontal
 * cuando no cabe.
 */
export function TabView({
  tab,
  ariaLabel,
  maxMeasures,
  variant = "full",
  playheadColumn,
  className = "",
}: {
  tab: RepertoireTab;
  ariaLabel: string;
  maxMeasures?: number;
  variant?: TabViewVariant;
  playheadColumn?: number | null;
  className?: string;
}) {
  const compact = variant === "compact";
  const visibleMeasures = Math.max(
    1,
    Math.min(maxMeasures ?? tab.measures, tab.measures),
  );
  const columns = Math.min(
    getTabColumns(tab),
    visibleMeasures * tab.subdivision,
  );
  const stringOrder = getTabStringOrder();
  const tuning = parseTuningNotes(tab.tuning);
  const notes = new Map<string, RepertoireTabNote>();
  for (const note of tab.notes) {
    notes.set(`${note.string}:${note.column}`, note);
  }

  const cellWidth = compact ? 20 : 28;
  const rowHeight = compact ? 24 : 36;
  const labelWidth = compact ? 24 : 34;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`max-w-full overflow-x-auto rounded-lg border border-line bg-canvas/70 ${className}`}
    >
      <div className="min-w-max p-3">
        <div className="flex">
          <span style={{ width: labelWidth }} className="shrink-0" />
          {Array.from({ length: columns }, (_, column) => (
            <span
              key={column}
              style={{ width: cellWidth }}
              className={`shrink-0 text-center font-mono text-muted ${
                compact ? "text-[9px]" : "text-[10px]"
              } ${
                column > 0 && column % tab.subdivision === 0
                  ? "border-l border-line"
                  : ""
              }`}
            >
              {column % tab.subdivision === 0
                ? column / tab.subdivision + 1
                : ""}
            </span>
          ))}
        </div>

        {stringOrder.map((string) => (
          <div key={string} className="flex items-stretch">
            <span
              style={{ width: labelWidth, height: rowHeight }}
              className={`shrink-0 pr-2 text-right font-mono text-muted ${
                compact ? "text-[10px] leading-6" : "text-xs leading-9"
              }`}
            >
              {tuning[string]}
            </span>
            {Array.from({ length: columns }, (_, column) => {
              const note = notes.get(`${string}:${column}`);
              const marks = note
                ? TAB_TECHNIQUES.filter(
                    (technique) =>
                      technique.id !== "dead" &&
                      isTabTechniqueActive(note, technique.id),
                  )
                    .map((technique) => technique.glyph)
                    .join(" ")
                : "";
              return (
                <span
                  key={column}
                  style={{ width: cellWidth, height: rowHeight }}
                  data-playhead={
                    playheadColumn === column ? "true" : undefined
                  }
                  aria-current={
                    playheadColumn === column ? "true" : undefined
                  }
                  className={`flex shrink-0 flex-col items-center justify-center overflow-hidden border-b border-line/60 font-mono tabular-nums text-ink ${
                    column > 0 && column % tab.subdivision === 0
                      ? "border-l border-line"
                      : ""
                  } ${
                    playheadColumn === column ? "bg-accent-green-bg/15" : ""
                  }`}
                >
                  <span
                    className={`flex w-full items-center justify-center overflow-hidden leading-none text-accent-green-fg ${
                      compact ? "text-[7px]" : "text-[8px]"
                    }`}
                  >
                    {marks}
                  </span>
                  <span className={compact ? "text-[11px]" : "text-sm"}>
                    {note?.dead ? "x" : note !== undefined ? note.fret : ""}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <pre className="sr-only">{repertoireTabToText(tab)}</pre>
    </div>
  );
}
