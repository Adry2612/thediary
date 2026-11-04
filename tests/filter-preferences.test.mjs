import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_RECORDING_FILTER_PREFERENCES,
  normalizeRecordingFilterPreferences,
} from "../src/services/recording-filter-preferences.ts";
import {
  DEFAULT_REPERTOIRE_FILTER_PREFERENCES,
  normalizeRepertoireFilterPreferences,
} from "../src/services/repertoire-filter-preferences.ts";

test("repertoire filters keep the values the user applied", () => {
  const preferences = normalizeRepertoireFilterPreferences({
    query: "metallica",
    progress: "learning",
    guitarType: "electric",
    futureLearn: "current",
    sort: "practice",
    groupBy: "artist",
  });

  assert.deepEqual(preferences, {
    query: "metallica",
    progress: "learning",
    guitarType: "electric",
    futureLearn: "current",
    sort: "practice",
    groupBy: "artist",
  });
});

test("invalid repertoire filters fall back one by one", () => {
  const preferences = normalizeRepertoireFilterPreferences({
    query: 42,
    progress: "done",
    guitarType: "bass",
    futureLearn: "later",
    sort: "random",
    groupBy: "genre",
  });

  assert.deepEqual(preferences, DEFAULT_REPERTOIRE_FILTER_PREFERENCES);
});

test("a stored repertoire filter with a missing field keeps the rest", () => {
  const preferences = normalizeRepertoireFilterPreferences({
    guitarType: "acoustic",
    sort: "title",
  });

  assert.equal(preferences.guitarType, "acoustic");
  assert.equal(preferences.sort, "title");
  assert.equal(preferences.progress, "all");
  assert.equal(preferences.futureLearn, "all");
  assert.equal(preferences.groupBy, "none");
  assert.equal(preferences.query, "");
});

test("recording filters keep the block, name and order", () => {
  const preferences = normalizeRecordingFilterPreferences({
    phaseOrder: "2",
    phaseName: "riff",
    sort: "name",
  });

  assert.deepEqual(preferences, {
    phaseOrder: "2",
    phaseName: "riff",
    sort: "name",
  });
});

test("invalid recording filters fall back to the initial state", () => {
  const preferences = normalizeRecordingFilterPreferences({
    phaseOrder: 2,
    phaseName: null,
    sort: "random",
  });

  assert.deepEqual(preferences, DEFAULT_RECORDING_FILTER_PREFERENCES);
});
