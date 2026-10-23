import assert from "node:assert/strict";
import test from "node:test";
import { enablePlaybackAudioSession } from "../src/services/audio-session.ts";

function withNavigator(descriptor, run) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    ...descriptor,
  });
  try {
    run();
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else delete globalThis.navigator;
  }
}

test("declara la sesión de audio como reproducción cuando existe", () => {
  const audioSession = { type: "auto" };
  withNavigator({ value: { audioSession } }, () => {
    enablePlaybackAudioSession();
  });
  assert.equal(audioSession.type, "playback");
});

test("no falla cuando el navegador no expone la sesión de audio", () => {
  withNavigator({ value: {} }, () => {
    assert.doesNotThrow(() => enablePlaybackAudioSession());
  });
});

test("ignora un navegador que rechaza el cambio de sesión", () => {
  const audioSession = {
    set type(_value) {
      throw new Error("no permitido");
    },
  };
  withNavigator({ value: { audioSession } }, () => {
    assert.doesNotThrow(() => enablePlaybackAudioSession());
  });
});
