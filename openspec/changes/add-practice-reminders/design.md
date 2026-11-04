# Design

## Context

See `proposal.md` for motivation and `specs/` for the required behavior.

- The app is a Next.js App Router PWA with a manifest but **no service worker and no push infrastructure** today.
- Practice data lives in a Zustand store persisted to `localStorage`; signed-in users sync the whole snapshot to `practice_data.state` in Supabase. Guests have no server-side copy.
- The schedule is a weekday → routine map (`weeklySchedule`), sessions carry `startedAt` and `guitarId`, and guitar due state already exists in `getGuitarMaintenance`.
- Supabase provides auth, Postgres and storage. The repo contains migrations but no deployment config; Edge Functions and `pg_cron` must be deployed and scheduled explicitly.
- Tests run with Node's native TypeScript import, so pure logic can be tested without a browser or Supabase.

## Goals / Non-Goals

**Goals:**

- Reuse the existing schedule, session and maintenance rules instead of duplicating them in SQL.
- Deliver exactly one notification per device and local day, at a time the user chose, with the app closed.
- Keep the feature usable when push is impossible: guests, unsupported browsers and blocked permissions get the in-app row.
- Keep secrets out of the repository and make the backend safe to deploy incrementally.

**Non-Goals:**

- Server-side analytics, delivery reports or a notification inbox.
- Cross-device preference sync; each device owns its permission, subscription and plan.
- Per-type times, quiet hours, custom sounds or per-guitar selection.
- Native apps, email or SMS.

## Decisions

### 1. The device computes the reminder plan; the server only filters and sends

The client builds a plan of up to 90 days, at most one entry per local date, using the existing schedule and maintenance logic. Each entry stores a localized title, the applicable reasons with their text and URL, and the local date. The plan is written to Supabase and an Edge Function sends the entries that are due.

Why not compute everything in the server:

- The maintenance rules (days, hours of use since the last change, due-soon thresholds) and the weekly schedule already exist in TypeScript. Reimplementing them in SQL or Deno risks drift.
- The client already holds the full snapshot and can regenerate the plan on every change.
- The server stays a small, auditable sender.

Why not keep the plan only on the device:

- A push must be sent while the app is closed, so the plan has to be reachable by the scheduler.
- The plan is per subscription, so a second device does not overwrite the first one's schedule.

**Staleness backstop:** a plan can be up to 90 days old if the device is never opened. Before sending, the Edge Function compares each reason with `practice_data.state` and drops the ones that no longer hold:

- `practice`: drop if a session exists on the entry's local date.
- `inactivity`: drop if the newest session is later than the stored `lastPracticeDate`.
- `strings`: drop if the guitar's newest string change is later than the stored `lastChangeDate`.

If no reason survives, the entry is discarded. This covers practising or changing strings from another device without duplicating the full domain logic in the sender.

### 2. A structured plan instead of a prebuilt message

Each plan entry stores:

```ts
type ReminderReason =
  | { kind: "practice"; text: string; url: string; routineId: string }
  | { kind: "strings"; text: string; url: string; guitarId: string; lastChangeDate: string }
  | { kind: "inactivity"; text: string; url: string; lastPracticeDate: string };

type ReminderPlanEntry = {
  localDate: string;       // YYYY-MM-DD en la zona de la suscripción
  scheduledAt: string;     // instante UTC ya resuelto
  title: string;
  reasons: ReminderReason[];
};
```

Texts are localized when the plan is written, so the sender never needs the i18n bundle. The sender joins the surviving texts and picks the URL of the first surviving reason (practice/inactivity → `/`, strings → `/tools#tools-strings`). Storing reasons separately is what allows the stale filter to remove one line without rebuilding the whole message.

### 3. Plan generation reuses existing rules

- **Practice:** for each local date, if `weeklySchedule[weekday]` points to an existing template and no session falls on that date, add the reason with the routine name.
- **Strings:** for each guitar, use the newest string change and its intervals. A day-based due date is `lastChange + intervalDays`. Hours-based due state is evaluated with the current usage; it cannot be projected into the future, so a guitar that is not due yet is re-evaluated whenever the app opens or a session is saved. Once due, the reason repeats at most every seven days to avoid a daily nag.
- **Inactivity:** the first date is `lastSessionDate + inactivityDays`; after that it repeats every seven days. No session ever means no inactivity reason.
- **Combination:** reasons for the same local date become one entry. If the chosen time has already passed today, the plan starts tomorrow.
- **Horizon:** 90 local dates. A plan replacement deletes all entries for the subscription from today onwards and inserts the new ones atomically through an RPC, so a partial failure cannot duplicate or lose the whole plan.

### 4. Preferences are device-local

The master switch, the three reasons, the time and the inactivity threshold live in `localStorage` under a versioned key (`thediary.reminders.v1`), normalized on read. They intentionally do **not** enter `practice_data`:

- Permission and subscription are per device; syncing an "enabled" flag would lie on a device without permission.
- Guests use the same preferences for the in-app row.
- No changes to the persisted practice schema, merge rules or cloud import are needed.

A small external store (with `useSyncExternalStore`) keeps Settings and the Home row in sync without adding a second Zustand slice. A storage event handles changes from another tab.

### 5. Time zones and DST are resolved on the device

The subscription stores its IANA time zone. `localDateTimeToUtc(dateKey, "HH:MM", timeZone)` resolves the wall time with `Intl.DateTimeFormat` and corrects the offset iteratively. Ambiguous or nonexistent DST times are shifted to the next valid instant. Tests cover Europe/Madrid's spring and autumn transitions and a time zone west of Greenwich.

The sender never converts wall times: it receives `scheduled_at` as a UTC instant and uses the subscription time zone only to decide the end of the local day and to compare session dates for the stale filter.

### 6. Delivery window and deduplication

- `pg_cron` calls the function every 5 minutes through `pg_net`.
- The function selects entries with `sent_at is null` and `scheduled_at <= now()`, capped to the same local day (maximum 24 hours late).
- If several entries for one subscription are due, only the oldest is sent; the rest are discarded as stale.
- Success sets `sent_at`. A transient failure leaves the row for the next run and increments `attempts`; after five attempts or the end of the local day, the row is discarded.
- `404`/`410` from the push service deletes the subscription and cascades its plan.
- The `tag` is stable (`thediary-daily`) so a repeated delivery replaces the notification instead of stacking it.

### 7. Subscription lifecycle

- Register `/sw.js` at app start without asking for permission.
- Enabling reminders requires a signed-in user, runs inside the click gesture, requests permission, subscribes with the VAPID public key and upserts the row by `endpoint`.
- Every app start with reminders enabled and permission granted refreshes the subscription, the time zone and the plan. This also repairs a subscription rotated by the browser.
- Disabling reminders, signing out or losing the account removes the subscription and its plan. Switching accounts deletes the old row before creating the new one.
- A missing `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is treated as "not configured": the UI explains it and the in-app row keeps working.

### 8. Service worker stays minimal

`public/sw.js` handles only `push`, `notificationclick` and `pushsubscriptionchange`. It has no `fetch` handler and no cache, so it cannot interfere with Next.js assets or stale deployments. `notificationclick` focuses an existing client and navigates it, or opens a new window.

`pushsubscriptionchange` posts a message to open clients so the next app focus re-registers; if no client is open, the stale subscription is cleaned up when the push service rejects it.

### 9. In-app row uses the same evaluation at runtime

`useInAppReminder` evaluates today's reasons with the current store, the device preferences and the local time. It is available when the device cannot use push (guest, unsupported, permission not granted, or no active subscription) and the chosen time has passed. Dismissal is a per-local-date `localStorage` key. The row is rendered under the page header on Home and disappears as soon as no reason applies.

The existing string line on Home remains: the in-app row is a general reminder, while the string line is the standing maintenance status.

### 10. Backend shape

- `push_subscriptions`: one row per browser subscription (`user_id`, `endpoint` unique, `p256dh`, `auth`, `timezone`, timestamps). RLS lets a user manage only their own rows.
- `push_reminder_plan`: one row per subscription and local date (`scheduled_at`, `title`, `reasons jsonb`, `url`, `tag`, `sent_at`, `attempts`). Unique `(subscription_id, local_date)`; RLS by `user_id`; service role bypasses it for sending.
- `replace_reminder_plan(subscription_id, rows)` as a security-definer RPC that checks ownership and replaces today-onwards rows atomically.
- `send-reminders` Edge Function: shared-secret header, service-role query, `web-push` with VAPID, stale filter, batch limit, invalid-subscription cleanup.
- A migration schedules `pg_cron` only when the Vault secrets exist; otherwise it leaves a notice. Secrets: function URL, cron secret, VAPID keys.

The alternative — a Next.js API route with an external cron — was rejected because the repository has no deployment target configured and Supabase is already the backend of record.

## Risks / Trade-offs

- **iOS requires the app to be installed** (16.4+) for Web Push → the in-app row covers browser-only users and Settings states the requirement.
- **Lock-screen privacy**: a notification may show a routine or guitar name → keep texts short and documented; a generic-text mode can be added later without changing the delivery contract.
- **Plan staleness across devices** → the sender drops practice, inactivity and string reasons that the cloud data contradicts.
- **A device that never opens the app** cannot extend its 90-day plan → it receives the reminders already planned, then stops; reopening the app rebuilds it.
- **DST and travel** → the plan stores UTC instants resolved on the device; a time-zone change is refreshed on the next app start.
- **VAPID rotation invalidates subscriptions** → Settings detects the failure and asks to enable reminders again; the migration documents the rotation steps.
- **Push service or cron outage** → retries every 5 minutes during the same local day; no reminder is sent the next day.
- **Localized content is frozen at plan time** → changing the language or a routine name regenerates the plan on the next app use.

## Migration Plan

1. Apply the additive migration: tables, indexes, RLS and the replacement RPC. It is safe to ship before the UI.
2. Generate VAPID keys, set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the app and the private key/subject as Edge Function secrets.
3. Deploy `send-reminders` and create the Vault entries the cron migration reads; schedule it every 5 minutes.
4. Ship the UI. With no keys or function, it shows the "not configured" state and the in-app row.
5. Rollback: unschedule the cron job and disable the function first; the tables are additive and can stay. Existing subscriptions are removed when the user disables reminders or the push service reports them invalid.

## Open Questions

None. The delivery channel, time, threshold, combined format and per-device scope are decided; remaining choices are implementation details covered by the tasks.
