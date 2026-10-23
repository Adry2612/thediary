import type {
  RepertoireChord,
  RepertoireChordChart,
  RepertoireLyricLine,
} from "../types/practice.ts";

/** Acorde ya colocado en una fila visual. Conserva su anclaje original. */
export interface WrappedChord {
  id: string;
  name: string;
  /** Posición de carácter original dentro de la línea (no cambia). */
  position: number;
  /** Columna dentro de la fila donde se dibuja el nombre. */
  column: number;
  shape?: RepertoireChord["shape"];
}

/**
 * Una fila visual de la letra. `start` es el desplazamiento absoluto del primer
 * carácter dentro de la línea; `text` es el texto ya recortado que se dibuja.
 */
export interface WrappedRow {
  key: string;
  lineId: string;
  start: number;
  text: string;
  chords: WrappedChord[];
  /** Fila de una línea en blanco: marca el salto de estrofa. */
  isBlank: boolean;
  /** Fila que continúa la misma frase envuelta (no es la primera de la línea). */
  isContinuation: boolean;
}

interface RawRow {
  start: number;
  text: string;
}

function trimTrailingSpaces(value: string): string {
  return value.replace(/\s+$/, "");
}

function endOf(row: RawRow): number {
  return row.start + row.text.length;
}

/**
 * Parte el texto en filas que caben en `columns`, cortando por palabra. Si una
 * palabra no cabe entera, se parte por carácter. Los espacios del salto se
 * descartan (la fila siguiente empieza en la palabra).
 */
function splitIntoRows(text: string, columns: number): RawRow[] {
  const rows: RawRow[] = [];
  let start = 0;
  while (start < text.length) {
    while (start < text.length && text[start] === " ") start += 1;
    if (start >= text.length) break;

    const limit = start + columns;
    if (limit >= text.length) {
      rows.push({ start, text: trimTrailingSpaces(text.slice(start)) });
      break;
    }

    let breakIndex = -1;
    for (let index = limit - 1; index > start; index -= 1) {
      if (text[index] === " ") {
        breakIndex = index;
        break;
      }
    }

    if (breakIndex === -1) {
      rows.push({ start, text: text.slice(start, limit) });
      start = limit;
    } else {
      rows.push({
        start,
        text: trimTrailingSpaces(text.slice(start, breakIndex)),
      });
      start = breakIndex + 1;
    }
  }
  return rows;
}

/**
 * Reparte los acordes por filas y les da columna. Un acorde anclado en un hueco
 * que el salto se ha comido se pega al final de la fila anterior; la etiqueta
 * que no cabe al borde de la fila baja al principio de la siguiente; y las
 * etiquetas que se pisan se empujan lo mínimo, sin mover su anclaje.
 */
function placeChords(
  rows: RawRow[],
  chords: RepertoireChord[],
  columns: number,
): WrappedChord[][] {
  const queues: WrappedChord[][] = rows.map(() => []);
  const sorted = [...chords].sort(
    (left, right) => left.position - right.position,
  );

  for (const chord of sorted) {
    let rowIndex = rows.findIndex((row) => endOf(row) >= chord.position);
    if (rowIndex === -1) rowIndex = rows.length - 1;
    let column = chord.position - rows[rowIndex].start;
    if (column < 0) {
      rowIndex = Math.max(0, rowIndex - 1);
      column = rows[rowIndex].text.length;
    }
    queues[rowIndex].push({
      id: chord.id,
      name: chord.name,
      position: chord.position,
      column,
      ...(chord.shape ? { shape: chord.shape } : {}),
    });
  }

  const placed: WrappedChord[][] = rows.map(() => []);
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    queues[rowIndex].sort((left, right) => left.column - right.column);
    let cursor = 0;
    for (const chord of queues[rowIndex]) {
      const column = Math.max(chord.column, cursor);
      if (column + chord.name.length > columns && rowIndex + 1 < rows.length) {
        queues[rowIndex + 1].push({ ...chord, column: 0 });
        continue;
      }
      placed[rowIndex].push({ ...chord, column });
      cursor = column + chord.name.length + 1;
    }
  }
  return placed;
}

/**
 * Envuelve una línea de la letra en filas visuales que caben en `columns`,
 * conservando el anclaje de cada acorde. Una línea en blanco devuelve una
 * única fila marcada como `isBlank`.
 */
export function wrapLyricLine(
  line: RepertoireLyricLine,
  columns: number,
): WrappedRow[] {
  const width = Math.max(1, Math.floor(columns));
  if (line.text.trim().length === 0) {
    return [
      {
        key: `${line.id}-0`,
        lineId: line.id,
        start: 0,
        text: "",
        chords: [],
        isBlank: true,
        isContinuation: false,
      },
    ];
  }

  const rows = splitIntoRows(line.text, width);
  const chords = placeChords(rows, line.chords, width);
  return rows.map((row, index) => ({
    key: `${line.id}-${index}`,
    lineId: line.id,
    start: row.start,
    text: row.text,
    chords: chords[index],
    isBlank: false,
    isContinuation: index > 0,
  }));
}

/**
 * Envuelve toda la letra y colapsa las líneas en blanco consecutivas en un
 * único salto de estrofa.
 */
export function layoutChordChart(
  chart: RepertoireChordChart,
  columns: number,
): WrappedRow[] {
  const rows: WrappedRow[] = [];
  let previousBlank = false;
  for (const line of chart.lines) {
    for (const row of wrapLyricLine(line, columns)) {
      if (row.isBlank) {
        if (previousBlank) continue;
        previousBlank = true;
      } else {
        previousBlank = false;
      }
      rows.push(row);
    }
  }
  return rows;
}
