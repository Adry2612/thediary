import assert from "node:assert/strict";
import test from "node:test";
import {
  getMetronomeMeter,
  getMetronomeSubdivisionOptions,
  METRONOME_METERS,
} from "../src/lib/metronome-meter.ts";

test("includes the displayed compound meters and the existing 4/4 meter", () => {
  assert.deepEqual(
    METRONOME_METERS.map(({ signature }) => signature),
    ["4/4", "6/8", "6/4", "9/8", "9/4", "12/8", "12/4"],
  );
});

test("groups compound meters into two, three, or four dotted-note pulses", () => {
  assert.deepEqual(
    ["6/8", "9/8", "12/8", "6/4", "9/4", "12/4"].map((signature) => {
      const { beatsPerMeasure, beatDurationQuarterNotes, beatUnitLabel } =
        getMetronomeMeter(signature);
      return { beatsPerMeasure, beatDurationQuarterNotes, beatUnitLabel };
    }),
    [
      { beatsPerMeasure: 2, beatDurationQuarterNotes: 1.5, beatUnitLabel: "Negra con puntillo" },
      { beatsPerMeasure: 3, beatDurationQuarterNotes: 1.5, beatUnitLabel: "Negra con puntillo" },
      { beatsPerMeasure: 4, beatDurationQuarterNotes: 1.5, beatUnitLabel: "Negra con puntillo" },
      { beatsPerMeasure: 2, beatDurationQuarterNotes: 3, beatUnitLabel: "Blanca con puntillo" },
      { beatsPerMeasure: 3, beatDurationQuarterNotes: 3, beatUnitLabel: "Blanca con puntillo" },
      { beatsPerMeasure: 4, beatDurationQuarterNotes: 3, beatUnitLabel: "Blanca con puntillo" },
    ],
  );
});

test("names compound-meter subdivisions by the note value in its denominator", () => {
  const eighthNoteOptions = getMetronomeSubdivisionOptions(getMetronomeMeter("6/8"));
  const quarterNoteOptions = getMetronomeSubdivisionOptions(getMetronomeMeter("6/4"));

  assert.match(eighthNoteOptions.find(({ value }) => value === 3).label, /corcheas/i);
  assert.match(quarterNoteOptions.find(({ value }) => value === 3).label, /negras/i);
  assert.deepEqual(
    eighthNoteOptions.map(({ shortLabel }) => shortLabel),
    ["Pulso", "2 por pulso", "Corcheas", "4 por pulso"],
  );
});
