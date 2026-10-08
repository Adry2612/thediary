import assert from "node:assert/strict";
import test from "node:test";
import { getLinkedPartLabel } from "../src/lib/practice-session-details.ts";

test("returns the song and part labels for a valid repertoire link", () => {
  const phase = { repertoireItemId: "song-1", repertoirePartId: "part-2" };
  const repertoireItems = [
    {
      id: "song-1",
      title: "Canción",
      parts: [
        { id: "part-1", name: "Intro" },
        { id: "part-2", name: "Solo" },
      ],
    },
  ];

  assert.equal(
    getLinkedPartLabel(phase, repertoireItems),
    "Canción · Solo",
  );
});

test("returns no linked label when ids or matching records are missing", () => {
  const repertoireItems = [
    { id: "song-1", title: "Canción", parts: [{ id: "part-1", name: "Intro" }] },
  ];

  assert.equal(getLinkedPartLabel({}, repertoireItems), null);
  assert.equal(
    getLinkedPartLabel(
      { repertoireItemId: "song-1", repertoirePartId: "unknown" },
      repertoireItems,
    ),
    null,
  );
});
