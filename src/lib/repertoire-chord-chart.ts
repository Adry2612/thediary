import type {
  RepertoireChord,
  RepertoireChordChart,
  RepertoireLyricLine,
} from "@/types/practice";

export function emptyChordChart(): RepertoireChordChart {
  return { lines: [] };
}

/**
 * Alinea dos textos por subsecuencia común y devuelve, para cada índice del
 * texto anterior que sigue existiendo, su índice en el texto nuevo.
 */
function alignCharacters(
  previous: string,
  next: string,
): Map<number, number> {
  const rows = previous.length;
  const columns = next.length;
  const lengths: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number>(columns + 1).fill(0),
  );
  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let column = columns - 1; column >= 0; column -= 1) {
      lengths[row][column] =
        previous[row] === next[column] ?
          lengths[row + 1][column + 1] + 1
        : Math.max(lengths[row + 1][column], lengths[row][column + 1]);
    }
  }

  const alignment = new Map<number, number>();
  let row = 0;
  let column = 0;
  while (row < rows && column < columns) {
    if (previous[row] === next[column]) {
      alignment.set(row, column);
      row += 1;
      column += 1;
    } else if (lengths[row + 1][column] >= lengths[row][column + 1]) {
      row += 1;
    } else {
      column += 1;
    }
  }
  return alignment;
}

/**
 * Cuántos caracteres contiguos alrededor del anclaje siguen alineados de forma
 * consistente. Un empalme real (insertar o borrar texto) mantiene una tirada
 * larga; una coincidencia suelta en un texto reescrito deja una tirada corta.
 */
function alignedRun(
  previousText: string,
  position: number,
  mapped: number,
  alignment: Map<number, number>,
): number {
  let run = 0;
  let step = 0;
  while (
    position + step < previousText.length &&
    alignment.get(position + step) === mapped + step
  ) {
    run += 1;
    step += 1;
  }
  step = 1;
  while (
    position - step >= 0 &&
    alignment.get(position - step) === mapped - step
  ) {
    run += 1;
    step += 1;
  }
  return run;
}

/**
 * Reancla un acorde tras editar la línea: lo desplaza con el texto y lo pega a
 * la palabra siguiente si se ha insertado o borrado algo antes. Devuelve `null`
 * si el texto de su alrededor se ha reescrito y ya no hay dónde ponerlo.
 */
function remapChordPosition(
  previousText: string,
  nextText: string,
  position: number,
  alignment: Map<number, number>,
): number | null {
  let mapped: number;
  if (alignment.has(position)) {
    mapped = alignment.get(position)!;
  } else if (position > 0 && alignment.has(position - 1)) {
    mapped = alignment.get(position - 1)! + 1;
  } else {
    return null;
  }
  if (mapped < 0 || mapped > nextText.length) return null;
  if (alignedRun(previousText, position, mapped, alignment) < 2) return null;
  return mapped;
}

export function normalizeChordChart(
  value: RepertoireChordChart | undefined,
): RepertoireChordChart {
  if (!value || !Array.isArray(value.lines)) return emptyChordChart();
  return {
    lines: value.lines
      .filter((line) => line && typeof line.text === "string")
      .map((line) => ({
        id: line.id,
        text: line.text,
        chords: (Array.isArray(line.chords) ? line.chords : [])
          .filter(
            (chord) =>
              chord &&
              typeof chord.name === "string" &&
              Number.isFinite(chord.position),
          )
          .map((chord) => ({
            id: chord.id,
            name: chord.name,
            position: Math.min(
              line.text.length,
              Math.max(0, Math.round(chord.position)),
            ),
            ...(chord.shape ? { shape: chord.shape } : {}),
          }))
          .sort((left, right) => left.position - right.position),
      })),
  };
}

/**
 * Convierte un texto de letra en líneas de canción. Al editar la letra, los
 * acordes se desplazan con el texto y se reanclan a la palabra siguiente,
 * conservando solo los que siguen teniendo sentido.
 */
export function lyricsToChart(
  text: string,
  createId: () => string,
  previous?: RepertoireChordChart,
): RepertoireChordChart {
  const rawLines = text.replace(/\r\n?/g, "\n").split("\n");
  return {
    lines: rawLines.map((lineText, index) => {
      const previousLine = previous?.lines[index];
      let chords: RepertoireChord[] = [];
      if (previousLine && previousLine.text === lineText) {
        chords = previousLine.chords.filter(
          (chord) => chord.position <= lineText.length,
        );
      } else if (previousLine) {
        const alignment = alignCharacters(previousLine.text, lineText);
        chords = previousLine.chords.flatMap((chord) => {
          const position = remapChordPosition(
            previousLine.text,
            lineText,
            chord.position,
            alignment,
          );
          return position === null ? [] : [{ ...chord, position }];
        });
      }
      return {
        id: previousLine?.id ?? createId(),
        text: lineText,
        chords,
      };
    }),
  };
}

export function chartToLyrics(chart: RepertoireChordChart): string {
  return chart.lines.map((line) => line.text).join("\n");
}

export function getChordAtPosition(
  line: RepertoireLyricLine,
  position: number,
): RepertoireChord | undefined {
  return line.chords.find((chord) => chord.position === position);
}

export function setChordOnLine(
  chart: RepertoireChordChart,
  lineId: string,
  chord: RepertoireChord,
): RepertoireChordChart {
  return {
    ...chart,
    lines: chart.lines.map((line) =>
      line.id === lineId ?
        {
          ...line,
          chords: [
            ...line.chords.filter((item) => item.position !== chord.position),
            chord,
          ].sort((left, right) => left.position - right.position),
        }
      : line,
    ),
  };
}

export function removeChordFromLine(
  chart: RepertoireChordChart,
  lineId: string,
  position: number,
): RepertoireChordChart {
  return {
    ...chart,
    lines: chart.lines.map((line) =>
      line.id === lineId ?
        {
          ...line,
          chords: line.chords.filter((chord) => chord.position !== position),
        }
      : line,
    ),
  };
}
