import assert from "node:assert/strict";
import test from "node:test";
import { resolveDayActivation } from "../src/utils/practice-calendar-touch.ts";

const day = "2026-10-25";
const otherDay = "2026-10-24";

test("the first tap on a day with practice only opens its summary", () => {
  assert.equal(
    resolveDayActivation({
      pointer: "coarse",
      isKeyboard: false,
      hasPractice: true,
      armedDate: null,
      dateKey: day,
    }),
    "arm",
  );
});

test("the second tap on the same day opens the detail", () => {
  assert.equal(
    resolveDayActivation({
      pointer: "coarse",
      isKeyboard: false,
      hasPractice: true,
      armedDate: day,
      dateKey: day,
    }),
    "navigate",
  );
});

test("tapping a different day moves the summary instead of navigating", () => {
  assert.equal(
    resolveDayActivation({
      pointer: "coarse",
      isKeyboard: false,
      hasPractice: true,
      armedDate: otherDay,
      dateKey: day,
    }),
    "arm",
  );
});

test("a day without practice never navigates", () => {
  for (const armedDate of [null, day]) {
    assert.equal(
      resolveDayActivation({
        pointer: "coarse",
        isKeyboard: false,
        hasPractice: false,
        armedDate,
        dateKey: day,
      }),
      "arm",
    );
  }
});

test("keyboard or assistive activation opens the detail directly", () => {
  assert.equal(
    resolveDayActivation({
      pointer: "coarse",
      isKeyboard: true,
      hasPractice: true,
      armedDate: null,
      dateKey: day,
    }),
    "navigate",
  );
});

test("a fine pointer opens the detail directly, as before", () => {
  assert.equal(
    resolveDayActivation({
      pointer: "fine",
      isKeyboard: false,
      hasPractice: true,
      armedDate: null,
      dateKey: day,
    }),
    "navigate",
  );
});
