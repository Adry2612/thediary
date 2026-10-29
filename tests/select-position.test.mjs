import assert from "node:assert/strict";
import test from "node:test";
import {
  getListboxPlacement,
  LISTBOX_GAP,
} from "../src/utils/select-position.ts";

const VIEWPORT = { width: 1280, height: 950 };

function createContainer(overrides = {}) {
  return {
    left: 352,
    top: 124.75,
    right: 928,
    bottom: 825.25,
    width: 576,
    clientLeft: 1,
    clientTop: 1,
    clientWidth: 574,
    clientHeight: 574,
    scrollLeft: 0,
    scrollTop: 0,
    ...overrides,
  };
}

function createTrigger(overrides = {}) {
  return {
    left: 385,
    top: 500,
    bottom: 547,
    right: 895,
    width: 510,
    ...overrides,
  };
}

test("a transformed dialog no longer offsets the list", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger(),
    container: createContainer(),
    viewport: VIEWPORT,
    optionCount: 7,
  });

  assert.equal(placement.position, "absolute");
  // 385 - (352 + 1); not 385 against the viewport.
  assert.equal(placement.left, 32);
  assert.equal(placement.width, 510);
  assert.equal(placement.top, undefined);
  assert.ok(Math.abs(placement.bottom - 203.75) < 1e-9);
  assert.equal(placement.maxHeight, 240);
});

test("a control near the bottom opens upward", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger({ top: 700, bottom: 747 }),
    container: createContainer({
      top: 0,
      bottom: 800,
      clientTop: 0,
      clientLeft: 0,
      clientHeight: 800,
    }),
    viewport: VIEWPORT,
    optionCount: 7,
  });

  assert.equal(placement.top, undefined);
  assert.equal(placement.bottom, 104);
});

test("when neither side fits, the list takes the taller side and is clipped", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger({ top: 60, bottom: 108 }),
    container: createContainer({
      left: 0,
      top: 0,
      bottom: 200,
      clientLeft: 0,
      clientTop: 0,
      clientWidth: 400,
      clientHeight: 200,
    }),
    viewport: { width: 400, height: 400 },
    optionCount: 7,
  });

  assert.equal(placement.top, 112);
  assert.equal(placement.maxHeight, 88);
});

test("a select outside a dialog keeps viewport coordinates", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger({ left: 100, top: 200, bottom: 248, width: 300 }),
    container: null,
    viewport: VIEWPORT,
    optionCount: 3,
  });

  assert.equal(placement.position, "fixed");
  assert.equal(placement.left, 100);
  assert.equal(placement.top, 248 + LISTBOX_GAP);
  assert.equal(placement.maxHeight, 128);
});

test("a 375 px screen keeps the list inside the dialog", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger({ left: 40, top: 300, bottom: 348, width: 303 }),
    container: createContainer({
      left: 19,
      top: 10,
      right: 356,
      bottom: 700,
      width: 337,
      clientLeft: 1,
      clientTop: 1,
      clientWidth: 335,
      clientHeight: 688,
    }),
    viewport: { width: 375, height: 700 },
    optionCount: 7,
  });

  assert.equal(placement.left, 20);
  assert.equal(placement.left + placement.width, 323);
  assert.ok(placement.left + placement.width <= 19 + 1 + 335);
});

test("scrolling the dialog compensates both axes", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger({ left: 130, top: 300, bottom: 348, width: 200 }),
    container: createContainer({
      left: 100,
      top: 50,
      clientLeft: 1,
      clientTop: 1,
      clientHeight: 600,
      scrollLeft: 10,
      scrollTop: 40,
    }),
    viewport: VIEWPORT,
    optionCount: 4,
  });

  assert.equal(placement.left, 39);
  assert.equal(placement.top, 341);
});

test("scrolling upward compensation keeps the gap under the control", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger({ top: 500, bottom: 547 }),
    container: createContainer({
      top: 0,
      clientTop: 0,
      clientLeft: 0,
      clientHeight: 600,
      scrollTop: 50,
    }),
    viewport: VIEWPORT,
    optionCount: 7,
  });

  // 600 - 50 - 500 + 4
  assert.equal(placement.bottom, 54);
});

test("an empty list still reserves one estimated row", () => {
  const placement = getListboxPlacement({
    trigger: createTrigger(),
    container: null,
    viewport: VIEWPORT,
    optionCount: 0,
  });

  assert.equal(placement.maxHeight, 48);
});
