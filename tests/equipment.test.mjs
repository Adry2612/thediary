import assert from "node:assert/strict";
import test from "node:test";
import {
  getGuitarAttribution,
  getGuitarMaintenance,
  getGuitarUsageSeconds,
  getLatestStringChange,
  migrateLegacyEquipmentEntries,
  normalizeGuitar,
  normalizeGuitarEntries,
  normalizeGuitarEntry,
  normalizeGuitars,
  normalizeStringSet,
  removeGuitarFromMaintenance,
  resolvePracticeGuitarId,
  sortEntriesNewestFirst,
  sortGuitarsByMaintenance,
} from "../src/utils/equipment.ts";

function guitar(overrides = {}) {
  return {
    id: "guitar-1",
    name: "Stratocaster",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function stringsEntry(id, date, guitarId = "guitar-1", overrides = {}) {
  return {
    id,
    guitarId,
    date,
    kind: "strings",
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
    ...overrides,
  };
}

function noteEntry(id, date, guitarId = "guitar-1") {
  return {
    id,
    guitarId,
    date,
    kind: "note",
    text: "Ajuste de acción",
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  };
}

function session(id, date, guitarId, durationSeconds) {
  return {
    id,
    startedAt: new Date(`${date}T10:00:00`).toISOString(),
    durationSeconds,
    averageBpm: 0,
    skillSeconds: {
      technique: 0,
      theory: 0,
      repertoire: 0,
      lick: 0,
      improvisation: 0,
    },
    ...(guitarId ? { guitarId } : {}),
  };
}

const today = new Date(2026, 9, 28);

test("sums only the practices that recorded the guitar", () => {
  const history = [
    session("a", "2026-10-01", "guitar-1", 1800),
    session("b", "2026-10-02", "guitar-2", 3600),
    session("c", "2026-10-03", undefined, 900),
    session("d", "2026-10-04", "guitar-1", 600),
  ];

  assert.equal(getGuitarUsageSeconds(history, "guitar-1"), 2400);
});

test("counts usage only since the newest string change", () => {
  const history = [
    session("before", "2026-09-01", "guitar-1", 3600),
    session("same-day", "2026-09-10", "guitar-1", 1800),
    session("after", "2026-09-20", "guitar-1", 900),
    session("other", "2026-09-20", "guitar-2", 3600),
  ];

  assert.equal(
    getGuitarUsageSeconds(history, "guitar-1", "2026-09-10"),
    2700,
  );
});

test("states how many practices since the change recorded no guitar", () => {
  const history = [
    session("a", "2026-09-20", "guitar-1", 1800),
    session("b", "2026-09-21", undefined, 600),
    session("c", "2026-09-22", undefined, 600),
    session("d", "2026-09-23", "guitar-2", 600),
  ];

  assert.deepEqual(getGuitarAttribution(history, "guitar-1", "2026-09-10"), {
    recordedSessions: 1,
    missingSessions: 2,
    usageSeconds: 1800,
  });
});

test("the newest string change wins and notes never reset the count", () => {
  const entries = [
    stringsEntry("old", "2026-06-01"),
    noteEntry("note", "2026-10-01"),
    stringsEntry("new", "2026-09-10"),
    stringsEntry("middle", "2026-08-01"),
  ];

  assert.equal(getLatestStringChange(entries, "guitar-1")?.id, "new");
  assert.equal(getLatestStringChange(entries, "guitar-2"), null);
  assert.equal(getLatestStringChange([noteEntry("n", "2026-10-01")], "guitar-1"), null);
});

test("the history lists entries newest first", () => {
  const ordered = sortEntriesNewestFirst([
    stringsEntry("a", "2026-06-01"),
    noteEntry("b", "2026-10-01"),
    stringsEntry("c", "2026-08-01"),
  ]);

  assert.deepEqual(
    ordered.map((entry) => entry.id),
    ["b", "c", "a"],
  );
});

test("a guitar with no interval has no reminder", () => {
  const maintenance = getGuitarMaintenance(
    guitar(),
    [stringsEntry("c", "2026-09-01")],
    [],
    today,
  );

  assert.equal(maintenance.state, "no-interval");
  assert.equal(maintenance.limit, null);
});

test("a guitar with an interval but no change asks for the first change", () => {
  const maintenance = getGuitarMaintenance(
    guitar({ intervalDays: 60 }),
    [],
    [],
    today,
  );

  assert.equal(maintenance.state, "no-history");
  assert.equal(maintenance.nextChangeDate, null);
});

test("marks a guitar due by days", () => {
  const maintenance = getGuitarMaintenance(
    guitar({ intervalDays: 60 }),
    [stringsEntry("c", "2026-08-01")],
    [],
    today,
  );

  assert.equal(maintenance.state, "due");
  assert.equal(maintenance.limit, "days");
  assert.equal(maintenance.daysRemaining, -28);
  assert.equal(maintenance.nextChangeDate, "2026-09-30");
});

test("marks a guitar due soon by days", () => {
  const maintenance = getGuitarMaintenance(
    guitar({ intervalDays: 60 }),
    [stringsEntry("c", "2026-09-01")],
    [],
    today,
  );

  assert.equal(maintenance.state, "soon");
  assert.equal(maintenance.daysRemaining, 3);
});

test("marks a guitar due by hours of use", () => {
  const maintenance = getGuitarMaintenance(
    guitar({ intervalHours: 10 }),
    [stringsEntry("c", "2026-09-01")],
    [session("a", "2026-09-20", "guitar-1", 11 * 3600)],
    today,
  );

  assert.equal(maintenance.state, "due");
  assert.equal(maintenance.limit, "hours");
  assert.equal(maintenance.hoursSinceChange, 11);
  assert.equal(maintenance.hoursRemaining, -1);
});

test("marks a guitar due soon by hours of use", () => {
  const maintenance = getGuitarMaintenance(
    guitar({ intervalHours: 10 }),
    [stringsEntry("c", "2026-09-01")],
    [session("a", "2026-09-20", "guitar-1", 9 * 3600)],
    today,
  );

  assert.equal(maintenance.state, "soon");
  assert.equal(maintenance.limit, "hours");
  assert.equal(maintenance.hoursRemaining, 1);
});

test("either configured limit can make the guitar due", () => {
  const byDays = getGuitarMaintenance(
    guitar({ intervalDays: 10, intervalHours: 100 }),
    [stringsEntry("c", "2026-09-01")],
    [],
    today,
  );
  const byHours = getGuitarMaintenance(
    guitar({ intervalDays: 100, intervalHours: 2 }),
    [stringsEntry("c", "2026-10-27")],
    [session("a", "2026-10-28", "guitar-1", 3 * 3600)],
    today,
  );

  assert.equal(byDays.state, "due");
  assert.equal(byDays.limit, "days");
  assert.equal(byHours.state, "due");
  assert.equal(byHours.limit, "hours");
});

test("an up-to-date guitar reports its next change and progress", () => {
  const maintenance = getGuitarMaintenance(
    guitar({ intervalDays: 60 }),
    [stringsEntry("c", "2026-10-01")],
    [session("a", "2026-10-20", "guitar-1", 3600)],
    today,
  );

  assert.equal(maintenance.state, "ok");
  assert.equal(maintenance.daysRemaining, 33);
  assert.equal(maintenance.hoursSinceChange, 1);
  assert.equal(maintenance.nextChangeDate, "2026-11-30");
  assert.equal(Math.round(maintenance.progress * 100), 45);
});

test("sorts guitars by urgency", () => {
  const guitars = [
    guitar({ id: "ok", name: "Ok", intervalDays: 60 }),
    guitar({ id: "due", name: "Due", intervalDays: 5 }),
    guitar({ id: "soon", name: "Soon", intervalDays: 60 }),
  ];
  const entries = [
    stringsEntry("c1", "2026-10-01", "ok"),
    stringsEntry("c2", "2026-10-01", "due"),
    stringsEntry("c3", "2026-09-01", "soon"),
  ];

  assert.deepEqual(
    sortGuitarsByMaintenance(guitars, entries, [], today).map(
      ({ guitar: item }) => item.id,
    ),
    ["due", "soon", "ok"],
  );
});

test("removes a guitar with its entries and leaves the rest alone", () => {
  const removed = removeGuitarFromMaintenance(
    "guitar-1",
    [guitar({ id: "guitar-1" }), guitar({ id: "guitar-2", name: "Dos" })],
    [
      stringsEntry("c1", "2026-10-01", "guitar-1"),
      stringsEntry("c2", "2026-10-01", "guitar-2"),
    ],
  );

  assert.deepEqual(
    removed.guitars.map((item) => item.id),
    ["guitar-2"],
  );
  assert.deepEqual(
    removed.entries.map((item) => item.id),
    ["c2"],
  );
});

test("converts the earlier equipment arrays into one history", () => {
  const entries = migrateLegacyEquipmentEntries({
    stringChanges: [
      {
        id: "change-1",
        guitarId: "guitar-1",
        date: "2026-09-10",
        brand: "Elixir",
        gauge: "10-46",
        createdAt: "2026-09-10T10:00:00.000Z",
        updatedAt: "2026-09-10T10:00:00.000Z",
      },
    ],
    guitarSetups: [
      {
        id: "setup-1",
        guitarId: "guitar-1",
        date: "2026-08-01",
        kind: "repair",
        description: "Ajuste de acción",
        luthier: "Taller",
        createdAt: "2026-08-01T10:00:00.000Z",
        updatedAt: "2026-08-01T10:00:00.000Z",
      },
    ],
  });

  assert.deepEqual(
    entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      text: entry.text,
    })),
    [
      { id: "change-1", kind: "strings", text: "Elixir · 10-46" },
      { id: "setup-1", kind: "note", text: "Ajuste de acción · Taller" },
    ],
  );
});

test("normalizes a guitar and drops invalid intervals", () => {
  const normalized = normalizeGuitar({
    id: "g1",
    name: "  Les Paul  ",
    intervalDays: 0,
    intervalHours: 40,
    photoAssetId: " asset-1 ",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });

  assert.equal(normalized?.name, "Les Paul");
  assert.equal(normalized?.intervalHours, 40);
  assert.equal(normalized?.photoAssetId, "asset-1");
  assert.equal("intervalDays" in (normalized ?? {}), false);

  assert.equal(normalizeGuitar({ id: "g1" }), null);
  assert.equal(normalizeGuitar({ name: "Sin id" }), null);
  assert.equal(normalizeGuitars([{ id: "g1", name: "Uno" }, null]).length, 1);
});

test("a guitar keeps a valid string type and drops an unknown one", () => {
  const kept = normalizeGuitar({ id: "g1", name: "Acústica", stringKind: "acoustic" });
  assert.equal(kept?.stringKind, "acoustic");

  for (const stringKind of ["bass", "", null, 3, undefined]) {
    const dropped = normalizeGuitar({ id: "g1", name: "Sin tipo", stringKind });
    assert.equal(dropped?.stringKind, undefined, `${stringKind} should be dropped`);
  }
});

test("a string-set snapshot keeps a valid image and drops a bad one", () => {
  const kept = normalizeStringSet({
    brand: "D'Addario",
    model: "EXL110",
    image: "/string-sets/daddario-exl110.webp",
  });
  assert.equal(kept?.image, "/string-sets/daddario-exl110.webp");

  for (const image of ["https://ejemplo.com/foto.jpg", "../fuera.webp", 42, ""]) {
    const dropped = normalizeStringSet({
      brand: "D'Addario",
      model: "EXL110",
      image,
    });
    assert.equal(dropped?.image, undefined, `${image} should be dropped`);
  }
});

test("normalizes entries and rejects those without a guitar or a date", () => {
  const entry = normalizeGuitarEntry({
    id: "e1",
    guitarId: "g1",
    date: "2026-10-01",
    kind: "unknown",
    text: "  Ajuste  ",
  });

  assert.equal(entry?.kind, "note");
  assert.equal(entry?.text, "Ajuste");
  assert.equal(entry?.date, "2026-10-01");

  assert.equal(normalizeGuitarEntry({ id: "e1", date: "2026-10-01" }), null);
  assert.equal(
    normalizeGuitarEntry({ id: "e1", guitarId: "g1", date: "2026-02-30" }),
    null,
  );
  assert.equal(
    normalizeGuitarEntry({
      id: "e2",
      guitarId: "g1",
      date: "2026-10-01",
      kind: "strings",
    })?.kind,
    "strings",
  );
  assert.equal(normalizeGuitarEntries([{ id: "e3" }, null]).length, 0);
});

test("inherits the only guitar without asking", () => {
  const only = [guitar()];

  assert.equal(
    resolvePracticeGuitarId({ lastGuitarId: undefined, guitars: only }),
    "guitar-1",
  );
  assert.equal(
    resolvePracticeGuitarId({ lastGuitarId: "deleted", guitars: only }),
    "guitar-1",
  );
});

test("inherits the last guitar used and keeps an explicit choice", () => {
  const guitars = [
    guitar({ id: "guitar-1" }),
    guitar({ id: "guitar-2", name: "Les Paul" }),
  ];

  assert.equal(
    resolvePracticeGuitarId({ lastGuitarId: "guitar-2", guitars }),
    "guitar-2",
  );
  assert.equal(
    resolvePracticeGuitarId({
      explicitId: "guitar-1",
      lastGuitarId: "guitar-2",
      guitars,
    }),
    "guitar-1",
  );
});

test("does not guess between several guitars", () => {
  const guitars = [
    guitar({ id: "guitar-1" }),
    guitar({ id: "guitar-2", name: "Les Paul" }),
  ];

  assert.equal(resolvePracticeGuitarId({ guitars }), undefined);
  assert.equal(resolvePracticeGuitarId({ guitars: [] }), undefined);
  assert.equal(
    resolvePracticeGuitarId({ explicitId: "deleted", guitars }),
    undefined,
  );
});
