# Design

## Context

See `proposal.md` for motivation and `specs/repertoire-song-editor/spec.md` for the required behavior.

Current state that shapes the approach:

- `RepertoireTabNote` is `{ string, fret, column }`; `RepertoireTab` is `{ tuning, measures, subdivision, notes }` (`src/types/practice.ts`).
- `normalizeTab` validates and rebuilds the note list on load: it clamps `string`, `column`, and `fret`, dedupes by `string:column`, and drops invalid notes. Every read path goes through it, so it is the single place to validate new fields.
- `setTabNote` replaces the note at a cell by filtering then appending; `clearTabNote` filters it out. `setTabSubdivision` maps `column` by a ratio and spreads the note (`{ ...note, column }`), so any extra fields already survive a resolution change.
- `TabEditor` is a grid of cells with an `anchor`/`focus` selection, digit-key fret entry, arrow navigation, and a small control row (resolution, measures, fret field, clear cell, clear all). Letters are free on the keyboard; digits and arrows are taken.
- The tab is rendered by hand as columns of buttons; there is no music font in the grid. `public/alphatab/font/Bravura.woff2` exists but is only used by the read-only alphaTab viewer.
- alphaTab is a dependency but is used only as a viewer for attached Guitar Pro files.

## Goals / Non-Goals

**Goals:**

- A data model that can represent the standard technique set per note, and the legato/slide transitions between notes on a string, without disturbing notes that have none.
- An editing flow that fits the existing keyboard-first grid, is discoverable through a palette, and can act on a range of notes at once rather than one note at a time.
- Honest notation: each technique is drawn the way a standard tab draws it — a span over the run, a link between two notes, a mark that lasts over the note, a glyph on the note, or an `x` head — so the tab reads like the tabs the user already knows.
- A model the planned playback change can read directly: each note already says how it is played and from which note it comes.

**Non-Goals:**

- Audio or MIDI playback (separate change).
- Import/export and any interchange format (still deferred).
- Rhythmic notation beyond the grid's fixed resolution: no explicit durations, ties, rests, or time signatures.
- Techniques that need information the grid does not hold: left-hand fingering, dynamics and accents, note velocity, and capo-aware written pitch.

## Decisions

### 1. Techniques live as optional fields on `RepertoireTabNote`, split into transitions and modifiers

Transitions (they need another note) and modifiers (they describe this note alone) are different shapes and are validated differently:

```ts
type TabLegato = "hammer" | "pull";
type TabSlide = "up" | "down" | "position";
type TabHarmonic = "natural" | "artificial" | "pinch" | "tap";
type TabVibrato = "slight" | "wide";

interface TabBend {
  semitones: number;        // 0.25 = quarter, 0.5 = half, 1 = whole, 1.5, 2
  release?: boolean;
  prebend?: boolean;
}

interface RepertoireTabNote {
  string: number;
  fret: number;
  column: number;
  legato?: TabLegato;       // transition from the earlier note on the same string
  slide?: TabSlide;         // transition into this note
  bend?: TabBend;
  vibrato?: TabVibrato;
  palmMute?: boolean;
  letRing?: boolean;
  tapping?: boolean;
  harmonic?: TabHarmonic;
  dead?: boolean;           // the "x" note, no fretted pitch
  tremoloPicking?: boolean;
  trill?: boolean;
  slap?: boolean;
  pop?: boolean;
}
```

All fields are optional, so a note with no techniques is byte-identical in meaning to today's notes and older tabs need no migration.

Alternatives considered:

- A free-form `techniques: string[]`: rejected because bend needs a structured amount, and a string list lets contradictory values coexist (for example two slides).
- A separate `techniques` collection keyed by note id: rejected because notes have no stable id today — they are addressed by `string:column`, and that identity already changes when the resolution changes.
- Enumerating every Guitar Pro articulation (including accents, staccato, fingering): rejected as out of scope for the grid, per Non-Goals.

### 2. Transitions resolve to the nearest earlier note on the same string, and are dropped when it disappears

A note's `legato`/`slide` means "played from the nearest note before it on this string". The helpers find that note by scanning the same string for the greatest `column` smaller than the note's, in the same measure or an earlier one. Because the reference is derived rather than stored as an id, no dangling reference can be persisted; when the earlier note is removed, the transition is meaningless and is dropped by the helper that removes notes. `normalizeTab` keeps a stored transition only when a preceding note exists on that string.

Alternatives considered:

- Storing the referenced note's `{ string, column }`: rejected because resolution changes rewrite columns and would silently break the pointer.
- Applying the transition to the *source* note as a "tie forward" flag: rejected because reading a note then requires looking at the next one, and the same information is expressed more directly on the destination.

### 3. Editing uses a technique palette plus single-key shortcuts, both driven by one descriptor table

A `TAB_TECHNIQUES` table (id, label, shortcut, glyph, whether it is a transition) drives the palette buttons, the shortcut handling, the legend, and the tests, so a technique is described once. New helpers in `src/lib/repertoire-tab.ts` do the work: `setTabTechnique(tab, string, column, id)`, `clearTabTechnique(...)`, and `toggleTabTechnique(...)`, which return the tab unchanged when the cell has no note or when a transition has no preceding note.

Shortcuts: letters that are not used by fret entry or navigation — for example `H` hammer-on, `P` pull-off, `/` slide up, `\` slide down, `S` position slide, `B` bend, `V` vibrato, `M` palm mute, `L` let ring, `T` tapping, `O` harmonic, `X` dead note, `R` tremolo, and a key for trill, slap, and pop. The exact letters are settled in implementation, but the table is the single source and the binding must not shadow digits or arrows.

Alternatives considered:

- A modal "technique mode": rejected as a heavier interaction than the grid needs; a palette plus shortcuts is enough.
- A context menu on right-click: rejected because the grid is keyboard-first and menus interrupt the flow.

### 4. Notation follows the shape a standard tab uses for each technique

Rather than a single "one glyph per note" treatment, the descriptor table gains a `render` field and each technique is drawn the way Guitar Pro and alphaTab — the standard the app already ships as a viewer, and the reference the user asked to match — draw it:

| `render` | Techniques | Drawing |
| --- | --- | --- |
| `span` | palm mute, let ring, tremolo picking | One bracket over the run: it opens at the first note, runs across the whole run, and closes with a terminator; a gap breaks it into two |
| `connector` | hammer-on, pull-off, slide (up, down, position) | A link between the note and the earlier note on the same string it comes from, labelled `h` / `p` / `/` / `\` / `s` |
| `sustain` | bend (plain, release, prebend, prebend-release), vibrato (slight, wide), trill | A mark that starts on the note and reaches across the time it sounds |
| `glyph` | tapping, harmonics (natural, artificial, pinch, tap), slap, pop | A compact glyph on the note |
| `notehead` | dead note | The fret number is replaced by `x` |

Spans, links, and sustains are drawn in a thin annotation layer above the string rows, positioned from the column index and the fixed cell width, so a wrapped system draws the part of every shape that falls inside it. Because the grid is a plain flex layout of fixed-width, gapless cells, the layer needs no measurement beyond the cell width the editor already computes, and a test pins that geometry. The palette doubles as the legend, showing each technique with the shape it is drawn with.

Alternatives considered:

- A glyph on every note (what the first cut did): rejected because a palm-muted passage then reads `PM PM PM PM` instead of one `P.M. ────|`, which is what a real tab does and what Guitar Pro and alphaTab render.
- The Bravura music font (already in `public/`): still rejected as the default; these are text glyphs and pulling a music font into the grid adds a layout dependency for no functional gain. It stays an option if true engraving is ever needed.
- Storing the spans and links: rejected in decision 6; they are computed from the stored per-note techniques at render time.

### 5. `normalizeTab` is the only validator, and it degrades per field

`normalizeTab` validates each optional field independently: a bad `legato`/`slide`/`harmonic`/`vibrato` string, a non-boolean modifier, a bend whose `semitones` is not within `{0.25, 0.5, 1, 1.5, 2}`, or a transition with no preceding note is dropped, while the note's `string`, `fret`, and `column` are always kept. This satisfies the compatibility requirement and keeps a corrupt field from deleting a note.

### 6. Selection is a rectangular anchor/focus range, and bulk toggling has three states

The editor keeps an `anchor` cell and a `focus` cell instead of a single cursor. The selection is every cell in the rectangle between them (`tabCellsBetween`), and the focus cell stays the one that receives fret entry, so digits and the fret field keep working unchanged. Interactions: a plain press sets both anchor and focus; dragging extends focus; Shift + click extends focus; Shift + arrows move focus; a plain arrow or click resets both.

The palette and the shortcuts act on the whole selection through `toggleTabTechniques(tab, cells, id)`, and the button state comes from `tabTechniqueSelectionState`:

- `none` → activating sets the technique on every selected note that can take it.
- `some` → activating sets it on the rest, completing the selection.
- `all` → activating removes it from every selected note.

Empty cells are ignored (there is no note to change) and a transition is applied only to the selected notes that have an earlier note on their string; the rest are left alone. This keeps the per-note model — and therefore Guitar Pro / MusicXML semantics and the future playback change — untouched.

Alternatives considered:

- Storing a technique once over a time range (a span) in the stored data: rejected because it changes the model, complicates playback and export, and diverges from how Guitar Pro and MusicXML represent these techniques (per note, with a destination note marking the end of the run). The bracket the user sees is derived from those per-note flags at render time instead.
- A separate "apply to whole column" and "apply to whole measure" command: rejected as redundant, since dragging over a column or a measure selects exactly those cells.

## Risks / Trade-offs

- [A note can now carry contradictory combinations, e.g. `dead` plus a `bend`] → Keep the model permissive and let the descriptor table decide what the palette offers; a later change can add combination rules if they matter. Playback only reads what it understands.
- [Techniques silently dropped when their preceding note is removed] → Intended and specified; it is the honest reading of "played from the previous note". The palette shows the transition as unavailable once its source is gone.
- [The shortcut table can collide with future grid keys] → One table owns the bindings, and a test asserts that no shortcut shadows a digit or an arrow key.
- [Glyphs are text and can render differently across platforms] → Keep glyphs ASCII where possible and cover the mapping with a unit test; the legend and the shape it shows remove ambiguity for the user.
- [The annotation layer is positioned from the cell width, so it can drift if the cells ever gain a gap or a variable width] → The grid is a flex row of fixed-width, gapless cells, and a test pins the derived geometry (column index to x) so a future style change that breaks the assumption fails loudly.
- [Several span techniques at once stack rows and can look cramped at one measure per system on narrow screens] → Stack at most one thin row per span technique that is active in a system; revisit only if it actually hurts readability.

## Migration Plan

No data migration. Every new field is optional, `normalizeTab` already runs on load and save, and tabs saved without techniques load unchanged. Rollback is reverting the commit; persisted tabs remain valid because the extra fields are optional.

## Open Questions

None. Playback is a deliberate follow-up change, not an open question here; this design only ensures the model already records what playback will need (how the note is played, and which note it comes from).
