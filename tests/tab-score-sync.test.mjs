import assert from "node:assert/strict";
import test from "node:test";
import { normalizePracticeData } from "../src/services/supabase/practice-data.ts";
import { createEmptyScore } from "../src/utils/tab-score/model.ts";

function score(tempo) {
  const base = createEmptyScore("DADGAD");
  return {
    ...base,
    tempo,
    bars: [
      {
        ...base.bars[0],
        beats: [
          {
            id: "beat-a",
            duration: 4,
            rest: false,
            notes: [{ string: 0, fret: 3 }],
          },
        ],
      },
    ],
  };
}

const gridTab = {
  tuning: "DADGAD",
  measures: 1,
  subdivision: 4,
  notes: [{ string: 0, column: 0, fret: 2 }],
};

test("a score survives a JSON round-trip through the synced practice data", () => {
  const itemScore = score(110);
  const lickScore = score(96);
  const state = {
    repertoireItems: [
      {
        id: "song-1",
        kind: "song",
        title: "Canción",
        parts: [],
        updatedAt: "2026-01-01T00:00:00.000Z",
        tab: gridTab,
        score: itemScore,
      },
    ],
    licks: [
      {
        id: "lick-1",
        title: "Lick",
        techniques: [],
        bpmHistory: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        practiceCount: 0,
        tabContent: "e|--3--|",
        tab: gridTab,
        score: lickScore,
      },
    ],
  };

  const synced = normalizePracticeData(
    JSON.parse(JSON.stringify(state)),
  );

  assert.deepEqual(synced.repertoireItems[0].score, itemScore);
  assert.equal(synced.repertoireItems[0].tab.notes[0].fret, 2);
  assert.deepEqual(synced.licks[0].score, lickScore);
  assert.equal(synced.licks[0].tabContent, "e|--3--|");
  assert.deepEqual(synced.licks[0].tab, gridTab);
});

test("an item with only tab keeps working and no score is invented", () => {
  const synced = normalizePracticeData({
    repertoireItems: [
      {
        id: "song-2",
        kind: "song",
        title: "Antigua",
        parts: [],
        updatedAt: "2026-01-01T00:00:00.000Z",
        tab: gridTab,
      },
    ],
    licks: [],
  });

  assert.equal(synced.repertoireItems[0].score, undefined);
  assert.equal(synced.repertoireItems[0].tab.notes[0].fret, 2);
});
