import assert from "node:assert/strict";
import test from "node:test";
import {
  isIOSWebKit,
  needsAudioGesture,
  normalizeAudioSessionState,
  shouldResumeAudio,
} from "../src/utils/audio-resume.ts";

test("resumes only an active tool when the page becomes visible", () => {
  assert.equal(shouldResumeAudio({ isActive: true, isVisible: true }), true);
});

test("does nothing for an idle tool or a hidden page", () => {
  assert.equal(shouldResumeAudio({ isActive: false, isVisible: true }), false);
  assert.equal(shouldResumeAudio({ isActive: true, isVisible: false }), false);
});

test("normalizes the audio session state", () => {
  assert.equal(normalizeAudioSessionState("active"), "active");
  assert.equal(normalizeAudioSessionState("interrupted"), "interrupted");
  assert.equal(normalizeAudioSessionState("inactive"), "inactive");
  assert.equal(normalizeAudioSessionState(undefined), "unknown");
  assert.equal(normalizeAudioSessionState("something-else"), "unknown");
});

test("does not ask for a gesture when the context and session are healthy", () => {
  assert.equal(needsAudioGesture("running", "active"), false);
  assert.equal(needsAudioGesture("running", "unknown"), false);
});

test("asks for a gesture when the context is not running", () => {
  assert.equal(needsAudioGesture("suspended", "active"), true);
  assert.equal(needsAudioGesture("interrupted", "active"), true);
});

test("asks for a gesture when iOS interrupts the audio session", () => {
  // El caso que deja el metrónomo mudo tras bloquear la pantalla: el
  // contexto sigue en `running` pero la sesión está interrumpida.
  assert.equal(needsAudioGesture("running", "interrupted"), true);
  assert.equal(needsAudioGesture("running", "inactive"), true);
});

test("detects iOS and iPadOS user agents", () => {
  assert.equal(
    isIOSWebKit(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
      "iPhone",
      5,
    ),
    true,
  );
  assert.equal(
    isIOSWebKit(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
      "MacIntel",
      5,
    ),
    true,
  );
  assert.equal(
    isIOSWebKit("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 0),
    false,
  );
  assert.equal(
    isIOSWebKit("Mozilla/5.0 (X11; Linux x86_64)", "Linux x86_64", 0),
    false,
  );
});
