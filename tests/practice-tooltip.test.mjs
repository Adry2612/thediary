import assert from "node:assert/strict";
import test from "node:test";
import {
  getPracticeTooltipPosition,
  getSessionPhaseLines,
  PRACTICE_TOOLTIP_GAP,
} from "../src/utils/practice-tooltip.ts";

function elementAt(top, left = 500) {
  return {
    getBoundingClientRect: () => ({
      top,
      left,
      width: 16,
      height: 16,
      bottom: top + 16,
      right: left + 16,
    }),
  };
}

test("opens above the day with a 10px gap when that side has more room", () => {
  globalThis.window = { innerWidth: 1024, innerHeight: 800 };

  const position = getPracticeTooltipPosition(elementAt(600));

  assert.equal(position.showBelow, false);
  assert.equal(position.top, 600 - PRACTICE_TOOLTIP_GAP);
  assert.equal(position.left, 364);
  assert.equal(position.maxHeight, 440);

  delete globalThis.window;
});

test("opens below the day, with the gap, when the day is near the top", () => {
  globalThis.window = { innerWidth: 1024, innerHeight: 800 };

  const position = getPracticeTooltipPosition(elementAt(100));

  assert.equal(position.showBelow, true);
  assert.equal(position.top, 100 + 16 + PRACTICE_TOOLTIP_GAP);
  assert.ok(position.maxHeight <= 440);

  delete globalThis.window;
});

test("limits the card height to the free space so it never covers the day", () => {
  globalThis.window = { innerWidth: 1024, innerHeight: 400 };

  const position = getPracticeTooltipPosition(elementAt(200));

  assert.equal(position.showBelow, false);
  assert.equal(position.top, 190);
  assert.equal(position.maxHeight, 200 - PRACTICE_TOOLTIP_GAP - 12);

  delete globalThis.window;
});

test("keeps the summary inside the viewport horizontally", () => {
  globalThis.window = { innerWidth: 1024, innerHeight: 800 };

  assert.equal(getPracticeTooltipPosition(elementAt(600, 0)).left, 12);
  assert.equal(getPracticeTooltipPosition(elementAt(600, 1000)).left, 724);

  delete globalThis.window;
});

function phase(name) {
  return { id: 1, name, skill: "repertoire", elapsedSeconds: 60 };
}

test("hides the only block when it repeats the session name", () => {
  const lines = getSessionPhaseLines({
    title: "Master of Puppets",
    phases: [phase("Master of Puppets")],
  });

  assert.deepEqual(lines, []);
});

test("keeps a single block whose name differs from the session", () => {
  const phases = [phase("Riff principal")];

  assert.deepEqual(
    getSessionPhaseLines({ title: "Master of Puppets", phases }),
    phases,
  );
});

test("keeps every block when the session has several", () => {
  const phases = [phase("Master of Puppets"), phase("Riff principal")];

  assert.deepEqual(
    getSessionPhaseLines({ title: "Master of Puppets", phases }),
    phases,
  );
});

test("compares the names ignoring case and surrounding spaces", () => {
  const lines = getSessionPhaseLines({
    title: "  master of puppets ",
    phases: [phase("Master of Puppets  ")],
  });

  assert.deepEqual(lines, []);
});

test("keeps the blocks when the session has no title", () => {
  const phases = [phase("Riff principal")];

  assert.deepEqual(getSessionPhaseLines({ phases }), phases);
});
