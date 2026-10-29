import assert from "node:assert/strict";
import test from "node:test";
import { es } from "../src/i18n/es.ts";
import { en } from "../src/i18n/en.ts";

const dictionaries = [
  { name: "es", dict: es },
  { name: "en", dict: en },
];

test("the three main sections have their own title", () => {
  for (const { name, dict } of dictionaries) {
    const titles = [dict.home.title, dict.dashboard.title, dict.practice.yourPractice];
    assert.equal(
      new Set(titles).size,
      titles.length,
      `${name}: start, dashboard and practice must not repeat a title`,
    );
  }

  assert.equal(es.home.title, "Tu diario");
  assert.equal(es.dashboard.title, "Tu evolución");
  assert.equal(es.practice.yourPractice, "Tu práctica");
});

test("the navigation does not repeat the app name", () => {
  for (const { name, dict } of dictionaries) {
    const brand = dict.app.name.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const homeLabel = dict.navigation.home.replace(/[^a-zA-Z]/g, "").toLowerCase();

    assert.notEqual(homeLabel, brand, `${name}: the first menu item repeats the app name`);
    assert.ok(dict.navigation.home.length <= 10, `${name}: the first menu item stays short`);
  }
});

test("the dashboard label matches its screen", () => {
  assert.equal(es.navigation.dashboard, "Evolución");
  assert.equal(en.navigation.dashboard, "Progress");
  assert.equal(es.navigation.home, "Inicio");
  assert.equal(en.navigation.home, "Home");
});

test("page headers no longer carry an eyebrow label", () => {
  const eyebrowSections = ["settings", "account", "dashboard", "metronomePage"];

  for (const { name, dict } of dictionaries) {
    for (const section of eyebrowSections) {
      assert.equal(
        Object.hasOwn(dict[section], "eyebrow"),
        false,
        `${name}.${section} still defines an eyebrow`,
      );
    }
    assert.equal(Object.hasOwn(dict.repertoireDetail, "eyebrow"), false);
    assert.equal(Object.hasOwn(dict.manualPractice, "eyebrow"), false);
    assert.equal(Object.hasOwn(dict.recordings, "eyebrow"), false);
    assert.equal(Object.hasOwn(dict.licks, "eyebrow"), false);
    assert.equal(Object.hasOwn(dict.practice, "diary"), false);
  }
});
