import assert from "node:assert/strict";
import test from "node:test";
import {
  filterStudyMaterials,
  getStudyMaterialSourceMode,
  isHttpsUrl,
  normalizeStudyMaterials,
  studyMaterialToResource,
} from "../src/utils/study-materials.ts";
import { normalizePracticeStorageState } from "../src/stores/normalizePracticeStorageState.ts";
import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
} from "../src/utils/practice-goals.ts";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
} from "../src/utils/weekly-routine-schedule.ts";

const normalizers = {
  normalizeGoals: normalizePracticeGoals,
  normalizeSchedule: normalizeWeeklyRoutineSchedule,
};

function material(overrides = {}) {
  return {
    id: "m1",
    title: "Escala mayor",
    kind: "pdf",
    assetId: "asset-1",
    fileName: "escala.pdf",
    notes: "Digitación",
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    ...overrides,
  };
}

test("an old state without the library hydrates with an empty collection", () => {
  const state = normalizePracticeStorageState({
    state: undefined,
    ...normalizers,
  });

  assert.deepEqual(state.studyMaterials, []);
  assert.equal(state.weeklySchedule[0], DEFAULT_WEEKLY_ROUTINE_SCHEDULE[0]);
  assert.equal(state.practiceGoals.dailyMinutes, DEFAULT_PRACTICE_GOALS.dailyMinutes);
});

test("malformed materials are discarded and valid ones kept", () => {
  const normalized = normalizeStudyMaterials([
    null,
    {},
    { id: "m1", title: "  ", kind: "pdf" },
    { id: "m2", title: "Sin tipo", kind: "nope" },
    { id: "m3", title: "  Válido  ", kind: "pdf", notes: "  Nota  " },
    { id: "m3", title: "Duplicado", kind: "pdf" },
  ]);

  assert.deepEqual(normalized, [
    {
      id: "m3",
      title: "Válido",
      kind: "pdf",
      notes: "Nota",
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    },
  ]);
});

test("filters by title and notes without accents or case", () => {
  const materials = [
    material({ id: "a", title: "Escala pentatónica", notes: "Digitación" }),
    material({ id: "b", title: "Arpegios", notes: "Cuerdas limpias" }),
  ];

  assert.deepEqual(
    filterStudyMaterials(materials, { query: "pentatonica", kind: "all" }).map(
      (entry) => entry.id,
    ),
    ["a"],
  );
  assert.deepEqual(
    filterStudyMaterials(materials, { query: "cuerdas", kind: "all" }).map(
      (entry) => entry.id,
    ),
    ["b"],
  );
});

test("sorts by most recently updated and filters by kind", () => {
  const materials = [
    material({ id: "old", kind: "pdf", updatedAt: "2026-10-01T00:00:00.000Z" }),
    material({ id: "new", kind: "guitarpro", updatedAt: "2026-11-03T00:00:00.000Z" }),
    material({ id: "mid", kind: "pdf", updatedAt: "2026-11-02T00:00:00.000Z" }),
  ];

  assert.deepEqual(
    filterStudyMaterials(materials, { query: "", kind: "all" }).map(
      (entry) => entry.id,
    ),
    ["new", "mid", "old"],
  );
  assert.deepEqual(
    filterStudyMaterials(materials, { query: "", kind: "pdf" }).map(
      (entry) => entry.id,
    ),
    ["mid", "old"],
  );
  assert.deepEqual(
    filterStudyMaterials(materials, { query: "nada", kind: "pdf" }),
    [],
  );
});

test("does not mutate the saved list when filtering", () => {
  const materials = [
    material({ id: "a", updatedAt: "2026-10-01T00:00:00.000Z" }),
    material({ id: "b", updatedAt: "2026-11-01T00:00:00.000Z" }),
  ];
  const snapshot = materials.map((entry) => ({ ...entry }));

  filterStudyMaterials(materials, { query: "", kind: "all" });

  assert.deepEqual(materials, snapshot);
});

test("converts a material into an independent practice resource", () => {
  const source = material({
    kind: "youtube",
    assetId: undefined,
    fileName: undefined,
    url: "https://www.youtube.com/watch?v=abc123def45",
  });
  const resource = studyMaterialToResource(source, "copy-1");

  assert.deepEqual(resource, {
    id: "copy-1",
    title: "Escala mayor",
    kind: "youtube",
    url: "https://www.youtube.com/watch?v=abc123def45",
  });
  assert.equal(source.id, "m1");
  assert.equal(resource.id === source.id, false);
  assert.equal("notes" in resource, false);
});

test("copies the file fields it needs", () => {
  assert.deepEqual(
    studyMaterialToResource(
      material({ kind: "pdf", id: "m2", title: "Método" }),
      "copy-2",
    ),
    {
      id: "copy-2",
      title: "Método",
      kind: "pdf",
      assetId: "asset-1",
      fileName: "escala.pdf",
    },
  );
  assert.deepEqual(
    studyMaterialToResource(
      material({ kind: "guitarpro", id: "m3", title: "Riff" }),
      "copy-3",
    ),
    {
      id: "copy-3",
      title: "Riff",
      kind: "guitarpro",
      assetId: "asset-1",
      fileName: "escala.pdf",
    },
  );
});

test("classifies each kind by its source input", () => {
  assert.equal(getStudyMaterialSourceMode("youtube"), "url");
  assert.equal(getStudyMaterialSourceMode("spotify"), "url");
  assert.equal(getStudyMaterialSourceMode("songsterr"), "url");
  assert.equal(getStudyMaterialSourceMode("link"), "url");
  assert.equal(getStudyMaterialSourceMode("pdf"), "file");
  assert.equal(getStudyMaterialSourceMode("image"), "file");
  assert.equal(getStudyMaterialSourceMode("guitarpro"), "file");
});

test("only accepts HTTPS for a generic link", () => {
  assert.equal(isHttpsUrl("https://example.com/a"), true);
  assert.equal(isHttpsUrl("http://example.com/a"), false);
  assert.equal(isHttpsUrl("no es una url"), false);
});
