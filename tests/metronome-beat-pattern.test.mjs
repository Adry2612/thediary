import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultBeatPattern,
  cycleBeatState,
  getBeatState,
  normalizeBeatPattern,
  toggleBeatAccent,
  toggleBeatMute,
} from "../src/utils/metronome-beat-pattern.ts";

test("the default pattern accents the first beat only", () => {
  assert.deepEqual(createDefaultBeatPattern(4), [
    "accent",
    "normal",
    "normal",
    "normal",
  ]);
  assert.deepEqual(createDefaultBeatPattern(1), ["accent"]);
  assert.deepEqual(createDefaultBeatPattern(0), ["accent"]);
  assert.deepEqual(createDefaultBeatPattern(Number.NaN), ["accent"]);
});

test("an absent or empty pattern falls back to the default", () => {
  assert.deepEqual(normalizeBeatPattern(undefined, 3), [
    "accent",
    "normal",
    "normal",
  ]);
  assert.deepEqual(normalizeBeatPattern([], 2), ["accent", "normal"]);
  assert.deepEqual(normalizeBeatPattern("accent", 2), ["accent", "normal"]);
});

test("a short stored pattern pads with normal beats", () => {
  assert.deepEqual(normalizeBeatPattern(["accent", "muted"], 4), [
    "accent",
    "muted",
    "normal",
    "normal",
  ]);
});

test("a long stored pattern is truncated to the meter", () => {
  assert.deepEqual(
    normalizeBeatPattern(["accent", "muted", "accent", "accent"], 2),
    ["accent", "muted"],
  );
});

test("unknown states become normal instead of breaking the meter", () => {
  assert.deepEqual(
    normalizeBeatPattern(["accent", "loud", null, 3], 4),
    ["accent", "normal", "normal", "normal"],
  );
});

test("a single click toggles the accent", () => {
  const pattern = ["accent", "normal", "normal", "normal"];

  assert.deepEqual(toggleBeatAccent(pattern, 1), [
    "accent",
    "accent",
    "normal",
    "normal",
  ]);
  assert.deepEqual(toggleBeatAccent(toggleBeatAccent(pattern, 1), 1), pattern);
});

test("accenting a muted beat replaces the mute", () => {
  assert.deepEqual(toggleBeatAccent(["muted", "normal"], 0), [
    "accent",
    "normal",
  ]);
});

test("a double click toggles the mute", () => {
  const pattern = ["accent", "normal", "normal", "normal"];

  assert.deepEqual(toggleBeatMute(pattern, 2), [
    "accent",
    "normal",
    "muted",
    "normal",
  ]);
  assert.deepEqual(toggleBeatMute(toggleBeatMute(pattern, 2), 2), pattern);
});

test("muting an accented beat replaces the accent", () => {
  assert.deepEqual(toggleBeatMute(["accent", "normal"], 0), [
    "muted",
    "normal",
  ]);
});

test("toggling one beat leaves the others untouched", () => {
  const pattern = ["accent", "muted", "normal", "accent"];
  const next = toggleBeatMute(pattern, 1);

  assert.deepEqual(next, ["accent", "normal", "normal", "accent"]);
  assert.deepEqual(pattern, ["accent", "muted", "normal", "accent"]);
});

test("reading a beat outside the pattern is normal", () => {
  assert.equal(getBeatState(["accent", "muted"], 1), "muted");
  assert.equal(getBeatState(["accent"], 5), "normal");
  assert.equal(getBeatState([], 0), "normal");
});

test("one activation cycles normal, open accent, closed accent and mute", () => {
  const start = ["normal", "normal"];
  const open = cycleBeatState(start, 0);
  const closed = cycleBeatState(open, 0);
  const muted = cycleBeatState(closed, 0);

  assert.deepEqual(open, ["accent", "normal"]);
  assert.deepEqual(closed, ["accentClosed", "normal"]);
  assert.deepEqual(muted, ["muted", "normal"]);
  assert.deepEqual(cycleBeatState(muted, 0), start);
  assert.deepEqual(start, ["normal", "normal"]);
});

test("a closed accent is a state of its own", () => {
  assert.deepEqual(normalizeBeatPattern(["accentClosed", "normal"], 2), [
    "accentClosed",
    "normal",
  ]);
  assert.equal(getBeatState(["accentClosed"], 0), "accentClosed");
});

test("cycling one beat leaves the rest alone", () => {
  assert.deepEqual(cycleBeatState(["accent", "muted", "normal"], 2), [
    "accent",
    "muted",
    "accent",
  ]);
});
