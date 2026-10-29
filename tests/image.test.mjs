import assert from "node:assert/strict";
import test from "node:test";
import {
  getScaledDimensions,
  MAX_IMAGE_SIDE,
  validateImageFile,
} from "../src/utils/image.ts";

test("keeps an image that already fits", () => {
  assert.deepEqual(getScaledDimensions(800, 600), { width: 800, height: 600 });
  assert.deepEqual(getScaledDimensions(1200, 900), { width: 1200, height: 900 });
});

test("scales the longest side down and keeps the proportion", () => {
  assert.deepEqual(getScaledDimensions(4000, 3000), { width: 1200, height: 900 });
  assert.deepEqual(getScaledDimensions(3000, 4000), { width: 900, height: 1200 });
  assert.deepEqual(getScaledDimensions(4032, 3024), { width: 1200, height: 900 });
});

test("never scales below one pixel", () => {
  assert.deepEqual(getScaledDimensions(20000, 10), { width: 1200, height: 1 });
});

test("handles invalid sizes and a custom limit", () => {
  assert.deepEqual(getScaledDimensions(0, 100), { width: 0, height: 0 });
  assert.deepEqual(getScaledDimensions(100, 0), { width: 0, height: 0 });
  assert.deepEqual(getScaledDimensions(4000, 2000, 800), {
    width: 800,
    height: 400,
  });
  assert.equal(MAX_IMAGE_SIDE, 1200);
});

test("accepts the supported image types by MIME or extension", () => {
  assert.equal(validateImageFile({ type: "image/jpeg", size: 1000 }), null);
  assert.equal(validateImageFile({ type: "image/webp", size: 1000 }), null);
  assert.equal(
    validateImageFile({ type: "", name: "foto.HEIC", size: 1000 }),
    null,
  );
  assert.equal(
    validateImageFile({ type: "image/heic", size: 1000 }),
    null,
  );
  assert.equal(
    validateImageFile({ type: "", name: "foto.heif", size: 1000 }),
    null,
  );
  assert.equal(
    validateImageFile({ type: "", name: "foto.webp", size: 1000 }),
    null,
  );
});

test("rejects files that are not images and those over the limit", () => {
  assert.equal(
    validateImageFile({ type: "application/pdf", name: "tab.pdf", size: 10 }),
    "unsupported",
  );
  assert.equal(
    validateImageFile({ type: "image/png", size: 11 * 1024 * 1024 }),
    "too-large",
  );
});
