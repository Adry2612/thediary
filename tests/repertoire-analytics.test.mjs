import assert from "node:assert/strict";
import test from "node:test";
import {
  getArtistPracticeStats,
  getRepertoireItemPracticeStats,
  getRepertoireOverview,
  getRepertoirePracticeStats,
} from "../src/utils/repertoire-analytics.ts";

const emptySkills = {
  technique: 0,
  theory: 0,
  repertoire: 0,
  improvisation: 0,
};

function createSession(id, phases, startedAt = "2026-10-07T12:00:00.000Z") {
  return {
    id,
    startedAt,
    durationSeconds: 2400,
    averageBpm: 90,
    skillSeconds: { ...emptySkills, repertoire: 2400 },
    phases,
  };
}

test("attributes only linked phase time to its repertoire part", () => {
  const history = [
    createSession("session-1", [
      {
        id: "phase-1",
        name: "Solo",
        skill: "repertoire",
        elapsedSeconds: 1200,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
      {
        id: "phase-2",
        name: "Puente",
        skill: "repertoire",
        elapsedSeconds: 600,
        repertoireItemId: "song-1",
        repertoirePartId: "bridge-1",
      },
      {
        id: "phase-2b",
        name: "Repaso del solo",
        skill: "repertoire",
        elapsedSeconds: 300,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
    ]),
    createSession("session-2", [
      {
        id: "phase-3",
        name: "Solo",
        skill: "repertoire",
        elapsedSeconds: 300,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
    ]),
  ];

  const stats = getRepertoirePracticeStats(history);

  assert.deepEqual(stats.get("song-1")?.get("solo-1"), {
    practiceSeconds: 1800,
    sessionCount: 2,
  });
  assert.equal(stats.get("song-1")?.has("bridge-1"), true);
  assert.equal(stats.get("song-1")?.has("missing-part"), false);
});

test("does not count untouched linked phases as repertoire practice", () => {
  const history = [
    createSession("session-1", [
      {
        id: "phase-1",
        name: "Solo",
        skill: "repertoire",
        elapsedSeconds: 0,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
    ]),
  ];

  const stats = getRepertoirePracticeStats(history);

  assert.equal(stats.has("song-1"), false);
});

test("summarizes repertoire items, learned parts, and linked practice time", () => {
  const items = [
    {
      id: "song-1",
      kind: "song",
      title: "Canción",
      parts: [
        { id: "intro", name: "Intro", learned: true },
        { id: "solo", name: "Solo", learned: false },
      ],
    },
    {
      id: "lick-1",
      kind: "lick",
      title: "Lick",
      parts: [{ id: "main", name: "Principal", learned: false }],
    },
  ];
  const practiceStats = new Map([
    ["song-1", { practiceSeconds: 300, sessionCount: 2 }],
  ]);

  assert.deepEqual(getRepertoireOverview(items, practiceStats), {
    songCount: 1,
    learnedCount: 1,
    partCount: 2,
    totalSeconds: 300,
  });
});

test("counts an item's time with or without a part and ignores unlinked phases", () => {
  const history = [
    createSession("session-1", [
      {
        id: "phase-1",
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 600,
        repertoireItemId: "song-1",
      },
      {
        id: "phase-2",
        name: "Solo",
        skill: "repertoire",
        elapsedSeconds: 300,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
      {
        id: "phase-3",
        name: "Ejercicio suelto",
        skill: "technique",
        elapsedSeconds: 500,
      },
    ], "2026-10-01T12:00:00.000Z"),
    createSession("session-2", [
      {
        id: "phase-4",
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 300,
        repertoireItemId: "song-1",
      },
    ], "2026-10-07T12:00:00.000Z"),
  ];

  const stats = getRepertoireItemPracticeStats(history);

  assert.deepEqual(stats.get("song-1"), {
    practiceSeconds: 1200,
    sessionCount: 2,
    lastPracticedAt: "2026-10-07T12:00:00.000Z",
  });
  assert.equal(stats.has("missing-item"), false);
});

test("keeps the newest practice date even when sessions arrive out of order", () => {
  const history = [
    createSession("later", [
      {
        id: "phase-1",
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 120,
        repertoireItemId: "song-1",
      },
    ], "2026-10-10T12:00:00.000Z"),
    createSession("earlier", [
      {
        id: "phase-2",
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 120,
        repertoireItemId: "song-1",
      },
    ], "2026-10-01T12:00:00.000Z"),
  ];

  assert.equal(
    getRepertoireItemPracticeStats(history).get("song-1")?.lastPracticedAt,
    "2026-10-10T12:00:00.000Z",
  );
});

test("does not count an item phase left untouched", () => {
  const history = [
    createSession("session-1", [
      {
        id: "phase-1",
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 0,
        repertoireItemId: "song-1",
      },
    ]),
  ];

  assert.equal(getRepertoireItemPracticeStats(history).has("song-1"), false);
});

function artistItem(id, artist, kind = "song") {
  return { id, kind, title: id, artist, parts: [] };
}

function linkedPhase(id, itemId, elapsedSeconds) {
  return {
    id,
    name: itemId,
    skill: "repertoire",
    elapsedSeconds,
    repertoireItemId: itemId,
  };
}

test("sums artist time across songs and sorts by practised time", () => {
  const items = [
    artistItem("song-1", "Metallica"),
    artistItem("song-2", "Metallica"),
    artistItem("song-3", "Opeth"),
    artistItem("lick-1", "Lick Artist", "lick"),
  ];
  const history = [
    createSession("session-1", [
      linkedPhase("phase-1", "song-1", 600),
      linkedPhase("phase-2", "song-2", 300),
      linkedPhase("phase-3", "song-3", 500),
      linkedPhase("phase-4", "lick-1", 900),
    ]),
  ];

  assert.deepEqual(getArtistPracticeStats(history, items), [
    { artist: "Metallica", practiceSeconds: 900, songCount: 2 },
    { artist: "Opeth", practiceSeconds: 500, songCount: 1 },
  ]);
});

test("merges artist name variants and keeps the practised song count unique", () => {
  const items = [
    artistItem("song-1", "  Metallica "),
    artistItem("song-2", "metallica"),
  ];
  const history = [
    createSession("session-1", [
      linkedPhase("phase-1", "song-1", 300),
      linkedPhase("phase-2", "song-1", 300),
      linkedPhase("phase-3", "song-2", 150),
    ]),
  ];

  assert.deepEqual(getArtistPracticeStats(history, items), [
    { artist: "Metallica", practiceSeconds: 750, songCount: 2 },
  ]);
});

test("excludes unlinked, missing, artistless and untouched practice", () => {
  const items = [
    artistItem("song-1", "Metallica"),
    artistItem("song-2", "   "),
  ];
  const history = [
    createSession("session-1", [
      linkedPhase("phase-1", "song-1", 300),
      linkedPhase("phase-2", "song-2", 400),
      linkedPhase("phase-3", "missing-song", 500),
      {
        id: "phase-4",
        name: "Suelta",
        skill: "technique",
        elapsedSeconds: 600,
      },
      linkedPhase("phase-5", "song-1", 0),
    ]),
  ];

  assert.deepEqual(getArtistPracticeStats(history, items), [
    { artist: "Metallica", practiceSeconds: 300, songCount: 1 },
  ]);
});

test("orders artists with equal time by name", () => {
  const items = [
    artistItem("song-1", "Opeth"),
    artistItem("song-2", "Metallica"),
  ];
  const history = [
    createSession("session-1", [
      linkedPhase("phase-1", "song-1", 300),
      linkedPhase("phase-2", "song-2", 300),
    ]),
  ];

  assert.deepEqual(
    getArtistPracticeStats(history, items).map((artist) => artist.artist),
    ["Metallica", "Opeth"],
  );
});
