import assert from "node:assert/strict";
import test from "node:test";
import {
  formatClipTime,
  normalizeReferenceVideo,
  parseClipTime,
  validateReferenceDraft,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "../src/utils/licks/reference-video.ts";

const URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

test("parses seconds, m:ss and h:mm:ss", () => {
  assert.equal(parseClipTime("83"), 83);
  assert.equal(parseClipTime("1:23"), 83);
  assert.equal(parseClipTime("1:02:03"), 3723);
  assert.equal(parseClipTime("0:00"), 0);
  assert.equal(parseClipTime("  2:05 "), 125);
});

test("rejects negative, decimal, overflowing and malformed times", () => {
  assert.equal(parseClipTime(""), null);
  assert.equal(parseClipTime("-1"), null);
  assert.equal(parseClipTime("1.5"), null);
  assert.equal(parseClipTime("abc"), null);
  assert.equal(parseClipTime("1:60"), null);
  assert.equal(parseClipTime("1:02:60"), null);
  assert.equal(parseClipTime("24:00:00"), null);
  assert.equal(parseClipTime("1:2:3:4"), null);
});

test("formats times as m:ss and h:mm:ss", () => {
  assert.equal(formatClipTime(0), "0:00");
  assert.equal(formatClipTime(83), "1:23");
  assert.equal(formatClipTime(3723), "1:02:03");
});

test("an empty draft clears the clip", () => {
  assert.deepEqual(validateReferenceDraft({ url: "", start: "", end: "" }), {});
});

test("validates the URL and the start and end", () => {
  assert.deepEqual(
    validateReferenceDraft({ url: URL, start: "1:23", end: "1:35" }),
    {
      value: { url: URL, startSeconds: 83, endSeconds: 95 },
    },
  );
  assert.deepEqual(
    validateReferenceDraft({ url: URL, start: "0:00", end: "0:05" }).value,
    { url: URL, startSeconds: 0, endSeconds: 5 },
  );
  assert.deepEqual(validateReferenceDraft({ url: "https://vimeo.com/1", start: "0", end: "5" }), {
    error: "invalidUrl",
  });
  assert.deepEqual(validateReferenceDraft({ url: URL, start: "x", end: "5" }), {
    error: "invalidStart",
  });
  assert.deepEqual(validateReferenceDraft({ url: URL, start: "5", end: "5" }), {
    error: "invalidEnd",
  });
  assert.deepEqual(validateReferenceDraft({ url: URL, start: "5", end: "4" }), {
    error: "invalidEnd",
  });
  assert.deepEqual(validateReferenceDraft({ url: URL, start: "0", end: "" }), {
    error: "invalidEnd",
  });
});

test("normalizes stored clips and discards broken ones", () => {
  assert.deepEqual(normalizeReferenceVideo({ url: URL, startSeconds: 83, endSeconds: 95 }), {
    url: URL,
    startSeconds: 83,
    endSeconds: 95,
  });
  assert.equal(normalizeReferenceVideo({ url: "https://vimeo.com/1", startSeconds: 0, endSeconds: 5 }), undefined);
  assert.equal(normalizeReferenceVideo({ url: URL, startSeconds: 5, endSeconds: 5 }), undefined);
  assert.equal(normalizeReferenceVideo({ url: URL, startSeconds: -1, endSeconds: 5 }), undefined);
  assert.equal(normalizeReferenceVideo({ url: URL, startSeconds: 0, endSeconds: 86400 }), undefined);
  assert.equal(normalizeReferenceVideo({ url: URL, startSeconds: 0.5, endSeconds: 5 }), undefined);
  assert.equal(normalizeReferenceVideo(null), undefined);
});

test("builds the embed and external URLs", () => {
  const video = { url: URL, startSeconds: 83, endSeconds: 95 };
  assert.equal(
    youtubeEmbedUrl(video),
    "https://www.youtube.com/embed/dQw4w9WgXcQ?start=83&end=95&playsinline=1&rel=0",
  );
  assert.equal(
    youtubeWatchUrl(video),
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=83s",
  );
  assert.equal(
    youtubeEmbedUrl({ url: "https://vimeo.com/1", startSeconds: 0, endSeconds: 5 }),
    null,
  );
});
