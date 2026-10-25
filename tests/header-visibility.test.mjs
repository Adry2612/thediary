import assert from "node:assert/strict";
import test from "node:test";
import {
  getHeaderHidden,
  HEADER_HIDE_AFTER_PX,
  HEADER_HIDE_DISTANCE_PX,
  HEADER_SHOW_DISTANCE_PX,
} from "../src/utils/header-visibility.ts";

const visible = (input) =>
  getHeaderHidden({
    downDistance: 0,
    upDistance: 0,
    isHidden: false,
    ...input,
  });

test("stays visible at the top even after a downward movement", () => {
  assert.equal(
    visible({ scrollY: 0, downDistance: HEADER_HIDE_DISTANCE_PX }),
    false,
  );
});

test("stays visible until the hide depth is crossed", () => {
  assert.equal(
    visible({
      scrollY: HEADER_HIDE_AFTER_PX,
      downDistance: HEADER_HIDE_DISTANCE_PX,
    }),
    false,
  );
});

test("hides once the depth and the downward distance are reached", () => {
  assert.equal(
    visible({
      scrollY: HEADER_HIDE_AFTER_PX + 1,
      downDistance: HEADER_HIDE_DISTANCE_PX,
    }),
    true,
  );
});

test("keeps the header visible while the downward movement is still small", () => {
  assert.equal(
    visible({
      scrollY: 400,
      downDistance: HEADER_HIDE_DISTANCE_PX - 1,
    }),
    false,
  );
});

test("reveals a hidden header after the upward distance is reached", () => {
  assert.equal(
    visible({
      scrollY: 400,
      isHidden: true,
      upDistance: HEADER_SHOW_DISTANCE_PX,
    }),
    false,
  );
});

test("keeps a hidden header hidden while the upward movement is still small", () => {
  assert.equal(
    visible({
      scrollY: 400,
      isHidden: true,
      upDistance: HEADER_SHOW_DISTANCE_PX - 1,
    }),
    true,
  );
});

test("a hidden header reappears immediately near the top", () => {
  assert.equal(
    visible({ scrollY: HEADER_HIDE_AFTER_PX - 1, isHidden: true }),
    false,
  );
});

test("ignores downward jitter when it has not accumulated enough", () => {
  assert.equal(visible({ scrollY: 300, downDistance: 3 }), false);
});

test("an already hidden header stays hidden while scrolling further down", () => {
  assert.equal(
    visible({ scrollY: 800, isHidden: true, downDistance: 200 }),
    true,
  );
});
