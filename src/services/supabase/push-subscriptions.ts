import { getSupabaseClient } from "./client.ts";
import type { PushSubscriptionPayload } from "../../utils/push-keys.ts";

export interface StoredPushSubscription {
  id: string;
  endpoint: string;
}

export interface SavePushSubscriptionInput extends PushSubscriptionPayload {
  userId: string;
  timeZone: string;
}

/** Alta o actualización por `endpoint`, que es único en la base de datos. */
export async function savePushSubscription({
  userId,
  endpoint,
  p256dh,
  auth,
  timeZone,
}: SavePushSubscriptionInput): Promise<StoredPushSubscription | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        timezone: timeZone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    )
    .select("id, endpoint")
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id as string, endpoint: data.endpoint as string };
}

/** Suscripción guardada del dispositivo, si existe. */
export async function loadPushSubscription(
  userId: string,
): Promise<StoredPushSubscription | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id as string, endpoint: data.endpoint as string };
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);
  return !error;
}

/** Reemplaza el plan de la suscripción mediante la RPC atómica. */
export async function replaceReminderPlanRows(
  subscriptionId: string,
  rows: unknown[],
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { error } = await supabase.rpc("replace_reminder_plan", {
    p_subscription_id: subscriptionId,
    p_rows: rows,
  });
  if (error) throw error;
}
