import type {
  RepertoireTab,
  RepertoireTabNote,
  TabBend,
  TabHarmonic,
  TabLegato,
  TabSlide,
  TabVibrato,
} from "../types/practice.ts";
import { parseTuningNotes, STRING_COUNT } from "./chords.ts";

export const MIN_MEASURES = 1;
export const MAX_MEASURES = 64;
export const MAX_FRET = 24;

export const TAB_SUBDIVISIONS = [4, 8, 16] as const;
export type TabSubdivision = (typeof TAB_SUBDIVISIONS)[number];

/** Semitonos admitidos en un bend. */
export const TAB_BEND_AMOUNTS = [0.25, 0.5, 1, 1.5, 2] as const;

export function isTabBendAmount(value: number): boolean {
  return TAB_BEND_AMOUNTS.some((amount) => amount === value);
}

/** Identificador de cada técnica que se puede aplicar a una nota. */
export type TabTechniqueId =
  | "hammer"
  | "pull"
  | "slideUp"
  | "slideDown"
  | "slidePosition"
  | "bend"
  | "bendRelease"
  | "prebend"
  | "prebendRelease"
  | "vibratoSlight"
  | "vibratoWide"
  | "palmMute"
  | "letRing"
  | "tapping"
  | "harmonicNatural"
  | "harmonicArtificial"
  | "harmonicPinch"
  | "harmonicTap"
  | "dead"
  | "tremoloPicking"
  | "trill"
  | "slap"
  | "pop";

export type TabTechniqueGroup =
  | "legato"
  | "slide"
  | "bend"
  | "vibrato"
  | "hands"
  | "harmonic"
  | "other";

export type TabTechniqueRender =
  | "span"
  | "connector"
  | "sustain"
  | "glyph"
  | "notehead";

export interface TabTechniqueDescriptor {
  id: TabTechniqueId;
  /** Clave del diccionario `repertoire` con el nombre de la técnica. */
  labelKey: string;
  /** Tecla que aplica o quita la técnica. */
  shortcut: string;
  /** Marca compacta que la representa (leyenda y marcas puntuales). */
  glyph: string;
  /**
   * Cómo se dibuja en la tablatura, siguiendo a Guitar Pro y alphaTab:
   * `span` cubre un tramo de notas, `connector` une dos notas, `sustain` se
   * extiende sobre la nota, `glyph` marca la nota y `notehead` sustituye al
   * número de traste.
   */
  render: TabTechniqueRender;
  /** Etiqueta que abre un tramo (`P.M.`, `L.R.`). Solo para `span`. */
  label?: string;
  /** Necesita una nota anterior en la misma cuerda. */
  isTransition: boolean;
  group: TabTechniqueGroup;
}

/** Fuente única de la paleta, los atajos, la leyenda y el dibujo. */
export const TAB_TECHNIQUES: readonly TabTechniqueDescriptor[] = [
  { id: "hammer", labelKey: "techniqueHammer", shortcut: "h", glyph: "h", render: "connector", isTransition: true, group: "legato" },
  { id: "pull", labelKey: "techniquePull", shortcut: "p", glyph: "p", render: "connector", isTransition: true, group: "legato" },
  { id: "slideUp", labelKey: "techniqueSlideUp", shortcut: "u", glyph: "/", render: "connector", isTransition: true, group: "slide" },
  { id: "slideDown", labelKey: "techniqueSlideDown", shortcut: "j", glyph: "\\", render: "connector", isTransition: true, group: "slide" },
  { id: "slidePosition", labelKey: "techniqueSlidePosition", shortcut: "s", glyph: "S", render: "connector", isTransition: true, group: "slide" },
  { id: "bend", labelKey: "techniqueBend", shortcut: "b", glyph: "b", render: "sustain", isTransition: false, group: "bend" },
  { id: "bendRelease", labelKey: "techniqueBendRelease", shortcut: "r", glyph: "br", render: "sustain", isTransition: false, group: "bend" },
  { id: "prebend", labelKey: "techniquePrebend", shortcut: "n", glyph: "pb", render: "sustain", isTransition: false, group: "bend" },
  { id: "prebendRelease", labelKey: "techniquePrebendRelease", shortcut: "e", glyph: "pbr", render: "sustain", isTransition: false, group: "bend" },
  { id: "vibratoSlight", labelKey: "techniqueVibratoSlight", shortcut: "v", glyph: "~", render: "sustain", isTransition: false, group: "vibrato" },
  { id: "vibratoWide", labelKey: "techniqueVibratoWide", shortcut: "w", glyph: "~~", render: "sustain", isTransition: false, group: "vibrato" },
  { id: "palmMute", labelKey: "techniquePalmMute", shortcut: "m", glyph: "P.M.", label: "P.M.", render: "span", isTransition: false, group: "hands" },
  { id: "letRing", labelKey: "techniqueLetRing", shortcut: "l", glyph: "L.R.", label: "L.R.", render: "span", isTransition: false, group: "hands" },
  { id: "tapping", labelKey: "techniqueTapping", shortcut: "t", glyph: "T", render: "glyph", isTransition: false, group: "hands" },
  { id: "harmonicNatural", labelKey: "techniqueHarmonicNatural", shortcut: "g", glyph: "NH", render: "glyph", isTransition: false, group: "harmonic" },
  { id: "harmonicArtificial", labelKey: "techniqueHarmonicArtificial", shortcut: "a", glyph: "AH", render: "glyph", isTransition: false, group: "harmonic" },
  { id: "harmonicPinch", labelKey: "techniqueHarmonicPinch", shortcut: "c", glyph: "PH", render: "glyph", isTransition: false, group: "harmonic" },
  { id: "harmonicTap", labelKey: "techniqueHarmonicTap", shortcut: "y", glyph: "TH", render: "glyph", isTransition: false, group: "harmonic" },
  { id: "dead", labelKey: "techniqueDead", shortcut: "x", glyph: "x", render: "notehead", isTransition: false, group: "other" },
  { id: "tremoloPicking", labelKey: "techniqueTremoloPicking", shortcut: "o", glyph: "trem", render: "span", isTransition: false, group: "other" },
  { id: "trill", labelKey: "techniqueTrill", shortcut: "i", glyph: "tr", render: "sustain", isTransition: false, group: "other" },
  { id: "slap", labelKey: "techniqueSlap", shortcut: "k", glyph: "sl", render: "glyph", isTransition: false, group: "other" },
  { id: "pop", labelKey: "techniquePop", shortcut: "q", glyph: "po", render: "glyph", isTransition: false, group: "other" },
];

export function getTabTechnique(
  id: string,
): TabTechniqueDescriptor | undefined {
  return TAB_TECHNIQUES.find((technique) => technique.id === id);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isTabSubdivision(value: number): value is TabSubdivision {
  return TAB_SUBDIVISIONS.some((subdivision) => subdivision === value);
}

export function createEmptyTab(tuning?: string): RepertoireTab {
  return {
    tuning: parseTuningNotes(tuning).join(""),
    measures: 2,
    subdivision: 16,
    notes: [],
  };
}

export function getTabColumns(tab: RepertoireTab): number {
  return tab.measures * tab.subdivision;
}

export function findTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): RepertoireTabNote | undefined {
  return tab.notes.find(
    (note) => note.string === string && note.column === column,
  );
}

const TAB_LEGATOS: readonly TabLegato[] = ["hammer", "pull"];
const TAB_SLIDES: readonly TabSlide[] = ["up", "down", "position"];
const TAB_VIBRATOS: readonly TabVibrato[] = ["slight", "wide"];
const TAB_HARMONICS: readonly TabHarmonic[] = [
  "natural",
  "artificial",
  "pinch",
  "tap",
];
const TAB_FLAG_KEYS = [
  "palmMute",
  "letRing",
  "tapping",
  "dead",
  "tremoloPicking",
  "trill",
  "slap",
  "pop",
] as const;

/** Valida el bend de una nota guardada; devuelve `undefined` si no es utilizable. */
export function normalizeTabBend(value: unknown): TabBend | undefined {
  if (!value || typeof value !== "object") return undefined;
  const bend = value as Partial<TabBend>;
  if (typeof bend.semitones !== "number" || !isTabBendAmount(bend.semitones)) {
    return undefined;
  }
  const next: TabBend = { semitones: bend.semitones };
  if (bend.release === true) next.release = true;
  if (bend.prebend === true) next.prebend = true;
  return next;
}

/**
 * Conserva de una nota guardada su cuerda, traste y columna, y solo los valores
 * de técnica que entiende: un valor desconocido se descarta sin perder la nota.
 */
export function normalizeTabTechniques(
  note: RepertoireTabNote,
): RepertoireTabNote {
  const next: RepertoireTabNote = {
    string: note.string,
    fret: note.fret,
    column: note.column,
  };
  if (note.legato && TAB_LEGATOS.includes(note.legato)) {
    next.legato = note.legato;
  }
  if (note.slide && TAB_SLIDES.includes(note.slide)) {
    next.slide = note.slide;
  }
  if (note.vibrato && TAB_VIBRATOS.includes(note.vibrato)) {
    next.vibrato = note.vibrato;
  }
  if (note.harmonic && TAB_HARMONICS.includes(note.harmonic)) {
    next.harmonic = note.harmonic;
  }
  const bend = normalizeTabBend(note.bend);
  if (bend) next.bend = bend;
  for (const key of TAB_FLAG_KEYS) {
    if (note[key] === true) next[key] = true;
  }
  return next;
}

export function normalizeTab(
  value: RepertoireTab | undefined,
  tuning?: string,
): RepertoireTab {
  const fallbackTuning = parseTuningNotes(tuning).join("");
  if (!value) return { ...createEmptyTab(tuning), tuning: fallbackTuning };

  const measures = clamp(
    Math.round(value.measures) || 2,
    MIN_MEASURES,
    MAX_MEASURES,
  );
  const subdivision = isTabSubdivision(value.subdivision) ?
    value.subdivision
  : 16;
  const columns = measures * subdivision;

  const byCell = new Map<string, RepertoireTabNote>();
  for (const note of Array.isArray(value.notes) ? value.notes : []) {
    if (
      !note ||
      !Number.isFinite(note.string) ||
      !Number.isFinite(note.column) ||
      !Number.isFinite(note.fret)
    ) {
      continue;
    }
    const string = Math.round(note.string);
    if (string < 0 || string > STRING_COUNT - 1) continue;
    const column = clamp(Math.round(note.column), 0, columns - 1);
    byCell.set(
      `${string}:${column}`,
      normalizeTabTechniques({
        ...note,
        string,
        column,
        fret: clamp(Math.round(note.fret), 0, MAX_FRET),
      }),
    );
  }

  return pruneTabTransitions({
    tuning: value.tuning || fallbackTuning,
    measures,
    subdivision,
    notes: [...byCell.values()],
  });
}

export function setTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
  fret: number,
): RepertoireTab {
  if (
    string < 0 ||
    string >= STRING_COUNT ||
    column < 0 ||
    column >= getTabColumns(tab) ||
    fret < 0 ||
    fret > MAX_FRET
  ) {
    return tab;
  }
  const existing = findTabNote(tab, string, column);
  const notes = tab.notes.filter(
    (note) => !(note.string === string && note.column === column),
  );
  return {
    ...tab,
    notes: [...notes, { ...existing, string, column, fret: Math.round(fret) }],
  };
}

export function clearTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): RepertoireTab {
  return pruneTabTransitions({
    ...tab,
    notes: tab.notes.filter(
      (note) => !(note.string === string && note.column === column),
    ),
  });
}

/** Nota anterior más cercana en la misma cuerda, si existe. */
export function findPreviousTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): RepertoireTabNote | undefined {
  let previous: RepertoireTabNote | undefined;
  for (const note of tab.notes) {
    if (note.string !== string || note.column >= column) continue;
    if (!previous || note.column > previous.column) previous = note;
  }
  return previous;
}

/** Primera nota de la misma cuerda después de esta columna. */
export function findNextTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): RepertoireTabNote | undefined {
  let next: RepertoireTabNote | undefined;
  for (const note of tab.notes) {
    if (note.string !== string || note.column <= column) continue;
    if (!next || note.column < next.column) next = note;
  }
  return next;
}

export function hasPreviousTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): boolean {
  return findPreviousTabNote(tab, string, column) !== undefined;
}

function replaceTabNote(
  tab: RepertoireTab,
  note: RepertoireTabNote,
): RepertoireTab {
  return {
    ...tab,
    notes: tab.notes.map((current) =>
      current.string === note.string && current.column === note.column ?
        note
      : current,
    ),
  };
}

/** Quita los ligados y deslizamientos cuya nota de origen ya no existe. */
export function pruneTabTransitions(tab: RepertoireTab): RepertoireTab {
  let changed = false;
  const notes = tab.notes.map((note) => {
    if (!note.legato && !note.slide) return note;
    if (findPreviousTabNote(tab, note.string, note.column)) return note;
    changed = true;
    const next = { ...note };
    delete next.legato;
    delete next.slide;
    return next;
  });
  return changed ? { ...tab, notes } : tab;
}

export function isTabTechniqueActive(
  note: RepertoireTabNote,
  id: TabTechniqueId,
): boolean {
  switch (id) {
    case "hammer":
      return note.legato === "hammer";
    case "pull":
      return note.legato === "pull";
    case "slideUp":
      return note.slide === "up";
    case "slideDown":
      return note.slide === "down";
    case "slidePosition":
      return note.slide === "position";
    case "bend":
      return !!note.bend && !note.bend.release && !note.bend.prebend;
    case "bendRelease":
      return !!note.bend && !!note.bend.release && !note.bend.prebend;
    case "prebend":
      return !!note.bend && !!note.bend.prebend && !note.bend.release;
    case "prebendRelease":
      return !!note.bend && !!note.bend.prebend && !!note.bend.release;
    case "vibratoSlight":
      return note.vibrato === "slight";
    case "vibratoWide":
      return note.vibrato === "wide";
    case "harmonicNatural":
      return note.harmonic === "natural";
    case "harmonicArtificial":
      return note.harmonic === "artificial";
    case "harmonicPinch":
      return note.harmonic === "pinch";
    case "harmonicTap":
      return note.harmonic === "tap";
    case "palmMute":
      return note.palmMute === true;
    case "letRing":
      return note.letRing === true;
    case "tapping":
      return note.tapping === true;
    case "dead":
      return note.dead === true;
    case "tremoloPicking":
      return note.tremoloPicking === true;
    case "trill":
      return note.trill === true;
    case "slap":
      return note.slap === true;
    case "pop":
      return note.pop === true;
  }
}

function applyTechniqueToNote(
  note: RepertoireTabNote,
  id: TabTechniqueId,
): RepertoireTabNote {
  const semitones = note.bend?.semitones ?? 1;
  switch (id) {
    case "hammer":
      return { ...note, legato: "hammer" };
    case "pull":
      return { ...note, legato: "pull" };
    case "slideUp":
      return { ...note, slide: "up" };
    case "slideDown":
      return { ...note, slide: "down" };
    case "slidePosition":
      return { ...note, slide: "position" };
    case "bend":
      return { ...note, bend: { semitones } };
    case "bendRelease":
      return { ...note, bend: { semitones, release: true } };
    case "prebend":
      return { ...note, bend: { semitones, prebend: true } };
    case "prebendRelease":
      return { ...note, bend: { semitones, prebend: true, release: true } };
    case "vibratoSlight":
      return { ...note, vibrato: "slight" };
    case "vibratoWide":
      return { ...note, vibrato: "wide" };
    case "harmonicNatural":
      return { ...note, harmonic: "natural" };
    case "harmonicArtificial":
      return { ...note, harmonic: "artificial" };
    case "harmonicPinch":
      return { ...note, harmonic: "pinch" };
    case "harmonicTap":
      return { ...note, harmonic: "tap" };
    case "palmMute":
      return { ...note, palmMute: true };
    case "letRing":
      return { ...note, letRing: true };
    case "tapping":
      return { ...note, tapping: true };
    case "dead":
      return { ...note, dead: true };
    case "tremoloPicking":
      return { ...note, tremoloPicking: true };
    case "trill":
      return { ...note, trill: true };
    case "slap":
      return { ...note, slap: true };
    case "pop":
      return { ...note, pop: true };
  }
}

function clearTechniqueFromNote(
  note: RepertoireTabNote,
  id: TabTechniqueId,
): RepertoireTabNote {
  if (!isTabTechniqueActive(note, id)) return note;
  const next = { ...note };
  switch (id) {
    case "hammer":
    case "pull":
      delete next.legato;
      break;
    case "slideUp":
    case "slideDown":
    case "slidePosition":
      delete next.slide;
      break;
    case "bend":
    case "bendRelease":
    case "prebend":
    case "prebendRelease":
      delete next.bend;
      break;
    case "vibratoSlight":
    case "vibratoWide":
      delete next.vibrato;
      break;
    case "harmonicNatural":
    case "harmonicArtificial":
    case "harmonicPinch":
    case "harmonicTap":
      delete next.harmonic;
      break;
    case "palmMute":
      delete next.palmMute;
      break;
    case "letRing":
      delete next.letRing;
      break;
    case "tapping":
      delete next.tapping;
      break;
    case "dead":
      delete next.dead;
      break;
    case "tremoloPicking":
      delete next.tremoloPicking;
      break;
    case "trill":
      delete next.trill;
      break;
    case "slap":
      delete next.slap;
      break;
    case "pop":
      delete next.pop;
      break;
  }
  return next;
}

export function setTabTechnique(
  tab: RepertoireTab,
  string: number,
  column: number,
  id: TabTechniqueId,
): RepertoireTab {
  const note = findTabNote(tab, string, column);
  const descriptor = getTabTechnique(id);
  if (!note || !descriptor) return tab;
  if (descriptor.isTransition && !hasPreviousTabNote(tab, string, column)) {
    return tab;
  }
  return replaceTabNote(tab, applyTechniqueToNote(note, descriptor.id));
}

export function clearTabTechnique(
  tab: RepertoireTab,
  string: number,
  column: number,
  id: TabTechniqueId,
): RepertoireTab {
  const note = findTabNote(tab, string, column);
  const descriptor = getTabTechnique(id);
  if (!note || !descriptor) return tab;
  return replaceTabNote(tab, clearTechniqueFromNote(note, descriptor.id));
}

export function toggleTabTechnique(
  tab: RepertoireTab,
  string: number,
  column: number,
  id: TabTechniqueId,
): RepertoireTab {
  const note = findTabNote(tab, string, column);
  const descriptor = getTabTechnique(id);
  if (!note || !descriptor) return tab;
  if (isTabTechniqueActive(note, descriptor.id)) {
    return clearTabTechnique(tab, string, column, descriptor.id);
  }
  return setTabTechnique(tab, string, column, descriptor.id);
}

/** Cambia los semitonos del bend de una nota, conservando sus marcadores. */
export function setTabBendAmount(
  tab: RepertoireTab,
  string: number,
  column: number,
  semitones: number,
): RepertoireTab {
  const note = findTabNote(tab, string, column);
  if (!note || !note.bend || !isTabBendAmount(semitones)) return tab;
  return replaceTabNote(tab, { ...note, bend: { ...note.bend, semitones } });
}

/** Cambia los semitonos del bend de todas las notas con bend de una selección. */
export function setTabBendAmounts(
  tab: RepertoireTab,
  cells: TabCell[],
  semitones: number,
): RepertoireTab {
  if (!isTabBendAmount(semitones)) return tab;
  let next = tab;
  for (const note of getSelectedTabNotes(tab, cells)) {
    if (note.bend) {
      next = setTabBendAmount(next, note.string, note.column, semitones);
    }
  }
  return next;
}

/**
 * Marcas puntuales de una nota: solo las técnicas que se dibujan con un glifo
 * sobre la nota. Los tramos, conexiones y marcas de duración se dibujan aparte
 * (ver `tabTechniqueSpans`, `tabTechniqueLinks` y `tabTechniqueHolds`).
 */
export function tabTechniqueGlyphs(note: RepertoireTabNote): string[] {
  return TAB_TECHNIQUES.filter(
    (technique) =>
      technique.render === "glyph" && isTabTechniqueActive(note, technique.id),
  ).map((technique) => technique.glyph);
}

/** Tramo de una técnica de bloque: columnas consecutivas que la llevan. */
export interface TabTechniqueSpan {
  techniqueId: TabTechniqueId;
  /** Primera columna del tramo (absoluta). */
  startColumn: number;
  /** Última columna del tramo (absoluta, incluida). */
  endColumn: number;
}

/**
 * Tramos de una técnica de bloque (`span`): se abre en la primera columna que
 * la lleva y se cierra en la última de la racha. Un hueco parte el tramo en dos.
 */
export function tabTechniqueSpans(
  tab: RepertoireTab,
  techniqueId: TabTechniqueId,
): TabTechniqueSpan[] {
  const descriptor = getTabTechnique(techniqueId);
  if (!descriptor || descriptor.render !== "span") return [];

  const columns = new Set<number>();
  for (const note of tab.notes) {
    if (isTabTechniqueActive(note, descriptor.id)) columns.add(note.column);
  }

  const spans: TabTechniqueSpan[] = [];
  for (const column of Array.from(columns).sort((a, b) => a - b)) {
    const last = spans[spans.length - 1];
    if (last && column === last.endColumn + 1) {
      last.endColumn = column;
    } else {
      spans.push({
        techniqueId: descriptor.id,
        startColumn: column,
        endColumn: column,
      });
    }
  }
  return spans;
}

/** Enlace de una técnica de conexión entre dos notas de la misma cuerda. */
export interface TabTechniqueLink {
  techniqueId: TabTechniqueId;
  string: number;
  /** Columna de la nota de la que sale el enlace. */
  fromColumn: number;
  /** Columna de la nota que lleva la técnica. */
  toColumn: number;
}

/**
 * Enlaces de una técnica de conexión (`connector`): cada nota que la lleva se
 * une con la nota anterior de su misma cuerda.
 */
export function tabTechniqueLinks(
  tab: RepertoireTab,
  techniqueId: TabTechniqueId,
): TabTechniqueLink[] {
  const descriptor = getTabTechnique(techniqueId);
  if (!descriptor || descriptor.render !== "connector") return [];

  const links: TabTechniqueLink[] = [];
  for (const note of tab.notes) {
    if (!isTabTechniqueActive(note, descriptor.id)) continue;
    const origin = findPreviousTabNote(tab, note.string, note.column);
    if (!origin) continue;
    links.push({
      techniqueId: descriptor.id,
      string: note.string,
      fromColumn: origin.column,
      toColumn: note.column,
    });
  }
  return links.sort(
    (a, b) => a.string - b.string || a.toColumn - b.toColumn,
  );
}

/** Marca de duración (`sustain`) sobre una nota. */
export interface TabTechniqueHold {
  techniqueId: TabTechniqueId;
  string: number;
  column: number;
  /** Columna hasta la que se dibuja la marca (siguiente nota o fin del sistema). */
  endColumn: number;
}

/** Marcas de duración de una técnica: desde la nota hasta la siguiente de su cuerda. */
export function tabTechniqueHolds(
  tab: RepertoireTab,
  techniqueId: TabTechniqueId,
): TabTechniqueHold[] {
  const descriptor = getTabTechnique(techniqueId);
  if (!descriptor || descriptor.render !== "sustain") return [];

  const holds: TabTechniqueHold[] = [];
  for (const note of tab.notes) {
    if (!isTabTechniqueActive(note, descriptor.id)) continue;
    const next = findNextTabNote(tab, note.string, note.column);
    holds.push({
      techniqueId: descriptor.id,
      string: note.string,
      column: note.column,
      endColumn: next ? next.column : note.column,
    });
  }
  return holds.sort(
    (a, b) => a.string - b.string || a.column - b.column,
  );
}

/** Tramo de una técnica de bloque ya recortado al sistema que lo dibuja. */
export interface TabSystemSpan extends TabTechniqueSpan {
  /** Si el tramo empieza de verdad aquí (y no viene de un sistema anterior). */
  opens: boolean;
}

/** Todo lo que un sistema dibuja fuera de las celdas. */
export interface TabSystemTechniques {
  spans: TabSystemSpan[];
  links: TabTechniqueLink[];
  holds: TabTechniqueHold[];
}

/**
 * Recorta tramos, enlaces y marcas de duración al sistema que los dibuja, para
 * que una tablatura que se parte en varios sistemas pinte la parte que le toca
 * en cada uno.
 */
export function tabSystemTechniques(
  tab: RepertoireTab,
  system: TabSystem,
): TabSystemTechniques {
  const first = system.startColumn;
  const last = system.startColumn + system.columnCount - 1;

  const spans: TabSystemSpan[] = [];
  for (const technique of TAB_TECHNIQUES) {
    if (technique.render !== "span") continue;
    for (const span of tabTechniqueSpans(tab, technique.id)) {
      const startColumn = Math.max(span.startColumn, first);
      const endColumn = Math.min(span.endColumn, last);
      if (startColumn > endColumn) continue;
      spans.push({
        techniqueId: span.techniqueId,
        startColumn,
        endColumn,
        opens: span.startColumn === startColumn,
      });
    }
  }

  const links: TabTechniqueLink[] = [];
  for (const technique of TAB_TECHNIQUES) {
    if (technique.render !== "connector") continue;
    for (const link of tabTechniqueLinks(tab, technique.id)) {
      if (link.fromColumn < first || link.toColumn > last) continue;
      links.push(link);
    }
  }

  const holds: TabTechniqueHold[] = [];
  for (const technique of TAB_TECHNIQUES) {
    if (technique.render !== "sustain") continue;
    for (const hold of tabTechniqueHolds(tab, technique.id)) {
      if (hold.column < first || hold.column > last) continue;
      holds.push({ ...hold, endColumn: Math.min(hold.endColumn, last) });
    }
  }

  return { spans, links, holds };
}

/** Celda de la rejilla que puede contener una nota. */
export interface TabCell {
  string: number;
  column: number;
}

/** Celdas del rectángulo entre dos celdas, ambas incluidas. */
export function tabCellsBetween(anchor: TabCell, focus: TabCell): TabCell[] {
  const minString = Math.min(anchor.string, focus.string);
  const maxString = Math.max(anchor.string, focus.string);
  const minColumn = Math.min(anchor.column, focus.column);
  const maxColumn = Math.max(anchor.column, focus.column);

  const cells: TabCell[] = [];
  for (let string = minString; string <= maxString; string += 1) {
    for (let column = minColumn; column <= maxColumn; column += 1) {
      cells.push({ string, column });
    }
  }
  return cells;
}

/** Notas que existen dentro de una selección, sin repetir celdas. */
export function getSelectedTabNotes(
  tab: RepertoireTab,
  cells: TabCell[],
): RepertoireTabNote[] {
  const notes: RepertoireTabNote[] = [];
  const seen = new Set<string>();
  for (const cell of cells) {
    const key = `${cell.string}:${cell.column}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const note = findTabNote(tab, cell.string, cell.column);
    if (note) notes.push(note);
  }
  return notes;
}

export type TabTechniqueSelectionState = "all" | "some" | "none";

/**
 * Si la técnica está en todas las notas seleccionadas (`all`), en algunas
 * (`some`) o en ninguna (`none`). Una selección sin notas es `none`.
 */
export function tabTechniqueSelectionState(
  tab: RepertoireTab,
  cells: TabCell[],
  id: TabTechniqueId,
): TabTechniqueSelectionState {
  const notes = getSelectedTabNotes(tab, cells);
  if (notes.length === 0) return "none";
  const active = notes.filter((note) => isTabTechniqueActive(note, id)).length;
  if (active === 0) return "none";
  if (active === notes.length) return "all";
  return "some";
}

/** Si la técnica se puede aplicar al menos a una nota de la selección. */
export function canApplyTabTechniqueToSelection(
  tab: RepertoireTab,
  cells: TabCell[],
  id: TabTechniqueId,
): boolean {
  const descriptor = getTabTechnique(id);
  if (!descriptor) return false;
  const notes = getSelectedTabNotes(tab, cells);
  if (notes.length === 0) return false;
  if (!descriptor.isTransition) return true;
  return notes.some((note) =>
    hasPreviousTabNote(tab, note.string, note.column),
  );
}

/**
 * Alterna una técnica en toda la selección: si todas las notas la tienen la
 * quita, y si no (ninguna o algunas) la aplica a las que pueden recibirla.
 */
export function toggleTabTechniques(
  tab: RepertoireTab,
  cells: TabCell[],
  id: TabTechniqueId,
): RepertoireTab {
  const descriptor = getTabTechnique(id);
  if (!descriptor) return tab;
  const notes = getSelectedTabNotes(tab, cells);
  const state = tabTechniqueSelectionState(tab, cells, descriptor.id);
  let next = tab;
  for (const note of notes) {
    next =
      state === "all" ?
        clearTabTechnique(next, note.string, note.column, descriptor.id)
      : setTabTechnique(next, note.string, note.column, descriptor.id);
  }
  return next;
}

export function setTabMeasures(
  tab: RepertoireTab,
  measures: number,
): RepertoireTab {
  const next = clamp(Math.round(measures) || 1, MIN_MEASURES, MAX_MEASURES);
  const columns = next * tab.subdivision;
  return pruneTabTransitions({
    ...tab,
    measures: next,
    notes: tab.notes.filter((note) => note.column < columns),
  });
}

/** Cambia la resolución conservando la posición temporal de las notas. */
export function setTabSubdivision(
  tab: RepertoireTab,
  subdivision: number,
): RepertoireTab {
  if (!isTabSubdivision(subdivision) || subdivision === tab.subdivision) {
    return tab;
  }
  const ratio = subdivision / tab.subdivision;
  const columns = tab.measures * subdivision;
  const byCell = new Map<string, RepertoireTabNote>();
  for (const note of tab.notes) {
    const column = clamp(Math.round(note.column * ratio), 0, columns - 1);
    byCell.set(`${note.string}:${column}`, { ...note, column });
  }
  return pruneTabTransitions({
    ...tab,
    subdivision,
    notes: [...byCell.values()],
  });
}

export function isMeasureStart(tab: RepertoireTab, column: number): boolean {
  return column > 0 && column % tab.subdivision === 0;
}

export interface TabSystem {
  /** Primera columna (índice absoluto) que dibuja el sistema. */
  startColumn: number;
  /** Número de columnas del sistema. */
  columnCount: number;
  /** Número de compás (1-based) con el que empieza el sistema. */
  firstMeasure: number;
}

/**
 * Reparte las columnas de la tablatura en sistemas (filas) de como mucho
 * `maxColumnsPerSystem` columnas. El corte siempre cae en un compás completo y
 * cada sistema muestra al menos un compás, aunque no quepa entero.
 */
export function groupTabSystems(
  tab: RepertoireTab,
  maxColumnsPerSystem: number,
): TabSystem[] {
  const columns = getTabColumns(tab);
  const measuresPerSystem = Math.max(
    1,
    Math.floor(maxColumnsPerSystem / tab.subdivision) || 1,
  );
  const columnsPerSystem = measuresPerSystem * tab.subdivision;

  const systems: TabSystem[] = [];
  for (let start = 0; start < columns; start += columnsPerSystem) {
    systems.push({
      startColumn: start,
      columnCount: Math.min(columnsPerSystem, columns - start),
      firstMeasure: start / tab.subdivision + 1,
    });
  }
  return systems;
}

/*
 * Geometría del editor de tablatura.
 *
 * El editor mide su rejilla y decide cuántas columnas caben, dónde cae el
 * centro de cada celda y qué rectángulo está seleccionado. Es cálculo puro, así
 * que vive aquí y no dentro del componente: se puede probar sin montar la
 * rejilla.
 */

/** Ancho de la columna con los nombres de las cuerdas. */
export const LABEL_WIDTH = 34;
/** Alto de cada fila de cuerda (h-9). */
export const STRING_ROW_HEIGHT = 36;
/** Ancho mínimo de celda que buscamos al decidir cuántos compases caben. */
export const MIN_CELL_WIDTH = 22;
/** Suelo del ancho de celda: por debajo de esto no se puede estrechar más. */
export const MIN_CELL_WIDTH_FLOOR = 8;
/**
 * Compases que el editor deja añadir con sus botones. Es un tope de interfaz,
 * más bajo que el del modelo de la tablatura (`MAX_MEASURES`), que admite hasta
 * 64 compases.
 */
export const TAB_EDITOR_MAX_MEASURES = 16;
/** Etiqueta corta de cada cantidad de bend admitida. */
export const BEND_AMOUNT_LABELS: Record<string, string> = {
  "0.25": "¼",
  "0.5": "½",
  "1": "1",
  "1.5": "1½",
  "2": "2",
};

/**
 * Cuerdas de la más aguda (arriba) a la más grave (abajo), como en una tab
 * real.
 */
export function getTabStringOrder(): number[] {
  return Array.from(
    { length: STRING_COUNT },
    (_, index) => STRING_COUNT - 1 - index,
  );
}

/** Ancho útil de la rejilla, descontada la columna de nombres. */
function getTabGridAvailableWidth(gridWidth: number): number {
  return Math.max(0, gridWidth - LABEL_WIDTH);
}

/**
 * Columnas que caben en el ancho medido, sin bajar de la subdivisión: por
 * debajo de un compás no se puede partir.
 */
export function getAvailableTabColumns(
  gridWidth: number,
  subdivision: number,
): number {
  return Math.max(
    subdivision,
    Math.floor(getTabGridAvailableWidth(gridWidth) / MIN_CELL_WIDTH),
  );
}

/**
 * Ancho de celda: el reparto del ancho útil entre las columnas del sistema más
 * lleno, con el suelo que evita celdas impracticables.
 */
export function getTabCellWidth(
  gridWidth: number,
  fullColumns: number,
): number {
  return Math.max(
    MIN_CELL_WIDTH_FLOOR,
    Math.floor(getTabGridAvailableWidth(gridWidth) / fullColumns),
  );
}

/**
 * Centro horizontal de una celda dentro de su sistema. La capa de anotaciones
 * usa la misma geometría que la rejilla: las celdas tienen ancho fijo y no hay
 * separación entre ellas.
 */
export function getTabCellCenterX(
  indexInSystem: number,
  cellWidth: number,
): number {
  return LABEL_WIDTH + indexInSystem * cellWidth + cellWidth / 2;
}

/** Centro vertical de una fila de cuerda, para la capa de anotaciones. */
export function getTabStringRowY(rowIndex: number): number {
  return rowIndex * STRING_ROW_HEIGHT + STRING_ROW_HEIGHT / 2;
}

/** Rectángulo de celdas que cubre de `anchor` a `focus`, ambas incluidas. */
export interface TabSelectionBounds {
  minString: number;
  maxString: number;
  minColumn: number;
  maxColumn: number;
}

/** Rectángulo que cubre de `anchor` a `focus`, sin importar en qué orden. */
export function getTabSelectionBounds(
  anchor: TabCell,
  focus: TabCell,
): TabSelectionBounds {
  return {
    minString: Math.min(anchor.string, focus.string),
    maxString: Math.max(anchor.string, focus.string),
    minColumn: Math.min(anchor.column, focus.column),
    maxColumn: Math.max(anchor.column, focus.column),
  };
}

/** Si una celda cae dentro del rectángulo de selección. */
export function isTabCellSelected(
  bounds: TabSelectionBounds,
  string: number,
  column: number,
): boolean {
  return (
    string >= bounds.minString &&
    string <= bounds.maxString &&
    column >= bounds.minColumn &&
    column <= bounds.maxColumn
  );
}

/** Celda dentro de los límites de la rejilla. */
export function clampTabCell(cell: TabCell, columnCount: number): TabCell {
  return {
    string: clamp(cell.string, 0, STRING_COUNT - 1),
    column: clamp(cell.column, 0, Math.max(0, columnCount - 1)),
  };
}
