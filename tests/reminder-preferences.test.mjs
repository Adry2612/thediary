import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_REMINDER_PREFERENCES,
  normalizeReminderInactivityDays,
  normalizeReminderPreferences,
  normalizeReminderTime,
} from "../src/services/reminder-preferences.ts";

test("keeps a valid stored configuration", () => {
  assert.deepEqual(
    normalizeReminderPreferences({
      enabled: true,
      practice: false,
      strings: true,
      inactivity: false,
      time: "08:15",
      inactivityDays: 14,
    }),
    {
      enabled: true,
      practice: false,
      strings: true,
      inactivity: false,
      time: "08:15",
      inactivityDays: 14,
    },
  );
});

test("turns reminders off and keeps the defaults for an empty value", () => {
  assert.deepEqual(normalizeReminderPreferences(null), DEFAULT_REMINDER_PREFERENCES);
  assert.deepEqual(normalizeReminderPreferences({}), DEFAULT_REMINDER_PREFERENCES);
  assert.deepEqual(
    normalizeReminderPreferences("not an object"),
    DEFAULT_REMINDER_PREFERENCES,
  );
  assert.deepEqual(normalizeReminderPreferences([]), DEFAULT_REMINDER_PREFERENCES);
});

test("an invalid field falls back to its default without losing the rest", () => {
  assert.deepEqual(
    normalizeReminderPreferences({
      enabled: "yes",
      practice: false,
      strings: 1,
      inactivity: true,
      time: "25:00",
      inactivityDays: 9,
    }),
    {
      enabled: false,
      practice: false,
      strings: true,
      inactivity: true,
      time: "19:00",
      inactivityDays: 7,
    },
  );
});

test("accepts only whole hours and minutes inside the day", () => {
  assert.equal(normalizeReminderTime("00:00"), "00:00");
  assert.equal(normalizeReminderTime("23:59"), "23:59");
  assert.equal(normalizeReminderTime("9:00"), "19:00");
  assert.equal(normalizeReminderTime("19:60"), "19:00");
  assert.equal(normalizeReminderTime(1900), "19:00");
});

test("accepts only the offered inactivity thresholds", () => {
  assert.equal(normalizeReminderInactivityDays(3), 3);
  assert.equal(normalizeReminderInactivityDays(30), 30);
  assert.equal(normalizeReminderInactivityDays(5), 7);
  assert.equal(normalizeReminderInactivityDays("7"), 7);
});
