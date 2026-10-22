import assert from "node:assert/strict";
import test from "node:test";
import {
  getCenteredDialogStyle,
  getDialogStyle,
  getSpotlightHole,
  hasTargetBoundsChanged,
  SPOTLIGHT_PADDING,
  toTargetBounds,
} from "../src/lib/tutorial-layout.ts";

const viewport = { width: 1000, height: 800 };
const dialog = { width: 320, height: 200 };

function bounds(overrides) {
  const top = overrides.top;
  const left = overrides.left;
  return {
    top,
    left,
    right: overrides.right ?? left,
    bottom: overrides.bottom ?? top,
    width: overrides.width ?? 0,
    height: overrides.height ?? 0,
  };
}

test("keeps the padding that has always framed the spotlight", () => {
  assert.deepEqual(SPOTLIGHT_PADDING, { top: 28, horizontal: 24, bottom: 24 });
});

test("copies the measures of the target", () => {
  const rect = bounds({ top: 10, left: 20, right: 60, bottom: 50, width: 40, height: 40 });

  assert.deepEqual(toTargetBounds(rect), rect);
});

test("centers the dialog when there is no target", () => {
  assert.deepEqual(getDialogStyle(null, viewport, dialog), getCenteredDialogStyle());
  assert.deepEqual(getCenteredDialogStyle(), {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  });
});

test("centers the dialog while the window has no measures", () => {
  const target = bounds({ top: 300, left: 400, right: 500, bottom: 340, width: 100, height: 40 });

  assert.deepEqual(
    getDialogStyle(target, { width: 0, height: 800 }, dialog),
    getCenteredDialogStyle(),
  );
  assert.deepEqual(
    getDialogStyle(target, { width: 1000, height: 0 }, dialog),
    getCenteredDialogStyle(),
  );
});

test("places the dialog below a target that has room below it", () => {
  const target = bounds({ top: 300, left: 400, right: 500, bottom: 340, width: 100, height: 40 });

  assert.deepEqual(getDialogStyle(target, viewport, dialog), {
    top: "380px",
    left: "290px",
    transform: "none",
  });
});

test("places the dialog above a target that has no room below it", () => {
  const target = bounds({ top: 700, left: 400, right: 500, bottom: 740, width: 100, height: 40 });

  assert.deepEqual(getDialogStyle(target, viewport, dialog), {
    top: "456px",
    left: "290px",
    transform: "none",
  });
});

test("sticks the dialog to the bottom edge when that side has more room", () => {
  const smallViewport = { width: 400, height: 300 };
  const smallDialog = { width: 320, height: 200 };
  const target = bounds({ top: 100, left: 100, right: 200, bottom: 120, width: 100, height: 20 });

  assert.deepEqual(getDialogStyle(target, smallViewport, smallDialog), {
    top: "92px",
    left: "16px",
    transform: "none",
  });
});

test("sticks the dialog to the top edge when that side has more room", () => {
  const smallViewport = { width: 400, height: 300 };
  const smallDialog = { width: 320, height: 200 };
  const target = bounds({ top: 250, left: 100, right: 200, bottom: 270, width: 100, height: 20 });

  assert.deepEqual(getDialogStyle(target, smallViewport, smallDialog), {
    top: "8px",
    left: "16px",
    transform: "none",
  });
});

test("keeps the dialog inside the horizontal margins on both edges", () => {
  const smallViewport = { width: 400, height: 300 };
  const smallDialog = { width: 200, height: 100 };
  const rightTarget = bounds({ top: 100, left: 390, right: 399, bottom: 120, width: 9, height: 20 });
  const leftTarget = bounds({ top: 100, left: 0, right: 9, bottom: 120, width: 9, height: 20 });

  assert.deepEqual(getDialogStyle(rightTarget, smallViewport, smallDialog), {
    top: "160px",
    left: "184px",
    transform: "none",
  });
  assert.deepEqual(getDialogStyle(leftTarget, smallViewport, smallDialog), {
    top: "160px",
    left: "16px",
    transform: "none",
  });
});

test("pads the spotlight hole around the target", () => {
  const target = bounds({ top: 300, left: 400, right: 500, bottom: 340, width: 100, height: 40 });

  assert.deepEqual(getSpotlightHole(target, viewport), {
    top: 272,
    right: 524,
    bottom: 364,
    left: 376,
  });
});

test("clips the spotlight hole to the top and left edges", () => {
  const target = bounds({ top: -50, left: -30, right: 100, bottom: 40, width: 130, height: 90 });

  assert.deepEqual(getSpotlightHole(target, viewport), {
    top: 0,
    right: 124,
    bottom: 64,
    left: 0,
  });
});

test("clips the spotlight hole to the bottom and right edges", () => {
  const target = bounds({ top: 780, left: 960, right: 990, bottom: 820, width: 30, height: 40 });

  assert.deepEqual(getSpotlightHole(target, viewport), {
    top: 752,
    right: 1000,
    bottom: 800,
    left: 936,
  });
});

test("ignores sub-pixel wobble when comparing measures", () => {
  const target = bounds({ top: 300, left: 400, right: 500, bottom: 340, width: 100, height: 40 });

  assert.equal(hasTargetBoundsChanged(null, target), true);
  assert.equal(hasTargetBoundsChanged(target, { ...target }), false);
  assert.equal(
    hasTargetBoundsChanged(target, { ...target, top: 300.4, left: 400.4 }),
    false,
  );
  assert.equal(hasTargetBoundsChanged(target, { ...target, top: 300.5 }), true);
  assert.equal(hasTargetBoundsChanged(target, { ...target, width: 100.6 }), true);
});
