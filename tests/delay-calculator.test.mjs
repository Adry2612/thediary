import assert from "node:assert/strict";
import test from "node:test";
import {
  DELAY_BASE_DIVISIONS,
  DELAY_VARIANTS,
  formatDelayMilliseconds,
  getBeatMilliseconds,
  getDelayDivisions,
} from "../src/utils/delay-calculator.ts";

test("a beat at 120 bpm lasts 500 milliseconds", () => {
  assert.equal(getBeatMilliseconds(120), 500);
});

test("invalid tempos produce no values", () => {
  assert.equal(getBeatMilliseconds(0), null);
  assert.equal(getBeatMilliseconds(39), null);
  assert.equal(getBeatMilliseconds(241), null);
  assert.equal(getBeatMilliseconds(Number.NaN), null);
  assert.equal(getDelayDivisions(0), null);
});

test("returns every base division in the three variants", () => {
  const divisions = getDelayDivisions(120);

  assert.ok(divisions);
  assert.equal(
    divisions.length,
    DELAY_BASE_DIVISIONS.length * DELAY_VARIANTS.length,
  );
  assert.deepEqual(
    [...new Set(divisions.map((division) => division.variant))].sort(),
    ["dotted", "plain", "triplet"],
  );
});

test("known divisions at 120 bpm", () => {
  const divisions = getDelayDivisions(120);
  const find = (id, variant) =>
    divisions.find(
      (division) => division.id === id && division.variant === variant,
    );

  assert.equal(find("quarter", "plain").milliseconds, 500);
  assert.equal(find("quarter", "dotted").milliseconds, 750);
  assert.equal(find("eighth", "plain").milliseconds, 250);
  assert.equal(find("eighth", "dotted").milliseconds, 375);
  assert.equal(find("eighth", "triplet").milliseconds, 166.67);
  assert.equal(find("whole", "triplet").milliseconds, 1333.33);
});

test("values are rounded to two decimals", () => {
  const divisions = getDelayDivisions(137);
  const dottedEighth = divisions.find(
    (division) => division.id === "eighth" && division.variant === "dotted",
  );

  assert.equal(dottedEighth.milliseconds, 328.47);
  assert.equal(formatDelayMilliseconds(328.47), "328.47");
  assert.equal(formatDelayMilliseconds(500), "500.00");
});
