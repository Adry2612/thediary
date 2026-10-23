import assert from "node:assert/strict";
import test from "node:test";
import {
  getChordAtPosition,
  lyricsToChart,
  normalizeChordChart,
  removeChordFromLine,
  setChordOnLine,
} from "../src/utils/repertoire-chord-chart.ts";

let counter = 0;
function createId() {
  counter += 1;
  return `id-${counter}`;
}

function withChordAt(text, position, name = "G") {
  const chart = lyricsToChart(text, createId);
  return setChordOnLine(chart, chart.lines[0].id, {
    id: `chord-${name}`,
    name,
    position,
  });
}

test("splits lyrics into lines and keeps the chords of unchanged lines", () => {
  const first = lyricsToChart("Hello world\n\nSecond line", createId);
  assert.equal(first.lines.length, 3);
  assert.equal(first.lines[1].text, "");

  const withChord = setChordOnLine(first, first.lines[0].id, {
    id: "chord-1",
    name: "C",
    position: 6,
  });
  const reloaded = lyricsToChart(
    "Hello world\n\nSecond line",
    createId,
    withChord,
  );
  assert.equal(reloaded.lines[0].chords.length, 1);
  assert.equal(reloaded.lines[0].chords[0].name, "C");
});

test("a chord can sit anywhere: mid-word, in a gap or at the end", () => {
  const chart = lyricsToChart("Amazing grace", createId);
  const lineId = chart.lines[0].id;
  let next = setChordOnLine(chart, lineId, { id: "a", name: "C", position: 2 });
  next = setChordOnLine(next, lineId, { id: "b", name: "G", position: 7 });
  next = setChordOnLine(next, lineId, { id: "c", name: "F", position: 13 });

  assert.equal(getChordAtPosition(next.lines[0], 2).name, "C");
  assert.equal(getChordAtPosition(next.lines[0], 7).name, "G");
  assert.equal(getChordAtPosition(next.lines[0], 13).name, "F");
});

test("assigning a chord replaces the one at the same position", () => {
  const chart = withChordAt("Hello world", 6, "C");
  const withAm = setChordOnLine(chart, chart.lines[0].id, {
    id: "b",
    name: "Am",
    position: 6,
  });
  assert.equal(withAm.lines[0].chords.length, 1);
  assert.equal(getChordAtPosition(withAm.lines[0], 6).name, "Am");
});

test("removing a chord leaves the rest untouched", () => {
  let chart = withChordAt("Hello world", 0, "C");
  const lineId = chart.lines[0].id;
  chart = setChordOnLine(chart, lineId, { id: "b", name: "G", position: 6 });
  chart = removeChordFromLine(chart, lineId, 0);
  assert.deepEqual(
    chart.lines[0].chords.map((chord) => chord.name),
    ["G"],
  );
});

test("inserting text before a chord pushes the chord along", () => {
  const chart = withChordAt("Hello world", 6, "G");
  const edited = lyricsToChart("Hey Hello world", createId, chart);
  assert.equal(edited.lines[0].chords.length, 1);
  assert.equal(edited.lines[0].chords[0].position, 10);
});

test("a chord re-anchors to the following word when one is inserted", () => {
  const chart = withChordAt("Hello world", 6, "G");
  const edited = lyricsToChart("Hello brave world", createId, chart);
  assert.deepEqual(
    edited.lines[0].chords.map((chord) => [chord.name, chord.position]),
    [["G", 12]],
  );
});

test("deleting text before a chord moves it back", () => {
  const chart = withChordAt("Hello world", 6, "G");
  const edited = lyricsToChart("world", createId, chart);
  assert.equal(edited.lines[0].chords.length, 1);
  assert.equal(edited.lines[0].chords[0].position, 0);
});

test("appending text at the end keeps the chord in place", () => {
  const chart = withChordAt("Hello world", 6, "G");
  const edited = lyricsToChart("Hello world!", createId, chart);
  assert.equal(edited.lines[0].chords.length, 1);
  assert.equal(edited.lines[0].chords[0].position, 6);
});

test("rewriting the anchored word drops the chord", () => {
  const chart = withChordAt("Amazing grace", 0, "A");
  const edited = lyricsToChart("Awesome grace", createId, chart);
  assert.deepEqual(edited.lines[0].chords, []);
});

test("normalization clamps the position and keeps chords over gaps", () => {
  const chart = normalizeChordChart({
    lines: [
      {
        id: "l1",
        text: "Hello",
        chords: [
          { id: "c1", name: "C", position: 99 },
          { id: "c2", name: "G", position: 2 },
          { id: "c3", position: 1 },
        ],
      },
    ],
  });
  assert.deepEqual(
    chart.lines[0].chords.map((chord) => [chord.name, chord.position]),
    [
      ["G", 2],
      ["C", 5],
    ],
  );
});
