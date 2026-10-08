import assert from "node:assert/strict";
import test from "node:test";
import { TUTORIAL_STEPS } from "../src/lib/tutorial-steps.ts";

test("tutorial keeps all five app tour stops", () => {
  assert.deepEqual(
    TUTORIAL_STEPS.map(({ target, href }) => ({ target, href })),
    [
      { target: "brand", href: undefined },
      { target: "practice-plan", href: "/practice" },
      { target: "dashboard-summary", href: "/dashboard" },
      { target: "metronome-controls", href: "/metronome" },
      { target: "settings-account", href: "/settings" },
    ],
  );
});

test("tutorial still explains practice, progress, and saved material", () => {
  const content = TUTORIAL_STEPS.map(({ title, description }) =>
    `${title} ${description}`,
  ).join(" ");

  assert.match(content, /metrónomo/i);
  assert.match(content, /repertorio/i);
  assert.match(content, /grabaciones/i);
  assert.match(content, /progreso/i);
});
