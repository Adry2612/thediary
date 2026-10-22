import type {
  RepertoireTab,
  RepertoireTabNote,
} from "../../types/practice.ts";
import { parseTuningNotes } from "../chords.ts";
import {
  getTabColumns,
  getTabStringOrder,
  isTabTechniqueActive,
  TAB_TECHNIQUES,
} from "../repertoire-tab.ts";

const MIN_CELL_WIDTH = 3;

function noteToken(note: RepertoireTabNote | undefined): string {
  if (!note) return "";
  if (note.dead) return "x";

  const glyphs = TAB_TECHNIQUES.filter((technique) => {
    if (technique.id === "dead") return false;
    return isTabTechniqueActive(note, technique.id);
  })
    .map((technique) => technique.glyph)
    .join("");

  return `${note.fret}${glyphs}`;
}

/**
 * Convierte una tablatura estructurada en texto plano legible. No es un
 * formato de ida y vuelta: se usa como alternativa accesible y como
 * instantánea de las tablaturas antiguas.
 */
export function repertoireTabToText(
  tab: RepertoireTab | undefined | null,
): string {
  if (!tab || tab.notes.length === 0) return "";

  const columns = getTabColumns(tab);
  const stringOrder = getTabStringOrder();
  const tuning = parseTuningNotes(tab.tuning);
  const notes = new Map<string, RepertoireTabNote>();
  for (const note of tab.notes) {
    notes.set(`${note.string}:${note.column}`, note);
  }

  const tokens = stringOrder.map((string) =>
    Array.from({ length: columns }, (_, column) =>
      noteToken(notes.get(`${string}:${column}`)),
    ),
  );
  const longestToken = Math.max(
    MIN_CELL_WIDTH - 1,
    ...tokens.flat().map((token) => token.length),
  );
  const cellWidth = Math.max(MIN_CELL_WIDTH, longestToken + 1);

  return stringOrder
    .map((string, rowIndex) => {
      const cells: string[] = [];
      for (let column = 0; column < columns; column += 1) {
        cells.push(tokens[rowIndex][column].padEnd(cellWidth, "-"));
        if (
          tab.subdivision > 0 &&
          (column + 1) % tab.subdivision === 0 &&
          column < columns - 1
        ) {
          cells.push("|");
        }
      }
      return `${tuning[string]} |${cells.join("")}|`;
    })
    .join("\n");
}
