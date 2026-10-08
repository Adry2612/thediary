import assert from "node:assert/strict";
import test from "node:test";
import {
  closeMetronomeAudioContext,
  getOrCreateMetronomeAudioContext,
  resumeMetronomeAudioContext,
  suspendMetronomeAudioContext,
} from "../src/lib/metronome-audio-context.ts";

class FakeAudioContext {
  state = "suspended";
  resumeCalls = 0;
  suspendCalls = 0;
  closeCalls = 0;

  async resume() {
    this.resumeCalls += 1;
    this.state = "running";
  }

  async suspend() {
    this.suspendCalls += 1;
    this.state = "suspended";
  }

  async close() {
    this.closeCalls += 1;
    this.state = "closed";
  }
}

test("reuses an open context and replaces a closed one", () => {
  const existing = new FakeAudioContext();
  const reused = getOrCreateMetronomeAudioContext(existing, FakeAudioContext);
  assert.equal(reused, existing);

  existing.state = "closed";
  const replacement = getOrCreateMetronomeAudioContext(
    existing,
    FakeAudioContext,
  );
  assert.notEqual(replacement, existing);
});

test("resumes the context and propagates browser errors", async () => {
  const context = new FakeAudioContext();
  await resumeMetronomeAudioContext(context);
  assert.equal(context.state, "running");
  assert.equal(context.resumeCalls, 1);

  context.resume = async () => {
    throw new Error("resume failed");
  };
  await assert.rejects(
    resumeMetronomeAudioContext(context),
    /resume failed/,
  );
});

test("suspends only a running context and closes open contexts", async () => {
  const context = new FakeAudioContext();

  await suspendMetronomeAudioContext(context);
  assert.equal(context.suspendCalls, 0);

  context.state = "running";
  await suspendMetronomeAudioContext(context);
  assert.equal(context.state, "suspended");
  assert.equal(context.suspendCalls, 1);

  closeMetronomeAudioContext(context);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(context.state, "closed");
  assert.equal(context.closeCalls, 1);

  closeMetronomeAudioContext(context);
  assert.equal(context.closeCalls, 1);
});
