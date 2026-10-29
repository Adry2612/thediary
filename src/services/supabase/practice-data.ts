import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
  type PracticeGoals,
} from "../../utils/practice-goals.ts";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
  type WeeklyRoutineSchedule,
} from "../../utils/weekly-routine-schedule.ts";
import type { PersistedPracticeState } from "@/types/practice-storage";
import type { SessionRecord, PracticeTemplate, RepertoireItem, UserChord } from "../../types/practice.ts";
import { migrateRepertoireLicks } from "../../utils/licks/migration.ts";
import { normalizeLicks } from "../../utils/licks/normalize.ts";
import { normalizeSessionRecord } from "../../utils/practice-session-record.ts";
import {
  migrateLegacyEquipmentEntries,
  normalizeGuitarEntries,
  normalizeGuitars,
} from "../../utils/equipment.ts";
import type { GuitarEntry } from "../../types/equipment.ts";
import { getSupabaseClient } from "./client.ts";

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

/**
 * Historial de la guitarra. Las claves de la versión anterior se convierten en
 * entradas para que una fila de la nube escrita por un build antiguo no se
 * pierda al sincronizar.
 */
function normalizeStoredGuitarEntries(state: Record<string, unknown>): GuitarEntry[] {
  const entries = new Map<string, GuitarEntry>();
  for (const entry of migrateLegacyEquipmentEntries({
    stringChanges: state.stringChanges,
    guitarSetups: state.guitarSetups,
  })) {
    entries.set(entry.id, entry);
  }
  for (const entry of normalizeGuitarEntries(state.guitarEntries)) {
    entries.set(entry.id, entry);
  }
  return [...entries.values()];
}

export function normalizePracticeData(value: unknown): PersistedPracticeState {
  const state = isRecord(value) ? value : {};
  const migration = migrateRepertoireLicks(
    Array.isArray(state.repertoireItems)
      ? (state.repertoireItems as RepertoireItem[])
      : [],
    normalizeLicks(state.licks),
  );

  return {
    history: Array.isArray(state.history)
      ? (state.history as SessionRecord[]).map(normalizeSessionRecord)
      : [],
    templates: Array.isArray(state.templates)
      ? (state.templates as PracticeTemplate[])
      : [],
    repertoireItems: migration.repertoireItems,
    licks: migration.licks,
    customChords: Array.isArray(state.customChords)
      ? (state.customChords as UserChord[])
      : [],
    weeklySchedule: normalizeWeeklyRoutineSchedule(state.weeklySchedule),
    practiceGoals: normalizePracticeGoals(state.practiceGoals),
    guitars: normalizeGuitars(state.guitars),
    guitarEntries: normalizeStoredGuitarEntries(state),
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
    licks: mergeById(remote.licks, local.licks),
    customChords: mergeById(remote.customChords, local.customChords),
    guitars: mergeById(remote.guitars, local.guitars),
    guitarEntries: mergeById(remote.guitarEntries, local.guitarEntries),
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
    licks: [],
    customChords: [],
    weeklySchedule: { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE },
    practiceGoals: { ...DEFAULT_PRACTICE_GOALS },
    guitars: [],
    guitarEntries: [],
  };
}
