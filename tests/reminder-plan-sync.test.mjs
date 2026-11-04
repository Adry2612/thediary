import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_REMINDER_PREFERENCES } from "../src/services/reminder-preferences.ts";
import {
  REMINDER_NOTIFICATION_TAG,
  buildReminderPlanPayload,
  canSyncReminderPlan,
  createReminderPlanScheduler,
  syncReminderPlan,
} from "../src/services/reminder-plan-sync.ts";

const TIME_ZONE = "Europe/Madrid";
const PREFERENCES = { ...DEFAULT_REMINDER_PREFERENCES, enabled: true };
const NOW = new Date("2026-11-04T17:00:00.000Z");

function data() {
  return {
    history: [],
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: "routine-1",
      4: null,
      5: null,
      6: null,
    },
    guitars: [],
    guitarEntries: [],
  };
}

function input(overrides = {}) {
  return {
    userId: "user-1",
    subscriptionId: "subscription-1",
    preferences: PREFERENCES,
    data: data(),
    locale: "es",
    timeZone: TIME_ZONE,
    now: NOW,
    ...overrides,
  };
}

test("refuses to sync for a guest, without subscription or with reminders off", () => {
  assert.equal(canSyncReminderPlan(input()), true);
  assert.equal(canSyncReminderPlan(input({ userId: null })), false);
  assert.equal(canSyncReminderPlan(input({ subscriptionId: null })), false);
  assert.equal(
    canSyncReminderPlan(input({ preferences: { ...PREFERENCES, enabled: false } })),
    false,
  );
});

test("maps the plan to the payload the RPC expects", () => {
  const rows = buildReminderPlanPayload(input({ horizonDays: 5 }));
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], {
    local_date: "2026-11-04",
    scheduled_at: "2026-11-04T18:00:00.000Z",
    title: "thediary.",
    url: "/",
    reasons: [
      {
        kind: "practice",
        text: "Hoy toca «Escalas»",
        url: "/",
        routineId: "routine-1",
      },
    ],
    tag: REMINDER_NOTIFICATION_TAG,
  });
});

test("does not call the RPC when the guard fails", async () => {
  let calls = 0;
  const replace = async () => {
    calls += 1;
  };

  assert.equal(
    await syncReminderPlan(replace, input({ userId: null })),
    false,
  );
  assert.equal(calls, 0);

  assert.equal(await syncReminderPlan(replace, input()), true);
  assert.equal(calls, 1);
});

test("a failing RPC does not throw and reports no sync", async () => {
  const replace = async () => {
    throw new Error("offline");
  };

  assert.equal(await syncReminderPlan(replace, input()), false);
});

test("groups several requests into one write", async () => {
  const calls = [];
  const scheduler = createReminderPlanScheduler(async (subscriptionId, rows) => {
    calls.push({ subscriptionId, rows });
  }, 5);

  scheduler.request(input({ horizonDays: 5 }));
  scheduler.request(input({ horizonDays: 5, timeZone: TIME_ZONE }));
  assert.equal(await scheduler.flush(), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].subscriptionId, "subscription-1");
  assert.equal(calls[0].rows.length, 1);
});

test("cancelling a pending request writes nothing", async () => {
  let calls = 0;
  const scheduler = createReminderPlanScheduler(async () => {
    calls += 1;
  }, 5);

  scheduler.request(input());
  scheduler.cancel();
  await scheduler.flush();
  assert.equal(calls, 0);
});
