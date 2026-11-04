import assert from "node:assert/strict";
import test from "node:test";
import {
  TAB_PALETTE,
  TAB_PALETTE_GROUPS,
  getPaletteShortcuts,
  getPaletteState,
} from "../src/utils/tab-score/palette.ts";

function score(beats, overrides = {}) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      {
        id: "bar-a",
        timeSignature: { numerator: 4, denominator: 4 },
        beats,
      },
    ],
    ...overrides,
  };
}

function stateFor(scoreValue, selection, selectedBeats) {
  return getPaletteState({
    score: scoreValue,
    selection,
    selectedBeats: selectedBeats ?? [{ bar: selection.bar, beat: selection.beat }],
  });
}

test("marks a dotted eighth with palm mute as active", () => {
  const value = score([
    {
      id: "b1",
      duration: 8,
      dots: 1,
      rest: false,
      notes: [{ string: 0, fret: 3, palmMute: true }],
    },
  ]);
  const state = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(state["duration-8"].active, true);
  assert.equal(state["duration-4"].active, false);
  assert.equal(state.dots.active, true);
  assert.equal(state["palm-mute"].active, true);
  assert.equal(state["let-ring"].active, false);
});

test("disables a tie and a hammer-on without a previous note and explains why", () => {
  const value = score([
    { id: "b1", duration: 4, rest: false, notes: [{ string: 0, fret: 3 }] },
  ]);
  const state = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(state.tie.disabled, true);
  assert.equal(state.tie.reason, "requiresPreviousNote");
  assert.equal(state["legato-hammer"].disabled, true);
  assert.equal(state["legato-hammer"].reason, "requiresPreviousNote");
  assert.equal(state["slide-up"].disabled, true);
});

test("enables the tie once the previous beat has a note on the same string", () => {
  const value = score([
    { id: "b1", duration: 4, rest: false, notes: [{ string: 0, fret: 3 }] },
    { id: "b2", duration: 4, rest: false, notes: [{ string: 0, fret: 3 }] },
  ]);
  const state = stateFor(value, { bar: 0, beat: 1, string: 0 });

  assert.equal(state.tie.disabled, false);
  assert.equal(state.tie.active, false);
  assert.equal(state["legato-pull"].disabled, false);
});

test("disables techniques on an empty string and says a note is needed", () => {
  const value = score([{ id: "b1", duration: 4, rest: true, notes: [] }]);
  const state = stateFor(value, { bar: 0, beat: 0, string: 2 });

  assert.equal(state["palm-mute"].disabled, true);
  assert.equal(state["palm-mute"].reason, "requiresNote");
  assert.equal(state.rest.active, true);
});

test("marks the rest and the duration across a range", () => {
  const value = score([
    { id: "b1", duration: 8, rest: true, notes: [] },
    { id: "b2", duration: 8, rest: true, notes: [] },
    { id: "b3", duration: 4, rest: true, notes: [] },
  ]);
  const state = stateFor(
    value,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 1, string: 0 } },
    [
      { bar: 0, beat: 0 },
      { bar: 0, beat: 1 },
    ],
  );

  assert.equal(state["duration-8"].active, true);
  assert.equal(state.rest.active, true);
  assert.equal(state["duration-4"].active, false);
});

test("marks the bend amount, its release and its pre-bend", () => {
  const value = score([
    {
      id: "b1",
      duration: 4,
      rest: false,
      notes: [{ string: 0, fret: 3, bend: { semitones: 1, release: true } }],
    },
  ]);
  const state = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(state["bend-1"].active, true);
  assert.equal(state["bend-0.5"].active, false);
  assert.equal(state["bend-release"].active, true);
  assert.equal(state["bend-prebend"].active, false);
});

test("disables adding bars at the 64-bar limit", () => {
  const bars = Array.from({ length: 64 }, (_, index) => ({
    id: `bar-${index}`,
    beats: [{ id: `beat-${index}`, duration: 1, rest: true, notes: [] }],
  }));
  const value = score([], { bars });
  const state = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(state["bar-insert"].disabled, true);
  assert.equal(state["bar-append"].disabled, true);
  assert.equal(state["bar-duplicate"].disabled, true);
  assert.equal(state["bar-insert"].reason, "barLimit");
  assert.equal(state["bar-delete"].disabled, false);
});

test("explains why a beat cannot be split", () => {
  const smallest = score([{ id: "b1", duration: 64, rest: true, notes: [] }]);
  const tiny = stateFor(smallest, { bar: 0, beat: 0, string: 0 })["split-beat"];
  assert.equal(tiny.disabled, true);
  assert.equal(tiny.reason, "cannotSplit");

  const many = score(
    Array.from({ length: 64 }, (_, index) => ({
      id: `b${index}`,
      duration: 4,
      rest: true,
      notes: [],
    })),
  );
  const full = stateFor(many, { bar: 0, beat: 0, string: 0 });
  assert.equal(full["split-beat"].disabled, true);
  assert.equal(full["split-beat"].reason, "beatLimit");

  const normal = score([{ id: "b1", duration: 4, rest: true, notes: [] }]);
  const available = stateFor(normal, { bar: 0, beat: 0, string: 0 });
  assert.equal(available["split-beat"].disabled, false);
});

test("explains why a beat cannot move past the edge of its bar", () => {
  const value = score([
    { id: "b1", duration: 4, rest: true, notes: [] },
    { id: "b2", duration: 4, rest: true, notes: [] },
  ]);

  const first = stateFor(value, { bar: 0, beat: 0, string: 0 });
  assert.equal(first["move-left"].disabled, true);
  assert.equal(first["move-left"].reason, "noAdjacentBeat");
  assert.equal(first["move-right"].disabled, false);

  const last = stateFor(value, { bar: 0, beat: 1, string: 0 });
  assert.equal(last["move-right"].disabled, true);
  assert.equal(last["move-right"].reason, "noAdjacentBeat");
  assert.equal(last["move-left"].disabled, false);
});

test("every shortcut is unique and the catalogue has no repeated ids", () => {
  const shortcuts = TAB_PALETTE.filter((option) => option.shortcut);
  assert.equal(getPaletteShortcuts().size, shortcuts.length);

  const ids = new Set(TAB_PALETTE.map((option) => option.id));
  assert.equal(ids.size, TAB_PALETTE.length);
});

test("every group of the catalogue is rendered in the palette", () => {
  const groups = new Set(TAB_PALETTE.map((option) => option.group));
  for (const group of groups) {
    assert.ok(TAB_PALETTE_GROUPS.includes(group), group);
  }
  assert.ok(groups.has("tie"));
});

test("explains why a subdivided beat cannot be subdivided again", () => {
  const value = score([
    { id: "b1", duration: 8, tuplet: 3, rest: true, notes: [] },
  ]);
  const state = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(state.subdivision.active, true);
  assert.equal(state.subdivision.disabled, true);
  assert.equal(state.subdivision.reason, "alreadySubdivided");
});

test("enables the subdivision picker on a plain beat", () => {
  const value = score([
    { id: "b1", duration: 4, rest: true, notes: [] },
  ]);
  const state = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(state.subdivision.active, false);
  assert.equal(state.subdivision.disabled, false);
  assert.equal(state.subdivision.reason, undefined);
});

test("the new expression and structure options are in the catalogue", () => {
  const ids = new Set(TAB_PALETTE.map((option) => option.id));
  for (const id of [
    "dynamic-pp",
    "dynamic-p",
    "dynamic-mp",
    "dynamic-mf",
    "dynamic-f",
    "dynamic-ff",
    "hairpin-crescendo",
    "hairpin-decrescendo",
    "beat-text",
    "beat-chord",
    "stroke-down",
    "stroke-up",
    "stroke-rasgueado",
    "grace",
    "fermata",
    "repeat-start",
    "repeat-end",
    "ending",
    "section",
    "pickup",
  ]) {
    assert.equal(ids.has(id), true, id);
  }
});

test("marks the new options as active when the beat or bar carries them", () => {
  const value = {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      {
        id: "bar-a",
        timeSignature: { numerator: 4, denominator: 4 },
        section: "Intro",
        repeat: { start: true },
        pickup: true,
        beats: [
          {
            id: "b1",
            duration: 4,
            rest: false,
            notes: [
              { string: 0, fret: 3 },
              { string: 1, fret: 5 },
            ],
            dynamic: "mf",
            hairpin: "crescendo",
            text: "let it ring",
            chord: "Em",
            stroke: "down",
            fermata: true,
            grace: { fret: 2, timing: "before" },
          },
        ],
      },
      {
        id: "bar-b",
        repeat: { end: 2 },
        endings: [1],
        beats: [{ id: "b2", duration: 4, rest: true, notes: [] }],
      },
    ],
  };
  const first = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(first["dynamic-mf"].active, true);
  assert.equal(first["dynamic-f"].active, false);
  assert.equal(first["hairpin-crescendo"].active, true);
  assert.equal(first["beat-text"].active, true);
  assert.equal(first["beat-chord"].active, true);
  assert.equal(first["stroke-down"].active, true);
  assert.equal(first.grace.active, true);
  assert.equal(first.fermata.active, true);
  assert.equal(first["repeat-start"].active, true);
  assert.equal(first.section.active, true);
  assert.equal(first.pickup.active, true);

  const second = stateFor(value, { bar: 1, beat: 0, string: 0 });
  assert.equal(second["repeat-end"].active, true);
  assert.equal(second.ending.active, true);
  assert.equal(second["repeat-start"].active, false);
  assert.equal(second.pickup.disabled, true);
  assert.equal(second.pickup.reason, "pickupNotFirstBar");
});

test("explains why a grace, stroke or ending is unavailable", () => {
  const rest = stateFor(
    score([{ id: "b1", duration: 4, rest: true, notes: [] }]),
    { bar: 0, beat: 0, string: 0 },
  );
  assert.equal(rest.grace.disabled, true);
  assert.equal(rest.grace.reason, "graceOnRest");
  assert.equal(rest["stroke-down"].disabled, true);
  assert.equal(rest["stroke-down"].reason, "strokeNeedsChord");
  assert.equal(rest.ending.disabled, true);
  assert.equal(rest.ending.reason, "endingOutsideRepeat");
});

test("a stroke is available with two notes", () => {
  const value = score([
    {
      id: "b1",
      duration: 4,
      rest: false,
      notes: [
        { string: 0, fret: 3 },
        { string: 1, fret: 5 },
      ],
    },
  ]);
  const state = stateFor(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(state["stroke-down"].disabled, false);
  assert.equal(state["stroke-down"].reason, undefined);
  assert.equal(state["stroke-up"].disabled, false);
});
