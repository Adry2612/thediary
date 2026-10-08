import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
  type PracticeGoals,
} from "@/lib/practice-goals";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
  type WeeklyRoutineSchedule,
} from "@/lib/weekly-routine-schedule";
import type { PersistedPracticeState } from "@/stores/practiceStorage";
import type { SessionRecord, PracticeTemplate, RepertoireItem } from "@/types/practice";
import { getSupabaseClient } from "./client";

interface PracticeDataRow {
  state: PersistedPracticeState;
}

interface HasId {
  id: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeById<T extends HasId>(remote: T[], local: T[]): T[] {
  const merged = new Map(remote.map((item) => [item.id, item]));
  for (const item of local) merged.set(item.id, item);
  return [...merged.values()];
}

function hasAssignedRoutine(schedule: WeeklyRoutineSchedule): boolean {
  return Object.values(schedule).some((routineId) => routineId !== null);
}

function hasNonDefaultGoals(goals: PracticeGoals): boolean {
  return (
    goals.dailyMinutes !== DEFAULT_PRACTICE_GOALS.dailyMinutes ||
    goals.weeklyDays !== DEFAULT_PRACTICE_GOALS.weeklyDays
  );
}

export function normalizePracticeData(value: unknown): PersistedPracticeState {
  const state = isRecord(value) ? value : {};
  return {
    history: Array.isArray(state.history)
      ? (state.history as SessionRecord[])
      : [],
    templates: Array.isArray(state.templates)
      ? (state.templates as PracticeTemplate[])
      : [],
    repertoireItems: Array.isArray(state.repertoireItems)
      ? (state.repertoireItems as RepertoireItem[])
      : [],
    weeklySchedule: normalizeWeeklyRoutineSchedule(state.weeklySchedule),
    practiceGoals: normalizePracticeGoals(state.practiceGoals),
  };
}

export function mergePracticeData(
  remoteValue: PersistedPracticeState,
  localValue: PersistedPracticeState,
): PersistedPracticeState {
  const remote = normalizePracticeData(remoteValue);
  const local = normalizePracticeData(localValue);

  return {
    history: mergeById(remote.history, local.history).sort(
      (left, right) =>
        Date.parse(left.startedAt) - Date.parse(right.startedAt),
    ),
    templates: mergeById(remote.templates, local.templates),
    repertoireItems: mergeById(remote.repertoireItems, local.repertoireItems),
    weeklySchedule: hasAssignedRoutine(local.weeklySchedule)
      ? local.weeklySchedule
      : remote.weeklySchedule,
    practiceGoals: hasNonDefaultGoals(local.practiceGoals)
      ? local.practiceGoals
      : remote.practiceGoals,
  };
}

export async function loadCloudPracticeData(
  userId: string,
): Promise<PersistedPracticeState | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const { data, error } = await client
    .from("practice_data")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`No se pudieron cargar tus datos: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as PracticeDataRow;
  return normalizePracticeData(row.state);
}

export async function saveCloudPracticeData(
  userId: string,
  state: PersistedPracticeState,
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const { error } = await client.from("practice_data").upsert(
    {
      user_id: userId,
      state: normalizePracticeData(state),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`No se pudieron guardar tus datos: ${error.message}`);
}

export async function deleteCloudPracticeData(userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const { error } = await client
    .from("practice_data")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(`No se pudieron borrar tus datos: ${error.message}`);
}

export function createEmptyPracticeData(): PersistedPracticeState {
  return {
    history: [],
    templates: [],
    repertoireItems: [],
    weeklySchedule: { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE },
    practiceGoals: { ...DEFAULT_PRACTICE_GOALS },
  };
}
