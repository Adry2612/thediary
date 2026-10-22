import assert from "node:assert/strict";
import test from "node:test";
import {
  clearTabNote,
  clearTabTechnique,
  createEmptyTab,
  findNextTabNote,
  findPreviousTabNote,
  findTabNote,
  getTabColumns,
  getTabTechnique,
  groupTabSystems,
  hasPreviousTabNote,
  normalizeTab,
  pruneTabTransitions,
  setTabMeasures,
  setTabNote,
  setTabSubdivision,
  setTabTechnique,
  TAB_TECHNIQUES,
  tabCellsBetween,
  tabSystemTechniques,
  tabTechniqueGlyphs,
  tabTechniqueHolds,
  tabTechniqueLinks,
  tabTechniqueSelectionState,
  tabTechniqueSpans,
  toggleTabTechniques,
  canApplyTabTechniqueToSelection,
  toggleTabTechnique,
} from "../src/lib/repertoire-tab.ts";
import {
  BEND_AMOUNT_LABELS,
  clampTabCell,
  getAvailableTabColumns,
  getTabCellCenterX,
  getTabCellWidth,
  getTabSelectionBounds,
  getTabStringOrder,
  getTabStringRowY,
  isTabCellSelected,
  LABEL_WIDTH,
  MAX_MEASURES,
  MIN_CELL_WIDTH,
  MIN_CELL_WIDTH_FLOOR,
  STRING_ROW_HEIGHT,
  TAB_BEND_AMOUNTS,
  TAB_EDITOR_MAX_MEASURES,
} from "../src/lib/repertoire-tab.ts";
import { STRING_COUNT } from "../src/lib/chords.ts";

test("creates an empty tab with the song tuning", () => {
  const tab = createEmptyTab("Drop D (DADGBE)");
  assert.equal(tab.tuning, "DADGBE");
  assert.equal(tab.subdivision, 16);
  assert.equal(getTabColumns(tab), 32);
  assert.deepEqual(tab.notes, []);
});

test("sets, finds and clears a note in a cell", () => {
  const tab = createEmptyTab();
  const withNote = setTabNote(tab, 2, 5, 7);
  assert.deepEqual(findTabNote(withNote, 2, 5), {
    string: 2,
    column: 5,
    fret: 7,
  });
  const replaced = setTabNote(withNote, 2, 5, 9);
  assert.equal(replaced.notes.length, 1);
  assert.equal(findTabNote(replaced, 2, 5).fret, 9);
  assert.deepEqual(clearTabNote(replaced, 2, 5).notes, []);
});

test("ignores out-of-range cells and frets", () => {
  const tab = createEmptyTab();
  assert.deepEqual(setTabNote(tab, 6, 0, 3).notes, []);
  assert.deepEqual(setTabNote(tab, 0, 0, 99).notes, []);
  assert.deepEqual(setTabNote(tab, 0, 999, 3).notes, []);
});

test("normalizes persisted tabs, dropping invalid notes", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 8,
    notes: [
      { string: 0, column: 0, fret: 5 },
      { string: 9, column: 0, fret: 5 },
      { string: 1, column: 99, fret: 5 },
      { string: 2, column: 3, fret: 40 },
    ],
  });
  assert.equal(tab.measures, 1);
  assert.equal(tab.subdivision, 8);
  assert.deepEqual(tab.notes, [
    { string: 0, column: 0, fret: 5 },
    { string: 1, column: 7, fret: 5 },
    { string: 2, column: 3, fret: 24 },
  ]);
});

test("removing measures drops notes outside the new range", () => {
  const tab = setTabNote(createEmptyTab(), 0, 20, 3);
  const shorter = setTabMeasures(tab, 1);
  assert.equal(shorter.measures, 1);
  assert.deepEqual(shorter.notes, []);
});

test("changing subdivision keeps the timing", () => {
  const tab = setTabNote(createEmptyTab(), 0, 8, 3);
  const eighth = setTabSubdivision(tab, 8);
  assert.equal(eighth.subdivision, 8);
  assert.equal(findTabNote(eighth, 0, 4).fret, 3);
});

test("groups a tab that fits into a single system", () => {
  const tab = createEmptyTab();
  const systems = groupTabSystems(tab, 64);
  assert.deepEqual(systems, [{ startColumn: 0, columnCount: 32, firstMeasure: 1 }]);
});

test("wraps systems at whole measure boundaries and numbers each one", () => {
  const tab = { ...createEmptyTab(), measures: 4, subdivision: 4 };
  const systems = groupTabSystems(tab, 5);
  assert.deepEqual(systems, [
    { startColumn: 0, columnCount: 4, firstMeasure: 1 },
    { startColumn: 4, columnCount: 4, firstMeasure: 2 },
    { startColumn: 8, columnCount: 4, firstMeasure: 3 },
    { startColumn: 12, columnCount: 4, firstMeasure: 4 },
  ]);
});

test("falls back to one measure per system when nothing else fits", () => {
  const tab = createEmptyTab();
  assert.deepEqual(groupTabSystems(tab, 8), [
    { startColumn: 0, columnCount: 16, firstMeasure: 1 },
    { startColumn: 16, columnCount: 16, firstMeasure: 2 },
  ]);
  assert.deepEqual(groupTabSystems(tab, 0), [
    { startColumn: 0, columnCount: 16, firstMeasure: 1 },
    { startColumn: 16, columnCount: 16, firstMeasure: 2 },
  ]);
});

test("rounds the columns per system down to a whole number of measures", () => {
  const tab = { ...createEmptyTab(), measures: 3, subdivision: 8 };
  const systems = groupTabSystems(tab, 20);
  assert.deepEqual(systems, [
    { startColumn: 0, columnCount: 16, firstMeasure: 1 },
    { startColumn: 16, columnCount: 8, firstMeasure: 3 },
  ]);
});

test("every system tiles the tab without gaps or overlaps", () => {
  const tab = { ...createEmptyTab(), measures: 5, subdivision: 4 };
  const systems = groupTabSystems(tab, 6);
  let next = 0;
  for (const system of systems) {
    assert.equal(system.startColumn, next);
    assert.equal(system.startColumn % tab.subdivision, 0);
    next += system.columnCount;
  }
  assert.equal(next, getTabColumns(tab));
});

test("applies, removes and toggles a technique on a note", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabTechnique(tab, 0, 4, "palmMute");
  assert.equal(findTabNote(tab, 0, 4).palmMute, true);
  assert.deepEqual(tabTechniqueGlyphs(findTabNote(tab, 0, 4)), []);
  tab = toggleTabTechnique(tab, 0, 4, "palmMute");
  assert.equal(findTabNote(tab, 0, 4).palmMute, undefined);
  tab = toggleTabTechnique(tab, 0, 4, "palmMute");
  assert.equal(findTabNote(tab, 0, 4).palmMute, true);
  tab = clearTabTechnique(tab, 0, 4, "palmMute");
  assert.equal(findTabNote(tab, 0, 4).palmMute, undefined);
});

test("does not apply a technique to an empty cell", () => {
  const tab = createEmptyTab();
  assert.deepEqual(setTabTechnique(tab, 0, 4, "palmMute").notes, []);
  assert.deepEqual(toggleTabTechnique(tab, 0, 4, "palmMute").notes, []);
});

test("changing the fret keeps the note's techniques", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabTechnique(tab, 0, 4, "tapping");
  tab = setTabNote(tab, 0, 4, 9);
  const note = findTabNote(tab, 0, 4);
  assert.equal(note.fret, 9);
  assert.equal(note.tapping, true);
});

test("a transition needs a note before it on the same string", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabTechnique(tab, 0, 4, "hammer");
  assert.equal(findTabNote(tab, 0, 4).legato, undefined);
  tab = setTabNote(tab, 0, 8, 7);
  tab = setTabTechnique(tab, 0, 8, "hammer");
  assert.equal(findTabNote(tab, 0, 8).legato, "hammer");
  tab = setTabTechnique(tab, 0, 8, "slidePosition");
  assert.equal(findTabNote(tab, 0, 8).slide, "position");
});

test("finds the nearest earlier note on the same string", () => {
  let tab = setTabNote(createEmptyTab(), 0, 2, 5);
  tab = setTabNote(tab, 0, 6, 7);
  tab = setTabNote(tab, 1, 4, 3);
  assert.equal(findPreviousTabNote(tab, 0, 8).column, 6);
  assert.equal(findPreviousTabNote(tab, 1, 4), undefined);
  assert.equal(hasPreviousTabNote(tab, 0, 8), true);
  assert.equal(hasPreviousTabNote(tab, 1, 4), false);
});

test("drops a transition when its source note is removed", () => {
  let tab = setTabNote(createEmptyTab(), 0, 2, 5);
  tab = setTabNote(tab, 0, 6, 7);
  tab = setTabTechnique(tab, 0, 6, "slideUp");
  assert.equal(findTabNote(tab, 0, 6).slide, "up");
  tab = clearTabNote(tab, 0, 2);
  assert.equal(findTabNote(tab, 0, 6).slide, undefined);
});

test("pruning keeps a transition that still has a source", () => {
  let tab = setTabNote(createEmptyTab(), 0, 2, 5);
  tab = setTabNote(tab, 0, 6, 7);
  tab = setTabTechnique(tab, 0, 6, "pull");
  const pruned = pruneTabTransitions(tab);
  assert.equal(findTabNote(pruned, 0, 6).legato, "pull");
});

test("keeps techniques when the resolution changes", () => {
  let tab = setTabNote(createEmptyTab(), 0, 8, 5);
  tab = setTabNote(tab, 0, 12, 7);
  tab = setTabTechnique(tab, 0, 8, "vibratoWide");
  tab = setTabTechnique(tab, 0, 12, "hammer");
  const eighth = setTabSubdivision(tab, 8);
  assert.equal(findTabNote(eighth, 0, 4).vibrato, "wide");
  assert.equal(findTabNote(eighth, 0, 6).legato, "hammer");
});

test("keeps techniques when measures are added", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabTechnique(tab, 0, 4, "tremoloPicking");
  const longer = setTabMeasures(tab, 4);
  assert.equal(findTabNote(longer, 0, 4).tremoloPicking, true);
});

test("removing a note removes its techniques", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabTechnique(tab, 0, 4, "dead");
  assert.deepEqual(clearTabNote(tab, 0, 4).notes, []);
});

test("lists several point marks on one note in table order", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabTechnique(tab, 0, 4, "tapping");
  tab = setTabTechnique(tab, 0, 4, "harmonicNatural");
  assert.deepEqual(tabTechniqueGlyphs(findTabNote(tab, 0, 4)), ["T", "NH"]);
});

test("draws each bend shape and vibrato distinctly", () => {
  const tab = setTabNote(createEmptyTab(), 0, 4, 5);
  const draws = (id) => getTabTechnique(id);
  for (const id of [
    "bend",
    "bendRelease",
    "prebend",
    "prebendRelease",
    "vibratoSlight",
    "vibratoWide",
    "trill",
  ]) {
    assert.equal(draws(id).render, "sustain");
    assert.ok(
      tabTechniqueHolds(setTabTechnique(tab, 0, 4, id), id).length === 1,
      `${id} should draw as a lasting mark`,
    );
  }
  assert.deepEqual(
    ["bend", "bendRelease", "prebend", "prebendRelease"].map(
      (id) => draws(id).glyph,
    ),
    ["b", "br", "pb", "pbr"],
  );
  assert.equal(draws("vibratoSlight").glyph, "~");
  assert.equal(draws("vibratoWide").glyph, "~~");
});

test("loads a tab saved before techniques unchanged", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 8,
    notes: [
      { string: 0, column: 0, fret: 5 },
      { string: 1, column: 2, fret: 7 },
    ],
  });
  assert.deepEqual(tab.notes, [
    { string: 0, column: 0, fret: 5 },
    { string: 1, column: 2, fret: 7 },
  ]);
});

test("drops unknown technique values and keeps the note", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 8,
    notes: [
      {
        string: 0,
        column: 0,
        fret: 5,
        legato: "teleport",
        slide: "sideways",
        vibrato: "extreme",
        harmonic: "cosmic",
        palmMute: "yes",
        bend: { semitones: 3 },
      },
    ],
  });
  assert.deepEqual(tab.notes, [{ string: 0, column: 0, fret: 5 }]);
});

test("keeps a valid bend with its prebend and release", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 8,
    notes: [
      {
        string: 0,
        column: 0,
        fret: 5,
        bend: { semitones: 0.5, prebend: true, release: true },
      },
    ],
  });
  assert.deepEqual(findTabNote(tab, 0, 0).bend, {
    semitones: 0.5,
    prebend: true,
    release: true,
  });
});

test("drops a stored transition whose source note is missing", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 8,
    notes: [
      { string: 0, column: 4, fret: 5, legato: "hammer" },
      { string: 1, column: 0, fret: 7 },
      { string: 1, column: 4, fret: 9, slide: "up" },
    ],
  });
  assert.equal(findTabNote(tab, 0, 4).legato, undefined);
  assert.equal(findTabNote(tab, 1, 4).slide, "up");
});

test("classifies every technique by how it is drawn", () => {
  const byRender = (render) =>
    TAB_TECHNIQUES.filter((technique) => technique.render === render).map(
      (technique) => technique.id,
    );
  assert.deepEqual(byRender("span"), [
    "palmMute",
    "letRing",
    "tremoloPicking",
  ]);
  assert.deepEqual(byRender("connector"), [
    "hammer",
    "pull",
    "slideUp",
    "slideDown",
    "slidePosition",
  ]);
  assert.deepEqual(byRender("sustain"), [
    "bend",
    "bendRelease",
    "prebend",
    "prebendRelease",
    "vibratoSlight",
    "vibratoWide",
    "trill",
  ]);
  assert.deepEqual(byRender("notehead"), ["dead"]);
  assert.equal(byRender("glyph").length, 7);
  // El palm mute y el let ring abren su tramo con una etiqueta; el trémolo lo
  // dibuja con marcas repetidas.
  assert.equal(getTabTechnique("palmMute").label, "P.M.");
  assert.equal(getTabTechnique("letRing").label, "L.R.");
  for (const technique of TAB_TECHNIQUES) {
    assert.ok(technique.glyph.length > 0, `${technique.id} needs a glyph`);
  }
});

test("groups consecutive notes of a span technique into one run", () => {
  let tab = createEmptyTab();
  for (const column of [1, 2, 3, 7]) {
    tab = setTabNote(tab, 0, column, 5);
    tab = setTabTechnique(tab, 0, column, "palmMute");
  }
  assert.deepEqual(tabTechniqueSpans(tab, "palmMute"), [
    { techniqueId: "palmMute", startColumn: 1, endColumn: 3 },
    { techniqueId: "palmMute", startColumn: 7, endColumn: 7 },
  ]);
  assert.deepEqual(tabTechniqueSpans(tab, "tapping"), []);
});

test("links a legato or a slide with the note it comes from", () => {
  let tab = setTabNote(createEmptyTab(), 0, 2, 5);
  tab = setTabNote(tab, 0, 4, 7);
  tab = setTabTechnique(tab, 0, 4, "hammer");
  assert.deepEqual(tabTechniqueLinks(tab, "hammer"), [
    { techniqueId: "hammer", string: 0, fromColumn: 2, toColumn: 4 },
  ]);
  let slid = setTabNote(createEmptyTab(), 1, 0, 3);
  slid = setTabNote(slid, 1, 6, 5);
  slid = setTabTechnique(slid, 1, 6, "slideUp");
  assert.deepEqual(tabTechniqueLinks(slid, "slideUp"), [
    { techniqueId: "slideUp", string: 1, fromColumn: 0, toColumn: 6 },
  ]);
  assert.deepEqual(tabTechniqueLinks(tab, "palmMute"), []);
});

test("reaches a lasting mark to the next note on its string", () => {
  let tab = setTabNote(createEmptyTab(), 0, 2, 5);
  tab = setTabNote(tab, 0, 6, 7);
  tab = setTabTechnique(tab, 0, 2, "vibratoSlight");
  assert.equal(findNextTabNote(tab, 0, 2).column, 6);
  assert.deepEqual(tabTechniqueHolds(tab, "vibratoSlight"), [
    { techniqueId: "vibratoSlight", string: 0, column: 2, endColumn: 6 },
  ]);
  assert.deepEqual(tabTechniqueHolds(tab, "hammer"), []);
});

test("clips spans to the system that draws them", () => {
  let tab = { ...createEmptyTab(), measures: 2, subdivision: 4 };
  for (const column of [0, 1, 2, 3, 4, 5]) {
    tab = setTabNote(tab, 0, column, 1);
    tab = setTabTechnique(tab, 0, column, "palmMute");
  }
  tab = setTabTechnique(tab, 0, 5, "letRing");
  assert.deepEqual(
    tabSystemTechniques(tab, {
      startColumn: 0,
      columnCount: 4,
      firstMeasure: 1,
    }).spans,
    [{ techniqueId: "palmMute", startColumn: 0, endColumn: 3, opens: true }],
  );
  assert.deepEqual(
    tabSystemTechniques(tab, {
      startColumn: 4,
      columnCount: 4,
      firstMeasure: 2,
    }).spans,
    [
      { techniqueId: "palmMute", startColumn: 4, endColumn: 5, opens: false },
      { techniqueId: "letRing", startColumn: 5, endColumn: 5, opens: true },
    ],
  );
});

test("keeps a link only when both of its notes fall inside the system", () => {
  let tab = { ...createEmptyTab(), measures: 2, subdivision: 4 };
  tab = setTabNote(tab, 0, 3, 5);
  tab = setTabNote(tab, 0, 5, 7);
  tab = setTabTechnique(tab, 0, 5, "hammer");
  assert.deepEqual(
    tabSystemTechniques(tab, {
      startColumn: 4,
      columnCount: 4,
      firstMeasure: 2,
    }).links,
    [],
  );
  assert.equal(
    tabSystemTechniques(tab, {
      startColumn: 0,
      columnCount: 8,
      firstMeasure: 1,
    }).links.length,
    1,
  );
});

test("every technique has a glyph and a non-conflicting letter shortcut", () => {
  const shortcuts = new Set();
  for (const technique of TAB_TECHNIQUES) {
    assert.ok(technique.glyph.length > 0, `${technique.id} has no glyph`);
    assert.match(technique.shortcut, /^[a-z]$/, `${technique.id} shortcut`);
    assert.ok(
      !shortcuts.has(technique.shortcut),
      `${technique.shortcut} is used twice`,
    );
    shortcuts.add(technique.shortcut);
  }
});

test("builds the rectangle of cells between two cells", () => {
  assert.deepEqual(tabCellsBetween({ string: 2, column: 3 }, { string: 1, column: 1 }), [
    { string: 1, column: 1 },
    { string: 1, column: 2 },
    { string: 1, column: 3 },
    { string: 2, column: 1 },
    { string: 2, column: 2 },
    { string: 2, column: 3 },
  ]);
  assert.deepEqual(tabCellsBetween({ string: 0, column: 4 }, { string: 0, column: 4 }), [
    { string: 0, column: 4 },
  ]);
});

test("applies a technique to every note in a selection at once", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabNote(tab, 0, 5, 6);
  tab = setTabNote(tab, 1, 5, 7);
  const cells = tabCellsBetween({ string: 0, column: 4 }, { string: 1, column: 5 });
  tab = toggleTabTechniques(tab, cells, "palmMute");
  assert.equal(findTabNote(tab, 0, 4).palmMute, true);
  assert.equal(findTabNote(tab, 0, 5).palmMute, true);
  assert.equal(findTabNote(tab, 1, 5).palmMute, true);
  assert.equal(
    tabTechniqueSelectionState(tab, cells, "palmMute"),
    "all",
  );
});

test("removes a technique from every note when all of them carry it", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabNote(tab, 0, 5, 6);
  const cells = tabCellsBetween({ string: 0, column: 4 }, { string: 0, column: 5 });
  tab = toggleTabTechniques(tab, cells, "dead");
  assert.equal(tabTechniqueSelectionState(tab, cells, "dead"), "all");
  tab = toggleTabTechniques(tab, cells, "dead");
  assert.equal(findTabNote(tab, 0, 4).dead, undefined);
  assert.equal(findTabNote(tab, 0, 5).dead, undefined);
  assert.equal(tabTechniqueSelectionState(tab, cells, "dead"), "none");
});

test("a partial selection reports some and completes on activation", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabNote(tab, 0, 5, 6);
  tab = setTabTechnique(tab, 0, 4, "dead");
  const cells = tabCellsBetween({ string: 0, column: 4 }, { string: 0, column: 5 });
  assert.equal(tabTechniqueSelectionState(tab, cells, "dead"), "some");
  tab = toggleTabTechniques(tab, cells, "dead");
  assert.equal(findTabNote(tab, 0, 5).dead, true);
  assert.equal(tabTechniqueSelectionState(tab, cells, "dead"), "all");
});

test("bulk apply ignores empty cells", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabNote(tab, 0, 9, 6);
  const cells = tabCellsBetween({ string: 0, column: 4 }, { string: 0, column: 9 });
  tab = toggleTabTechniques(tab, cells, "tapping");
  assert.equal(findTabNote(tab, 0, 4).tapping, true);
  assert.equal(findTabNote(tab, 0, 9).tapping, true);
  assert.equal(tab.notes.length, 2);
});

test("bulk apply only lands a transition where a preceding note exists", () => {
  let tab = setTabNote(createEmptyTab(), 0, 4, 5);
  tab = setTabNote(tab, 0, 8, 7);
  tab = setTabNote(tab, 1, 8, 3);
  const cells = tabCellsBetween({ string: 0, column: 8 }, { string: 1, column: 8 });
  assert.equal(canApplyTabTechniqueToSelection(tab, cells, "hammer"), true);
  tab = toggleTabTechniques(tab, cells, "hammer");
  assert.equal(findTabNote(tab, 0, 8).legato, "hammer");
  assert.equal(findTabNote(tab, 1, 8).legato, undefined);
});

test("a selection without notes cannot receive a technique", () => {
  const tab = createEmptyTab();
  const cells = tabCellsBetween({ string: 0, column: 1 }, { string: 0, column: 3 });
  assert.equal(canApplyTabTechniqueToSelection(tab, cells, "palmMute"), false);
  assert.deepEqual(toggleTabTechniques(tab, cells, "palmMute").notes, []);
});

test("orders the strings from the thinnest to the thickest", () => {
  assert.deepEqual(getTabStringOrder(), [5, 4, 3, 2, 1, 0]);
  assert.equal(getTabStringOrder().length, STRING_COUNT);
});

test("the editor's measure limit stays below the model's", () => {
  assert.equal(TAB_EDITOR_MAX_MEASURES, 16);
  assert.ok(TAB_EDITOR_MAX_MEASURES < MAX_MEASURES);
});

test("labels every bend amount the editor accepts", () => {
  for (const amount of TAB_BEND_AMOUNTS) {
    assert.equal(typeof BEND_AMOUNT_LABELS[String(amount)], "string");
  }
});

test("fits as many cells as the width allows, never fewer than a measure", () => {
  // (100 - 34) / 22 = 3 columnas.
  assert.equal(getAvailableTabColumns(100, 4), 4);
  assert.equal(getAvailableTabColumns(1000, 4), 43);
  assert.equal(getAvailableTabColumns(1000, 16), 43);
  assert.equal(getAvailableTabColumns(0, 8), 8);
  assert.equal(getAvailableTabColumns(LABEL_WIDTH - 10, 4), 4);
});

test("shares the width between the fullest system's columns", () => {
  // (1000 - 34) / 43 = 22.
  assert.equal(getTabCellWidth(1000, 43), 22);
  assert.equal(getTabCellWidth(1000, 100), 9);
  assert.equal(getTabCellWidth(1000, 200), MIN_CELL_WIDTH_FLOOR);
  assert.equal(getTabCellWidth(0, 4), MIN_CELL_WIDTH_FLOOR);
});

test("the minimum cell width is what the fitting uses", () => {
  const columns = getAvailableTabColumns(1000, 4);
  const cellWidth = getTabCellWidth(1000, columns);

  assert.ok(cellWidth >= MIN_CELL_WIDTH || cellWidth === MIN_CELL_WIDTH_FLOOR);
  assert.equal(cellWidth, MIN_CELL_WIDTH);
});

test("centers a cell inside its column, after the label column", () => {
  assert.equal(getTabCellCenterX(0, 20), LABEL_WIDTH + 10);
  assert.equal(getTabCellCenterX(3, 20), LABEL_WIDTH + 70);
});

test("centers a string row inside its row height", () => {
  assert.equal(getTabStringRowY(0), STRING_ROW_HEIGHT / 2);
  assert.equal(getTabStringRowY(2), STRING_ROW_HEIGHT * 2 + STRING_ROW_HEIGHT / 2);
});

test("builds the selection rectangle regardless of the drag direction", () => {
  const downRight = getTabSelectionBounds(
    { string: 1, column: 2 },
    { string: 4, column: 6 },
  );
  const upLeft = getTabSelectionBounds(
    { string: 4, column: 6 },
    { string: 1, column: 2 },
  );

  assert.deepEqual(downRight, {
    minString: 1,
    maxString: 4,
    minColumn: 2,
    maxColumn: 6,
  });
  assert.deepEqual(upLeft, downRight);
  assert.deepEqual(
    getTabSelectionBounds({ string: 3, column: 3 }, { string: 3, column: 3 }),
    { minString: 3, maxString: 3, minColumn: 3, maxColumn: 3 },
  );
});

test("includes the edges of the selection and excludes what is outside", () => {
  const bounds = getTabSelectionBounds(
    { string: 1, column: 2 },
    { string: 4, column: 6 },
  );

  assert.equal(isTabCellSelected(bounds, 1, 2), true);
  assert.equal(isTabCellSelected(bounds, 4, 6), true);
  assert.equal(isTabCellSelected(bounds, 3, 4), true);
  assert.equal(isTabCellSelected(bounds, 0, 4), false);
  assert.equal(isTabCellSelected(bounds, 5, 4), false);
  assert.equal(isTabCellSelected(bounds, 3, 7), false);
  assert.equal(isTabCellSelected(bounds, 3, 1), false);
});

test("clamps a cell to the strings and columns that exist", () => {
  assert.deepEqual(clampTabCell({ string: -3, column: -1 }, 10), {
    string: 0,
    column: 0,
  });
  assert.deepEqual(clampTabCell({ string: 99, column: 99 }, 10), {
    string: STRING_COUNT - 1,
    column: 9,
  });
  assert.deepEqual(clampTabCell({ string: 2, column: 4 }, 10), {
    string: 2,
    column: 4,
  });
  assert.deepEqual(clampTabCell({ string: 2, column: 4 }, 0), {
    string: 2,
    column: 0,
  });
});
