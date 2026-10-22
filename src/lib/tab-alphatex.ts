import { getTabColumns } from "./repertoire-tab.ts";
import { getTabTuningMidi } from "./tab-playback.ts";
import type { RepertoireTab, RepertoireTabNote } from "@/types/practice";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function midiToNoteName(midi: number): string {
  const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

function noteCellKey(note: RepertoireTabNote): string {
  return `${note.string}:${note.column}`;
}

/**
 * AlphaTex marca los ligados en la nota de origen, no en la de destino. Esta
 * tabla traduce nuestro `legato` (ligado desde la nota anterior) a la marca que
 * espera el importador de alphaTab.
 */
function getLegatoOrigins(tab: RepertoireTab): Map<string, "h" | "p"> {
  const origins = new Map<string, "h" | "p">();
  const byString = new Map<number, RepertoireTabNote[]>();
  for (const note of tab.notes) {
    const notes = byString.get(note.string) ?? [];
    notes.push(note);
    byString.set(note.string, notes);
  }
  for (const notes of byString.values()) {
    notes.sort((left, right) => left.column - right.column);
    for (let index = 1; index < notes.length; index += 1) {
      const note = notes[index];
      if (!note.legato) continue;
      origins.set(
        noteCellKey(notes[index - 1]),
        note.legato === "hammer" ? "h" : "p",
      );
    }
  }
  return origins;
}

function noteToken(
  note: RepertoireTabNote,
  legatoOrigins: Map<string, "h" | "p">,
): string {
  const effects: string[] = [];
  if (note.palmMute) effects.push("pm");
  if (note.letRing) effects.push("lr");
  if (note.vibrato === "slight") effects.push("v");
  if (note.vibrato === "wide") effects.push("vw");
  if (note.harmonic === "natural") effects.push("nh");
  if (note.harmonic === "artificial") effects.push("ah");
  if (note.harmonic === "pinch") effects.push("ph");
  if (note.harmonic === "tap") effects.push("th");
  if (note.slide === "up") effects.push("sou");
  if (note.slide === "down") effects.push("sod");
  if (note.slide === "position") effects.push("ss");
  if (note.tapping) effects.push("tt");
  if (note.slap) effects.push("s");
  if (note.pop) effects.push("p");
  if (note.tremoloPicking) effects.push("tp (16)");
  if (note.trill) effects.push(`tr (${Math.min(24, note.fret + 2)})`);
  if (note.bend) effects.push(`b (0 ${note.bend.semitones})`);
  const legato = legatoOrigins.get(noteCellKey(note));
  if (legato) effects.push(legato);

  const fret = note.dead ? "x" : String(note.fret);
  const string = note.string + 1;
  return `${fret}.${string}${effects.length > 0 ? `{${effects.join(" ")}}` : ""}`;
}

/**
 * Genera una partitura AlphaTex mínima para que alphaTab pueda sintetizar la
 * tablatura con su banco de sonidos (guitarra acústica, programa 25). No se usa
 * para editar ni para dibujar: el editor visual sigue siendo el de la app.
 */
export function buildTabAlphaTex(tab: RepertoireTab, bpm: number): string {
  const safeBpm =
    Number.isFinite(bpm) && bpm > 0 ? Math.round(bpm) : 90;
  const tuning = [...getTabTuningMidi(tab.tuning)]
    .reverse()
    .map(midiToNoteName)
    .join(" ");
  const notesByColumn = new Map<number, RepertoireTabNote[]>();
  for (const note of tab.notes) {
    const notes = notesByColumn.get(note.column) ?? [];
    notes.push(note);
    notesByColumn.set(note.column, notes);
  }
  for (const notes of notesByColumn.values()) {
    notes.sort((left, right) => left.string - right.string);
  }

  const legatoOrigins = getLegatoOrigins(tab);
  const totalColumns = getTabColumns(tab);
  const lines = [
    `\\tempo (${safeBpm})`,
    "\\ts (4 4)",
    "\\instrument (25)",
    `\\tuning (${tuning})`,
    ".",
  ];

  for (let measure = 0; measure < tab.measures; measure += 1) {
    const start = measure * tab.subdivision;
    const end = Math.min(start + tab.subdivision, totalColumns);
    const beats: string[] = [];
    for (let column = start; column < end; column += 1) {
      const notes = notesByColumn.get(column);
      if (!notes || notes.length === 0) {
        beats.push(`r.${tab.subdivision}`);
      } else {
        beats.push(
          `:${tab.subdivision} ${notes
            .map((note) => noteToken(note, legatoOrigins))
            .join(" ")}`,
        );
      }
    }
    if (beats.length > 0) {
      lines.push(`${beats.join(" ")} |`);
    }
  }

  return lines.join("\n");
}
