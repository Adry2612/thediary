import assert from "node:assert/strict";
import test from "node:test";
import {
  getMetronomeScaleZone,
  getTempoMarking,
} from "../src/lib/metronome-scale.ts";

test("tempo scale uses warning colors at both ends", () => {
  assert.equal(getMetronomeScaleZone(0), "edge");
  assert.equal(getMetronomeScaleZone(1), "edge");
});

test("tempo scale marks the central range as active", () => {
  assert.equal(getMetronomeScaleZone(0.3), "transition");
  assert.equal(getMetronomeScaleZone(0.5), "active");
  assert.equal(getMetronomeScaleZone(0.7), "transition");
});

test("tempo scale clamps positions outside the slider", () => {
  assert.equal(getMetronomeScaleZone(-0.1), "edge");
  assert.equal(getMetronomeScaleZone(1.1), "edge");
});

test("tempo markings use the supplied BPM boundaries", () => {
  const expectedMarkings = [
    [40, "Largo"],
    [59, "Largo"],
    [60, "Larghetto"],
    [65, "Larghetto"],
    [66, "Adagio"],
    [75, "Adagio"],
    [76, "Andante"],
    [107, "Andante"],
    [108, "Moderato"],
    [119, "Moderato"],
    [120, "Allegro"],
    [167, "Allegro"],
    [168, "Presto"],
    [199, "Presto"],
    [200, "Prestissimo"],
    [240, "Prestissimo"],
  ];

  for (const [bpm, name] of expectedMarkings) {
    assert.equal(getTempoMarking(bpm).name, name);
  }
});
