import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteBar,
  setBarSection,
  setBeatChord,
  setBeatText,
  setDynamic,
  setEndings,
  setGrace,
  setPickup,
  setRepeatEnd,
  toggleFermata,
  toggleHairpin,
  toggleRepeatStart,
  toggleStroke,
} from "../src/utils/tab-score/operations.ts";
import { copyBeats, pasteBeats } from "../src/utils/tab-score/clipboard.ts";
import { createHistory, pushHistory, undoHistory } from "../src/utils/tab-score/history.ts";
import { getRepeatRanges, normalizeTabScore } from "../src/utils/tab-score/model.ts";

function note(string, fret) {
  return { string, fret };
}

function beat(overrides = {}) {
  return { id: "b1", duration: 4, rest: false, notes: [note(0, 3)], ...overrides };
}

function bar(overrides = {}) {
  return {
    id: "bar-1",
    timeSignature: { numerator: 4, denominator: 4 },
    beats: [beat()],
    ...overrides,
  };
}

function score(bars) {
  return { version: 2, tuning: "EADGBE", tempo: 90, bars };
}

const selection = (overrides = {}) => ({ bar: 0, beat: 0, string: 0, ...overrides });

test("sets a dynamic on the first beat of the selection and removes it", () => {
  const value = score([bar({ beats: [beat(), beat({ id: "b2" })] })]);
  const set = setDynamic(value, { ...selection(), anchor: { bar: 0, beat: 1, string: 0 } }, "mf");
  assert.equal(set.score.bars[0].beats[0].dynamic, "mf");
  assert.equal(set.score.bars[0].beats[1].dynamic, undefined);

  const removed = setDynamic(set.score, selection(), null);
  assert.equal(removed.score.bars[0].beats[0].dynamic, undefined);
});

test("keeps a hairpin on the beats that were not cleared", () => {
  const value = score([
    bar({
      beats: [
        beat({ id: "b1" }),
        beat({ id: "b2" }),
        beat({ id: "b3" }),
        beat({ id: "b4" }),
      ],
    }),
  ]);
  const all = toggleHairpin(value, { ...selection(), anchor: { bar: 0, beat: 3, string: 0 } }, "crescendo");
  assert.deepEqual(
    all.score.bars[0].beats.map((entry) => entry.hairpin),
    ["crescendo", "crescendo", "crescendo", "crescendo"],
  );

  const partial = toggleHairpin(
    all.score,
    { bar: 0, beat: 1, string: 0, anchor: { bar: 0, beat: 2, string: 0 } },
    "crescendo",
  );
  assert.deepEqual(
    partial.score.bars[0].beats.map((entry) => entry.hairpin),
    ["crescendo", undefined, undefined, "crescendo"],
  );
});

test("sets and clears text, section and chord", () => {
  let value = setBeatText(score([bar()]), selection(), "let it ring").score;
  assert.equal(value.bars[0].beats[0].text, "let it ring");
  value = setBarSection(value, selection(), "Intro").score;
  assert.equal(value.bars[0].section, "Intro");
  value = setBeatChord(value, selection(), "Em").score;
  assert.equal(value.bars[0].beats[0].chord, "Em");

  value = setBeatText(value, selection(), null).score;
  value = setBarSection(value, selection(), null).score;
  value = setBeatChord(value, selection(), null).score;
  assert.equal(value.bars[0].beats[0].text, undefined);
  assert.equal(value.bars[0].section, undefined);
  assert.equal(value.bars[0].beats[0].chord, undefined);
});

test("caps a text at 40 characters and a section at 30", () => {
  const value = setBeatText(
    score([bar()]),
    selection(),
    "t".repeat(60),
  ).score;
  assert.equal(value.bars[0].beats[0].text.length, 40);

  const section = setBarSection(score([bar()]), selection(), "s".repeat(60)).score;
  assert.equal(section.bars[0].section.length, 30);
});

test("a stroke needs more than one note", () => {
  assert.deepEqual(
    toggleStroke(score([bar()]), selection(), "down"),
    { error: "strokeNeedsChord" },
  );

  const chord = score([
    bar({ beats: [beat({ notes: [note(0, 3), note(1, 5)] })] }),
  ]);
  const set = toggleStroke(chord, selection(), "down");
  assert.equal(set.score.bars[0].beats[0].stroke, "down");
  const removed = toggleStroke(set.score, selection(), "down");
  assert.equal(removed.score.bars[0].beats[0].stroke, undefined);
});

test("toggles a fermata", () => {
  const value = score([bar()]);
  const set = toggleFermata(value, selection());
  assert.equal(set.score.bars[0].beats[0].fermata, true);
  const removed = toggleFermata(set.score, selection());
  assert.equal(removed.score.bars[0].beats[0].fermata, undefined);
});

test("a grace note cannot be added to a rest", () => {
  assert.deepEqual(
    setGrace(score([bar({ beats: [beat({ notes: [], rest: true })] })]), selection(), {
      fret: 2,
      timing: "before",
    }),
    { error: "graceOnRest" },
  );

  const value = score([bar()]);
  const added = setGrace(value, selection(), { fret: 2, timing: "on" });
  assert.deepEqual(added.score.bars[0].beats[0].grace, { fret: 2, timing: "on" });
  const removed = setGrace(added.score, selection(), null);
  assert.equal(removed.score.bars[0].beats[0].grace, undefined);
});

test("opens and closes a repeat, and a close without start covers from the beginning", () => {
  let value = score([bar({ id: "b1" }), bar({ id: "b2" }), bar({ id: "b3" })]);
  value = toggleRepeatStart(value, selection({ bar: 1 })).score;
  assert.deepEqual(value.bars[1].repeat, { start: true });

  value = setRepeatEnd(value, selection({ bar: 2 }), 3).score;
  assert.deepEqual(value.bars[2].repeat, { end: 3 });
  assert.deepEqual(getRepeatRanges(value.bars), [{ start: 1, end: 2 }]);

  const closed = score([bar({ id: "b1" }), bar({ id: "b2" })]);
  const endOnly = setRepeatEnd(closed, selection({ bar: 1 }), 2).score;
  assert.deepEqual(getRepeatRanges(endOnly.bars), [{ start: 0, end: 1 }]);
  assert.deepEqual(setRepeatEnd(closed, selection({ bar: 1 }), 100), {
    error: "invalidRepeat",
  });
});

test("endings are only allowed inside a repeat", () => {
  const value = score([bar({ id: "b1" }), bar({ id: "b2", repeat: { end: 2 } })]);
  const set = setEndings(value, selection({ bar: 1 }), [1, 2, 2, 3]);
  assert.deepEqual(set.score.bars[1].endings, [1, 2, 3]);

  const noRepeat = score([bar({ id: "b1" }), bar({ id: "b2" })]);
  assert.deepEqual(setEndings(noRepeat, selection({ bar: 1 }), [1]), {
    error: "endingOutsideRepeat",
  });
});

test("removing the repeat end prunes endings that no longer belong to a repeat", () => {
  let value = score([bar({ id: "b1" }), bar({ id: "b2" })]);
  value = toggleRepeatStart(value, selection({ bar: 0 })).score;
  value = setRepeatEnd(value, selection({ bar: 1 }), 2).score;
  value = setEndings(value, selection({ bar: 1 }), [1]).score;
  assert.deepEqual(value.bars[1].endings, [1]);

  value = setRepeatEnd(value, selection({ bar: 1 }), null).score;
  assert.deepEqual(getRepeatRanges(value.bars), []);
  assert.equal(value.bars[1].endings, undefined);
});

test("a pickup only exists on the first bar", () => {
  const value = score([bar({ id: "b1" }), bar({ id: "b2" })]);
  const set = setPickup(value, selection(), true);
  assert.equal(set.score.bars[0].pickup, true);
  assert.deepEqual(setPickup(value, selection({ bar: 1 }), true), {
    error: "pickupNotFirstBar",
  });
});

test("copying and pasting a beat keeps its marks", () => {
  const value = score([
    bar({
      beats: [
        beat({ id: "b1", dynamic: "f", text: "let ring", fermata: true }),
        beat({ id: "b2" }),
      ],
    }),
  ]);
  const clipboard = copyBeats(value, selection());
  const pasted = pasteBeats(value, selection({ beat: 1 }), clipboard);

  assert.equal(pasted.score.bars[0].beats[1].dynamic, "f");
  assert.equal(pasted.score.bars[0].beats[1].text, "let ring");
  assert.equal(pasted.score.bars[0].beats[1].fermata, true);
});

test("deleting a bar removes its section and repeat marks", () => {
  const value = score([
    bar({ id: "b1", section: "Intro", repeat: { start: true } }),
    bar({ id: "b2" }),
  ]);
  const next = deleteBar(value, selection()).score;
  assert.equal(next.bars[0].section, undefined);
  assert.equal(next.bars[0].repeat, undefined);
});

test("undo removes a fermata added in the last step", () => {
  const value = score([bar()]);
  const added = toggleFermata(value, selection()).score;
  let history = createHistory(value, selection());
  history = pushHistory(history, added, selection());
  assert.equal(history.present.score.bars[0].beats[0].fermata, true);

  history = undoHistory(history);
  assert.equal(history.present.score.bars[0].beats[0].fermata, undefined);
});

test("normalizing an old score keeps the marks it did not have out", () => {
  const value = score([bar()]);
  assert.deepEqual(normalizeTabScore(value), value);
});
