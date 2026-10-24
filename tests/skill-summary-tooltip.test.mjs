import assert from "node:assert/strict";
import test from "node:test";
import {
  getSkillSummaryPosition,
  SKILL_SUMMARY_GAP,
  SKILL_SUMMARY_HEIGHT,
  SKILL_SUMMARY_MARGIN,
  SKILL_SUMMARY_WIDTH,
} from "../src/utils/skill-summary-tooltip.ts";

function anchorAt(left, top, width = 40, height = 40) {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
  };
}

test("opens to the right when that side has room", () => {
  const position = getSkillSummaryPosition(anchorAt(100, 300), {
    width: 1024,
    height: 800,
  });

  assert.deepEqual(position, {
    left: 150,
    top: 300 + 20 - SKILL_SUMMARY_HEIGHT / 2,
  });
});

test("opens to the left when the right side is too narrow", () => {
  const position = getSkillSummaryPosition(anchorAt(900, 300), {
    width: 1024,
    height: 800,
  });

  assert.deepEqual(position, {
    left: 900 - SKILL_SUMMARY_GAP - SKILL_SUMMARY_WIDTH,
    top: 300 + 20 - SKILL_SUMMARY_HEIGHT / 2,
  });
});

test("opens below when neither side has horizontal room", () => {
  const position = getSkillSummaryPosition(anchorAt(38, 100), {
    width: 300,
    height: 800,
  });

  assert.deepEqual(position, {
    left: SKILL_SUMMARY_MARGIN,
    top: 100 + 40 + SKILL_SUMMARY_GAP,
  });
});

test("opens above when the other sides are too narrow and below is short", () => {
  const position = getSkillSummaryPosition(anchorAt(38, 180), {
    width: 300,
    height: 300,
  });

  assert.deepEqual(position, {
    left: SKILL_SUMMARY_MARGIN,
    top: 180 - SKILL_SUMMARY_GAP - SKILL_SUMMARY_HEIGHT,
  });
});

test("clamps to the viewport margin near an edge", () => {
  const position = getSkillSummaryPosition(anchorAt(900, 760), {
    width: 1024,
    height: 800,
  });

  assert.equal(position.left, 900 - SKILL_SUMMARY_GAP - SKILL_SUMMARY_WIDTH);
  assert.equal(position.top, 800 - SKILL_SUMMARY_HEIGHT - SKILL_SUMMARY_MARGIN);
});

test("falls back to the margin when the viewport is smaller than the card", () => {
  const position = getSkillSummaryPosition(anchorAt(70, 30), {
    width: 180,
    height: 80,
  });

  assert.deepEqual(position, {
    left: SKILL_SUMMARY_MARGIN,
    top: SKILL_SUMMARY_MARGIN,
  });
});
