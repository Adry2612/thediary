import assert from "node:assert/strict";
import test from "node:test";
import {
  activateExclusiveAudio,
  releaseExclusiveAudio,
} from "../src/lib/practice-audio-playback.ts";
import {
  getPlaybackDurationSeconds,
  getRecordingDurationSeconds,
} from "../src/lib/recording-duration.ts";

test("stops the previously active audio before another player starts", () => {
  const paused = [];
  const first = { pause: () => paused.push("first") };
  const second = { pause: () => paused.push("second") };
  const third = { pause: () => paused.push("third") };

  activateExclusiveAudio(first);
  activateExclusiveAudio(second);
  releaseExclusiveAudio(first);
  activateExclusiveAudio(third);

  assert.deepEqual(paused, ["first", "second"]);
});

test("stores the elapsed recording duration in seconds", () => {
  assert.equal(getRecordingDurationSeconds(12_000, 15_750), 3.75);
});

test("uses media duration when known and recorded time as a fallback", () => {
  assert.equal(getPlaybackDurationSeconds(Infinity, 12.5), 12.5);
  assert.equal(getPlaybackDurationSeconds(13.1, 12.5), 13.1);
  assert.equal(getPlaybackDurationSeconds(13.1, undefined), 13.1);
  assert.equal(getPlaybackDurationSeconds(NaN, undefined), null);
});
