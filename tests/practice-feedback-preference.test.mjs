import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PRACTICE_FEEDBACK_PREFERENCE,
  normalizePracticeFeedbackPreference,
  readPracticeFeedbackPreference,
  savePracticeFeedbackPreference,
  setPracticeFeedbackEnabled,
} from "../src/services/practice-feedback-preference.ts";

test("both metrics are off by default", () => {
  assert.deepEqual(DEFAULT_PRACTICE_FEEDBACK_PREFERENCE, {
    mood: false,
    focus: false,
  });
});

test("only explicit true values enable a metric", () => {
  assert.deepEqual(normalizePracticeFeedbackPreference({ mood: true }), {
    mood: true,
    focus: false,
  });
  assert.deepEqual(
    normalizePracticeFeedbackPreference({ mood: "true", focus: 1 }),
    { mood: false, focus: false },
  );
  assert.deepEqual(normalizePracticeFeedbackPreference(null), {
    mood: false,
    focus: false,
  });
  assert.deepEqual(normalizePracticeFeedbackPreference("mood"), {
    mood: false,
    focus: false,
  });
});

test("turning one metric on leaves the other untouched", () => {
  assert.deepEqual(
    setPracticeFeedbackEnabled({ mood: false, focus: true }, "mood", true),
    { mood: true, focus: true },
  );
  assert.deepEqual(
    setPracticeFeedbackEnabled({ mood: true, focus: true }, "focus", false),
    { mood: true, focus: false },
  );
});

test("returns the defaults when there is no browser storage", () => {
  assert.deepEqual(readPracticeFeedbackPreference(), {
    mood: false,
    focus: false,
  });
  assert.deepEqual(
    savePracticeFeedbackPreference({ mood: true, focus: false }),
    { mood: true, focus: false },
  );
});

test("round-trips the preference through local storage", () => {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };

  assert.deepEqual(readPracticeFeedbackPreference(), {
    mood: false,
    focus: false,
  });
  savePracticeFeedbackPreference({ mood: true, focus: true });
  assert.deepEqual(readPracticeFeedbackPreference(), {
    mood: true,
    focus: true,
  });

  values.set("thediary.practice-feedback", "{not json");
  assert.deepEqual(readPracticeFeedbackPreference(), {
    mood: false,
    focus: false,
  });

  delete globalThis.window;
});
