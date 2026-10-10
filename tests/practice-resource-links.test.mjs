import assert from "node:assert/strict";
import test from "node:test";
import {
  extractSpotifyTrackId,
  extractYoutubeVideoId,
} from "../src/lib/practice-resource-links.ts";

test("extracts YouTube ids from supported url shapes", () => {
  assert.equal(extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=3"), "dQw4w9WgXcQ");
  assert.equal(extractYoutubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extractYoutubeVideoId("http://youtu.be/dQw4w9WgXcQ"), null);
  assert.equal(extractYoutubeVideoId("https://evil.com/watch?v=dQw4w9WgXcQ"), null);
});

test("extracts Spotify track ids", () => {
  assert.equal(
    extractSpotifyTrackId("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=abc"),
    "4uLU6hMCjMI75M1A2tKUQC",
  );
  assert.equal(extractSpotifyTrackId("https://open.spotify.com/album/4uLU6hMCjMI75M1A2tKUQC"), null);
  assert.equal(extractSpotifyTrackId("nope"), null);
});
