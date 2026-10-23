import assert from "node:assert/strict";
import test from "node:test";
import {
  applySkillChange,
  getLickOptions,
  getRepertoirePartOptions,
  getRepertoireSongChanges,
  getTechniqueNames,
  shouldAdoptLinkedTitle,
} from "../src/utils/practice-block-editor.ts";

test("offers the technique catalogue plus a legacy custom technique", () => {
  assert.deepEqual(getTechniqueNames(["Púa alterna", "Legato"], ""), [
    "Púa alterna",
    "Legato",
  ]);
  assert.deepEqual(getTechniqueNames(["Púa alterna"], "Barrido propio"), [
    "Púa alterna",
    "Barrido propio",
  ]);
  assert.deepEqual(getTechniqueNames(["Púa alterna"], " Púa alterna "), [
    "Púa alterna",
  ]);
});

test("a song choice always writes the song title and clears the part", () => {
  assert.deepEqual(
    getRepertoireSongChanges({ id: "song-2", title: "Otra canción" }),
    {
      name: "Otra canción",
      repertoireItemId: "song-2",
      repertoirePartId: undefined,
    },
  );
});

test("offers the parts of the chosen song and no part by default", () => {
  assert.deepEqual(
    getRepertoirePartOptions(
      {
        id: "song-1",
        kind: "song",
        title: "Canción",
        parts: [
          { id: "part-1", name: "Intro" },
          { id: "part-2", name: "Estribillo" },
        ],
      },
      "Sin parte",
    ),
    [
      { value: "", label: "Sin parte" },
      { value: "part-1", label: "Intro" },
      { value: "part-2", label: "Estribillo" },
    ],
  );
});

test("offers only licks and keeps a missing reference visible", () => {
  assert.deepEqual(
    getLickOptions(
      [{ id: "lick-1", title: "Frase" }],
      "Elige un lick",
      "missing-lick",
      "La referencia ya no existe",
    ),
    [
      { value: "", label: "Elige un lick" },
      { value: "lick-1", label: "Frase" },
      { value: "missing-lick", label: "La referencia ya no existe" },
    ],
  );
});

test("changing the category clears links that no longer apply", () => {
  const phase = {
    id: "phase-1",
    name: "Canción",
    durationMinutes: 10,
    skill: "repertoire",
    repertoireItemId: "song-1",
    repertoirePartId: "part-1",
    lickId: "lick-1",
  };

  assert.deepEqual(applySkillChange(phase, "lick"), {
    id: "phase-1",
    name: "Canción",
    durationMinutes: 10,
    skill: "lick",
    lickId: "lick-1",
    repertoireItemId: undefined,
    repertoirePartId: undefined,
  });

  assert.deepEqual(applySkillChange(phase, "technique"), {
    id: "phase-1",
    name: "Canción",
    durationMinutes: 10,
    skill: "technique",
    lickId: undefined,
    repertoireItemId: undefined,
    repertoirePartId: undefined,
  });
});

test("adopts the linked title only when the name was empty or the previous title", () => {
  assert.equal(shouldAdoptLinkedTitle("", "Anterior"), true);
  assert.equal(shouldAdoptLinkedTitle("   ", undefined), true);
  assert.equal(shouldAdoptLinkedTitle("Anterior", "Anterior"), true);
  assert.equal(shouldAdoptLinkedTitle("Mi nombre", "Anterior"), false);
});
