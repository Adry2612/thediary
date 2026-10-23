import assert from "node:assert/strict";
import test from "node:test";
import {
  formatClock,
  formatDateLabel,
  formatExactDuration,
  formatOvertime,
  formatPracticeDuration,
  formatTotal,
  getTimerAction,
  getTimerDisplaySeconds,
} from "../src/utils/format.ts";

test("formats a clock as minutes and seconds", () => {
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(65), "01:05");
  assert.equal(formatClock(3_600), "60:00");
});

test("formats overtime only when the block has exceeded its time", () => {
  assert.equal(formatOvertime(0), "");
  assert.equal(formatOvertime(-5), "");
  assert.equal(formatOvertime(5), "+00:05");
  assert.equal(formatOvertime(65), "+01:05");
});

test("formats a rounded duration in the short form of the app", () => {
  assert.equal(formatTotal(0), "0 min");
  assert.equal(formatTotal(90), "2 min");
  assert.equal(formatTotal(3_600), "1 h");
  assert.equal(formatTotal(3_900), "1 h 5 min");
});

test("formats an exact duration to the second, truncating", () => {
  assert.equal(formatExactDuration(0), "0 min 0 s");
  assert.equal(formatExactDuration(65.9), "1 min 5 s");
  assert.equal(formatExactDuration(3_900), "65 min 0 s");
});

test("formats a day key as a long local date", () => {
  assert.equal(formatDateLabel("2026-03-05", "es-ES"), "jueves, 5 de marzo");
  assert.equal(
    formatDateLabel("2026-03-05", "es-ES", true),
    "jueves, 5 de marzo de 2026",
  );
});

test("reads the day key as a local day, not as a UTC instant", () => {
  // Un instante UTC a medianoche del día 1 se leería como el 31 en husos al
  // oeste de Greenwich; la clave es un día local y siempre cae en el mismo día.
  assert.match(formatDateLabel("2026-01-01", "es-ES", true), /1 de enero/);
  assert.match(formatDateLabel("2026-12-31", "es-ES", true), /31 de diciembre/);
});

test("formats practice minutes in hours and minutes, rounded", () => {
  assert.equal(formatPracticeDuration(0), "0 min");
  assert.equal(formatPracticeDuration(45), "45 min");
  assert.equal(formatPracticeDuration(59.6), "1 h");
  assert.equal(formatPracticeDuration(60), "1 h");
  assert.equal(formatPracticeDuration(65), "1 h 5 min");
  assert.equal(formatPracticeDuration(150), "2 h 30 min");
});

test("picks the timer action in the same order as the button did", () => {
  assert.equal(getTimerAction(true, true, 30), "pause");
  assert.equal(getTimerAction(false, true, 30), "blockFinished");
  assert.equal(getTimerAction(false, false, 0), "start");
  assert.equal(getTimerAction(false, false, 0.5), "continue");
});

test("shows the elapsed or the remaining seconds depending on the mode", () => {
  assert.equal(getTimerDisplaySeconds(true, 42, 78), 42);
  assert.equal(getTimerDisplaySeconds(false, 42, 78), 78);
});
