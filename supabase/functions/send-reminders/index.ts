// Envía los recordatorios push que ya vencieron. Se invoca desde pg_cron.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

interface PlanRow {
  id: string;
  user_id: string;
  subscription_id: string;
  local_date: string;
  title: string;
  url: string;
  tag: string;
  reasons: ReminderReason[];
  attempts: number;
  push_subscriptions:
    | {
        endpoint: string;
        p256dh: string;
        auth: string;
        timezone: string;
      }
    | {
        endpoint: string;
        p256dh: string;
        auth: string;
        timezone: string;
      }[];
}

interface ReminderReason {
  kind: "practice" | "strings" | "inactivity";
  text: string;
  url: string;
  guitarId?: string;
  lastChangeDate?: string;
  lastPracticeDate?: string;
}

interface PracticeState {
  history?: { startedAt?: string }[];
  guitarEntries?: { guitarId?: string; date?: string; kind?: string }[];
}

const BATCH_LIMIT = 200;
const MAX_ATTEMPTS = 5;

const CORS_HEADERS = {
  "Content-Type": "application/json",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS,
  });
}

function getSecret(name: string): string {
  return Deno.env.get(name)?.trim() ?? "";
}

function localDateKey(instant: string, timeZone: string): string | null {
  const time = Date.parse(instant);
  if (Number.isNaN(time)) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(time));
    const values: Record<string, string> = {};
    for (const part of parts) values[part.type] = part.value;
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return null;
  }
}

function newestSessionDate(
  state: PracticeState,
  timeZone: string,
): string | null {
  let newest: string | null = null;
  for (const session of state.history ?? []) {
    if (!session.startedAt) continue;
    const dateKey = localDateKey(session.startedAt, timeZone);
    if (dateKey && (!newest || dateKey > newest)) newest = dateKey;
  }
  return newest;
}

/** Descarta los motivos que los datos actuales de la cuenta ya contradicen. */
function filterReasons(
  reasons: ReminderReason[],
  entryDate: string,
  state: PracticeState | null,
  timeZone: string,
): ReminderReason[] {
  if (!state) return reasons;

  return reasons.filter((reason) => {
    if (reason.kind === "practice") {
      return !(state.history ?? []).some(
        (session) =>
          session.startedAt &&
          localDateKey(session.startedAt, timeZone) === entryDate,
      );
    }

    if (reason.kind === "inactivity") {
      if (!reason.lastPracticeDate) return true;
      const newest = newestSessionDate(state, timeZone);
      return newest === null || newest <= reason.lastPracticeDate;
    }

    if (reason.kind === "strings") {
      if (!reason.guitarId || !reason.lastChangeDate) return true;
      const latest = (state.guitarEntries ?? [])
        .filter(
          (entry) =>
            entry.guitarId === reason.guitarId && entry.kind === "strings",
        )
        .reduce<string | null>(
          (newest, entry) =>
            entry.date && (!newest || entry.date > newest)
              ? entry.date
              : newest,
          null,
        );
      return !latest || latest <= reason.lastChangeDate;
    }

    return true;
  });
}

function subscriptionOf(row: PlanRow) {
  return Array.isArray(row.push_subscriptions)
    ? row.push_subscriptions[0]
    : row.push_subscriptions;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, 405);
  }

  const expectedSecret = getSecret("SEND_REMINDERS_SECRET");
  const providedSecret = request.headers.get("x-cron-secret") ?? "";
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublic = getSecret("VAPID_PUBLIC_KEY");
  const vapidPrivate = getSecret("VAPID_PRIVATE_KEY");
  const vapidSubject = getSecret("VAPID_SUBJECT");

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "supabase is not configured" }, 500);
  }
  if (!vapidPublic || !vapidPrivate || !vapidSubject) {
    return jsonResponse({ error: "vapid is not configured" }, 500);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: due, error: dueError } = await supabase
    .from("push_reminder_plan")
    .select(
      "id, user_id, subscription_id, local_date, title, url, tag, reasons, attempts, push_subscriptions!inner(endpoint, p256dh, auth, timezone)",
    )
    .is("sent_at", null)
    .lte("scheduled_at", new Date().toISOString())
    .lt("attempts", MAX_ATTEMPTS)
    .order("scheduled_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (dueError) {
    return jsonResponse({ error: "could not read the plan" }, 500);
  }

  const rows = (due ?? []) as unknown as PlanRow[];
  if (rows.length === 0) {
    return jsonResponse({ sent: 0, skipped: 0, failed: 0, removed: 0 });
  }

  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const { data: states } = await supabase
    .from("practice_data")
    .select("user_id, state")
    .in("user_id", userIds);

  const stateByUser = new Map<string, PracticeState>();
  for (const record of states ?? []) {
    stateByUser.set(
      record.user_id as string,
      (record.state ?? {}) as PracticeState,
    );
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let removed = 0;
  const handledSubscriptions = new Set<string>();

  for (const row of rows) {
    const subscription = subscriptionOf(row);
    if (!subscription) {
      await supabase.from("push_reminder_plan").delete().eq("id", row.id);
      skipped += 1;
      continue;
    }

    // Solo la entrada más antigua de cada suscripción: el resto sobra.
    if (handledSubscriptions.has(row.subscription_id)) {
      await supabase.from("push_reminder_plan").delete().eq("id", row.id);
      skipped += 1;
      continue;
    }
    handledSubscriptions.add(row.subscription_id);

    // Una entrada de un día local anterior ya no se envía.
    const todayKey = localDateKey(new Date().toISOString(), subscription.timezone);
    if (todayKey && row.local_date < todayKey) {
      await supabase.from("push_reminder_plan").delete().eq("id", row.id);
      skipped += 1;
      continue;
    }

    const reasons = filterReasons(
      Array.isArray(row.reasons) ? row.reasons : [],
      row.local_date,
      stateByUser.get(row.user_id) ?? null,
      subscription.timezone,
    );

    if (reasons.length === 0) {
      await supabase.from("push_reminder_plan").delete().eq("id", row.id);
      skipped += 1;
      continue;
    }

    const payload = JSON.stringify({
      title: row.title,
      body: reasons.map((reason) => reason.text).join("\n"),
      url: reasons[0]?.url ?? row.url,
      tag: row.tag,
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
        { TTL: 3600 },
      );
      await supabase
        .from("push_reminder_plan")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", row.id);
      sent += 1;
    } catch (error) {
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? Number((error as { statusCode: unknown }).statusCode)
          : 0;
      failed += 1;

      if (statusCode === 404 || statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("id", row.subscription_id);
        removed += 1;
        continue;
      }

      const attempts = row.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await supabase.from("push_reminder_plan").delete().eq("id", row.id);
      } else {
        await supabase
          .from("push_reminder_plan")
          .update({ attempts })
          .eq("id", row.id);
      }
    }
  }

  return jsonResponse({ sent, skipped, failed, removed });
});
