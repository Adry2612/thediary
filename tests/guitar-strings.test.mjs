import assert from "node:assert/strict";
import test from "node:test";
import {
  draftToStringSet,
  EMPTY_STRING_SET_DRAFT,
  formatGaugeRange,
  formatStringSet,
  getStringSetById,
  getStringSetsByKind,
  GUITAR_STRING_SETS,
  toGuitarStringSetSnapshot,
} from "../src/utils/guitar-strings.ts";
import { normalizeStringSet } from "../src/utils/equipment.ts";

test("the catalogue holds usable sets of six strings", () => {
  assert.ok(GUITAR_STRING_SETS.length >= 15);

  const ids = new Set();
  for (const set of GUITAR_STRING_SETS) {
    assert.ok(set.id && !ids.has(set.id), `${set.id} repeats`);
    ids.add(set.id);
    assert.ok(set.brand.trim());
    assert.ok(set.model.trim());
    assert.ok(["electric", "acoustic", "classical"].includes(set.kind));
    assert.ok(set.unit === "in" || set.unit === "mm");
    assert.equal(set.gauges.length, 6, `${set.id} needs six gauges`);
    for (const gauge of set.gauges) {
      assert.ok(Number.isFinite(gauge) && gauge > 0);
    }
  }
});

test("classical sets use millimetres and the rest inches", () => {
  for (const set of GUITAR_STRING_SETS) {
    assert.equal(
      set.unit,
      set.kind === "classical" ? "mm" : "in",
      `${set.id} has the wrong unit`,
    );
  }
});

test("every family has its own sets", () => {
  for (const kind of ["electric", "acoustic", "classical"]) {
    const sets = getStringSetsByKind(kind);
    assert.ok(sets.length >= 4, `${kind} needs options`);
    assert.ok(sets.every((set) => set.kind === kind));
  }
  assert.equal(getStringSetById("daddario-exl110")?.brand, "D'Addario");
  assert.equal(getStringSetById("inventado"), undefined);
});

test("the image is optional and never breaks the catalogue", () => {
  for (const set of GUITAR_STRING_SETS) {
    if (set.image === undefined) continue;
    assert.ok(set.image.startsWith("/"), `${set.id} needs a public path`);
  }

  const withoutImage = GUITAR_STRING_SETS[0];
  assert.ok(formatStringSet(withoutImage));
});

test("the snapshot keeps the packaging image when there is one", () => {
  const set = {
    ...GUITAR_STRING_SETS[0],
    image: "/string-sets/daddario-exl110.webp",
  };
  const snapshot = toGuitarStringSetSnapshot(set);

  assert.equal(snapshot.image, "/string-sets/daddario-exl110.webp");
  assert.equal(
    toGuitarStringSetSnapshot({ ...GUITAR_STRING_SETS[0], image: undefined }).image,
    undefined,
  );
});

test("gauges are written as a range", () => {
  assert.equal(formatGaugeRange([10, 13, 17, 26, 36, 46], "in"), "10-46");
  assert.equal(
    formatGaugeRange([0.71, 0.81, 1.02, 0.74, 0.91, 1.09], "mm"),
    "0.71-1.09 mm",
  );
  assert.equal(formatGaugeRange([12], "in"), "12");
  assert.equal(formatGaugeRange([], "in"), "");
});

test("a catalogue set becomes a readable snapshot", () => {
  const draft = { ...EMPTY_STRING_SET_DRAFT, setId: "daddario-exl110" };
  const snapshot = draftToStringSet(draft);

  assert.ok(snapshot);
  assert.equal(snapshot.brand, "D'Addario");
  assert.equal(snapshot.model, "EXL110");
  assert.equal(snapshot.kind, "electric");
  assert.deepEqual(snapshot.gauges, [10, 13, 17, 26, 36, 46]);
  assert.equal(formatStringSet(snapshot), "D'Addario EXL110 · 10-46");
});

test("a custom set keeps what the user typed", () => {
  const draft = {
    ...EMPTY_STRING_SET_DRAFT,
    setId: "custom",
    kind: "acoustic",
    brand: "  Elixir  ",
    model: "Nanoweb",
    gaugeText: "11-52",
  };
  const snapshot = draftToStringSet(draft);

  assert.ok(snapshot);
  assert.equal(snapshot.brand, "Elixir");
  assert.equal(snapshot.kind, "acoustic");
  assert.equal(snapshot.gauges, undefined);
  assert.equal(formatStringSet(snapshot), "Elixir Nanoweb · 11-52");
});

test("nothing is saved when the set is empty or incomplete", () => {
  assert.equal(draftToStringSet(EMPTY_STRING_SET_DRAFT), undefined);
  assert.equal(
    draftToStringSet({ ...EMPTY_STRING_SET_DRAFT, setId: "custom", brand: "" }),
    undefined,
  );
  assert.equal(
    draftToStringSet({ ...EMPTY_STRING_SET_DRAFT, setId: "no-existe" }),
    undefined,
  );
});

test("stored snapshots are normalised and survive partial data", () => {
  const normal = normalizeStringSet({
    brand: "D'Addario",
    model: "EJ45",
    kind: "classical",
    gauges: [0.71, 0.81, 1.02, 0.74, 0.91, 1.09],
    unit: "mm",
  });
  assert.ok(normal);
  assert.equal(normal.kind, "classical");
  assert.equal(normal.gauges?.length, 6);

  const custom = normalizeStringSet({
    brand: "Marca",
    model: "Modelo",
    gaugeText: "10-46",
  });
  assert.ok(custom);
  assert.equal(custom.kind, "electric");
  assert.equal(custom.gaugeText, "10-46");

  assert.equal(normalizeStringSet({ model: "Sin marca" }), undefined);
  assert.equal(normalizeStringSet("texto"), undefined);
  assert.equal(normalizeStringSet(null), undefined);

  const wild = normalizeStringSet({
    brand: "X",
    model: "Y",
    gauges: [10, "13", -1, Number.NaN, 46],
    unit: "pulgadas",
  });
  assert.deepEqual(wild?.gauges, [10, 46]);
  assert.equal(wild?.unit, "in");
});
