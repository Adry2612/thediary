import assert from "node:assert/strict";
import test from "node:test";
import {
  getFilteredPracticeRecordings,
  getSessionPracticeRecordings,
  groupPracticeRecordingsByDate,
  groupPracticeRecordingsBySession,
  isPracticeRecordingSort,
} from "../src/lib/practice-recording-filtering.ts";

const recordings = [
  {
    id: "recording-1",
    title: "Zumbido",
    sessionName: "Rutina semanal",
    createdAt: "2026-10-07T09:15:00.000Z",
    practiceDate: "2026-10-06",
    phaseOrder: 2,
    phaseName: "Arpegios",
    practiceSkill: "technique",
  },
  {
    id: "recording-2",
    title: "Estudio",
    sessionName: "Sesión libre",
    createdAt: "2026-10-06T10:15:00.000Z",
    practiceDate: "2026-10-06",
    phaseOrder: 1,
    phaseName: "Técnica",
    practiceSkill: "theory",
  },
  {
    id: "recording-3",
    title: "Acordes",
    sessionName: "Rutina semanal",
    createdAt: "2026-10-05T10:15:00.000Z",
    practiceDate: "2026-10-05",
    phaseOrder: 1,
    phaseName: "Armonía",
    practiceSkill: "repertoire",
  },
];

const defaultFilters = {
  phaseOrder: "",
  phaseName: "",
  sort: "newest",
};

test("accepts each supported recording sort mode and rejects unknown values", () => {
  for (const sort of ["newest", "oldest", "block", "name", "type"]) {
    assert.equal(isPracticeRecordingSort(sort), true);
  }
  assert.equal(isPracticeRecordingSort("unknown"), false);
});

test("filters recordings by block order and accent-insensitive block name", () => {
  const result = getFilteredPracticeRecordings(recordings, {
    ...defaultFilters,
    phaseOrder: "2",
    phaseName: "arpegio",
  });

  assert.deepEqual(
    result.map((recording) => recording.id),
    ["recording-1"],
  );
});

test("sorts recordings by recency, block order, title, or practice type without mutating the source", () => {
  const newest = getFilteredPracticeRecordings(recordings, defaultFilters);
  const byBlock = getFilteredPracticeRecordings(recordings, {
    ...defaultFilters,
    sort: "block",
  });
  const byName = getFilteredPracticeRecordings(recordings, {
    ...defaultFilters,
    sort: "name",
  });
  const byType = getFilteredPracticeRecordings(recordings, {
    ...defaultFilters,
    sort: "type",
  });

  assert.deepEqual(newest.map((recording) => recording.id), [
    "recording-1",
    "recording-2",
    "recording-3",
  ]);
  assert.deepEqual(byBlock.map((recording) => recording.id), [
    "recording-2",
    "recording-3",
    "recording-1",
  ]);
  assert.deepEqual(byName.map((recording) => recording.id), [
    "recording-3",
    "recording-2",
    "recording-1",
  ]);
  assert.deepEqual(byType.map((recording) => recording.id), [
    "recording-3",
    "recording-1",
    "recording-2",
  ]);
  assert.deepEqual(recordings.map((recording) => recording.id), [
    "recording-1",
    "recording-2",
    "recording-3",
  ]);
});

test("groups recordings by practice day with the newest day first", () => {
  const groups = groupPracticeRecordingsByDate(recordings, "newest");

  assert.deepEqual(
    groups.map(({ dateKey, recordings: dayRecordings }) => ({
      dateKey,
      ids: dayRecordings.map((recording) => recording.id),
    })),
    [
      { dateKey: "2026-10-06", ids: ["recording-1", "recording-2"] },
      { dateKey: "2026-10-05", ids: ["recording-3"] },
    ],
  );
});

test("returns only recordings with the requested session id", () => {
  const sessionRecordings = getSessionPracticeRecordings(
    [
      { ...recordings[0], sessionId: "session-a" },
      { ...recordings[1], sessionId: "session-b" },
      recordings[2],
    ],
    "session-a",
  );

  assert.deepEqual(
    sessionRecordings.map((recording) => recording.id),
    ["recording-1"],
  );
});

test("groups recordings by session id and preserves legacy name-and-day matching", () => {
  const sessions = [
    { id: "session-a", title: "Rutina semanal", dateKey: "2026-10-06" },
    { id: "session-b", title: "Rutina semanal", dateKey: "2026-10-06" },
    { id: "session-c", title: "Sesión libre", dateKey: "2026-10-06" },
  ];
  const sessionRecordings = [
    {
      ...recordings[0],
      id: "linked",
      sessionId: "session-a",
      sessionName: "Otro nombre",
      createdAt: "2026-10-07T09:15:00.000Z",
    },
    {
      ...recordings[1],
      id: "legacy",
      sessionName: "Rutina semanal",
      createdAt: "2026-10-06T12:00:00.000Z",
    },
    {
      ...recordings[2],
      id: "unknown-session",
      sessionId: "missing-session",
      sessionName: "Rutina semanal",
      createdAt: "2026-10-06T12:00:00.000Z",
    },
    {
      ...recordings[2],
      id: "wrong-day",
      sessionName: "Rutina semanal",
      createdAt: "2026-10-07T12:00:00.000Z",
    },
  ];

  const grouped = groupPracticeRecordingsBySession(
    sessionRecordings,
    sessions,
  );

  assert.deepEqual(
    Array.from(grouped, ([sessionId, items]) => [
      sessionId,
      items.map(({ id }) => id),
    ]),
    [
      ["session-a", ["linked", "legacy"]],
      ["session-b", ["legacy"]],
      ["session-c", []],
    ],
  );
});
