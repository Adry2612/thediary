import {
  GUITAR_ENTRY_KINDS,
  GUITAR_STRING_KINDS,
  type Guitar,
  type GuitarEntry,
  type GuitarEntryKind,
  type GuitarStringSetSnapshot,
  type GuitarStringUnit,
} from "../types/equipment.ts";
import type { SessionRecord } from "../types/practice.ts";
import { getLocalDateKey } from "./local-date.ts";
import { isGuitarStringKind } from "./guitar-strings.ts";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function normalizeIsoDate(value: unknown): string {
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

/** Fecha de calendario en formato YYYY-MM-DD, o `undefined` si no es válida. */
export function normalizeEquipmentDate(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const key = value.trim().slice(0, 10);
  if (!DATE_KEY_PATTERN.test(key)) return undefined;

  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return key;
}

export function normalizePositiveInteger(value: unknown): number | undefined {
  const numeric =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (
    typeof numeric !== "number" ||
    !Number.isInteger(numeric) ||
    numeric <= 0
  ) {
    return undefined;
  }
  return numeric;
}

function normalizeEntryKind(value: unknown): GuitarEntryKind {
  return GUITAR_ENTRY_KINDS.includes(value as GuitarEntryKind)
    ? (value as GuitarEntryKind)
    : "note";
}

function normalizeGauges(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const gauges = value
    .filter(
      (gauge): gauge is number =>
        typeof gauge === "number" && Number.isFinite(gauge) && gauge > 0,
    )
    .slice(0, 8);
  return gauges.length > 0 ? gauges : undefined;
}

function normalizeStringUnit(value: unknown): GuitarStringUnit | undefined {
  return value === "in" || value === "mm" ? value : undefined;
}

/** Solo se acepta una ruta pública; cualquier otra cosa se descarta. */
function normalizeImagePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const path = value.trim();
  if (!path.startsWith("/") || path.includes("..") || path.length > 200) {
    return undefined;
  }
  return path;
}

/** Copia del juego montado; sin marca ni modelo no hay nada que guardar. */
export function normalizeStringSet(
  value: unknown,
): GuitarStringSetSnapshot | undefined {
  if (!isRecord(value)) return undefined;

  const brand = normalizeText(value.brand);
  const model = normalizeText(value.model);
  if (!brand || !model) return undefined;

  const name = normalizeText(value.name);
  const kind = (GUITAR_STRING_KINDS as readonly string[]).includes(
    value.kind as string,
  )
    ? (value.kind as GuitarStringSetSnapshot["kind"])
    : "electric";
  const gauges = normalizeGauges(value.gauges);
  const unit = normalizeStringUnit(value.unit);
  const gaugeText = normalizeText(value.gaugeText);
  const image = normalizeImagePath(value.image);

  return {
    brand,
    model,
    ...(name ? { name } : {}),
    kind,
    ...(gauges ? { gauges, unit: unit ?? "in" } : {}),
    ...(!gauges && gaugeText ? { gaugeText } : {}),
    ...(image ? { image } : {}),
  };
}

export function normalizeGuitar(value: unknown): Guitar | null {
  if (!isRecord(value)) return null;
  const id = normalizeText(value.id);
  const name = normalizeText(value.name);
  if (!id || !name) return null;

  const intervalDays = normalizePositiveInteger(value.intervalDays);
  const intervalHours = normalizePositiveInteger(value.intervalHours);
  const photoAssetId = normalizeText(value.photoAssetId);
  const stringKind = isGuitarStringKind(value.stringKind)
    ? value.stringKind
    : undefined;

  return {
    id,
    name,
    ...(intervalDays ? { intervalDays } : {}),
    ...(intervalHours ? { intervalHours } : {}),
    ...(photoAssetId ? { photoAssetId } : {}),
    ...(stringKind ? { stringKind } : {}),
    createdAt: normalizeIsoDate(value.createdAt),
    updatedAt: normalizeIsoDate(value.updatedAt),
  };
}

export function normalizeGuitarEntry(value: unknown): GuitarEntry | null {
  if (!isRecord(value)) return null;
  const id = normalizeText(value.id);
  const guitarId = normalizeText(value.guitarId);
  const date = normalizeEquipmentDate(value.date);
  if (!id || !guitarId || !date) return null;

  const text = normalizeText(value.text);
  const stringSet = normalizeStringSet(value.stringSet);

  return {
    id,
    guitarId,
    date,
    ...(text ? { text } : {}),
    ...(stringSet ? { stringSet } : {}),
    kind: normalizeEntryKind(value.kind),
    createdAt: normalizeIsoDate(value.createdAt),
    updatedAt: normalizeIsoDate(value.updatedAt),
  };
}

export function normalizeGuitars(value: unknown): Guitar[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeGuitar)
    .filter((guitar): guitar is Guitar => guitar !== null);
}

export function normalizeGuitarEntries(value: unknown): GuitarEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeGuitarEntry)
    .filter((entry): entry is GuitarEntry => entry !== null);
}

function joinText(parts: unknown[]): string | undefined {
  const text = parts
    .map(normalizeText)
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  return text === "" ? undefined : text;
}

/**
 * Convierte los dos historiales de la primera versión del equipo —cambios de
 * cuerdas y arreglos— en entradas de un único historial. El texto conserva lo
 * que el usuario había escrito para no perder información al migrar.
 */
export function migrateLegacyEquipmentEntries(legacy: {
  stringChanges?: unknown;
  guitarSetups?: unknown;
}): GuitarEntry[] {
  const entries: GuitarEntry[] = [];

  if (Array.isArray(legacy.stringChanges)) {
    for (const value of legacy.stringChanges) {
      if (!isRecord(value)) continue;
      const id = normalizeText(value.id);
      const guitarId = normalizeText(value.guitarId);
      const date = normalizeEquipmentDate(value.date);
      if (!id || !guitarId || !date) continue;
      const text = joinText([value.brand, value.gauge, value.notes]);
      entries.push({
        id,
        guitarId,
        date,
        ...(text ? { text } : {}),
        kind: "strings",
        createdAt: normalizeIsoDate(value.createdAt),
        updatedAt: normalizeIsoDate(value.updatedAt),
      });
    }
  }

  if (Array.isArray(legacy.guitarSetups)) {
    for (const value of legacy.guitarSetups) {
      if (!isRecord(value)) continue;
      const id = normalizeText(value.id);
      const guitarId = normalizeText(value.guitarId);
      const date = normalizeEquipmentDate(value.date);
      if (!id || !guitarId || !date) continue;
      const text = joinText([
        value.description,
        value.luthier,
        value.notes,
      ]);
      entries.push({
        id,
        guitarId,
        date,
        ...(text ? { text } : {}),
        kind: "note",
        createdAt: normalizeIsoDate(value.createdAt),
        updatedAt: normalizeIsoDate(value.updatedAt),
      });
    }
  }

  return entries;
}

export function sortEntriesNewestFirst(
  entries: readonly GuitarEntry[],
): GuitarEntry[] {
  return [...entries].sort((left, right) => {
    if (left.date !== right.date) return right.date.localeCompare(left.date);
    return right.createdAt.localeCompare(left.createdAt);
  });
}

/** El cambio de cuerdas más reciente; las notas no reinician la cuenta. */
export function getLatestStringChange(
  entries: readonly GuitarEntry[],
  guitarId: string,
): GuitarEntry | null {
  return entries.reduce<GuitarEntry | null>((latest, entry) => {
    if (entry.guitarId !== guitarId || entry.kind !== "strings") return latest;
    if (!latest) return entry;
    if (entry.date > latest.date) return entry;
    if (entry.date === latest.date && entry.createdAt > latest.createdAt) {
      return entry;
    }
    return latest;
  }, null);
}

/** Quita una guitarra y su historial sin tocar las sesiones guardadas. */
export function removeGuitarFromMaintenance(
  guitarId: string,
  guitars: readonly Guitar[],
  entries: readonly GuitarEntry[],
): { guitars: Guitar[]; entries: GuitarEntry[] } {
  return {
    guitars: guitars.filter((guitar) => guitar.id !== guitarId),
    entries: entries.filter((entry) => entry.guitarId !== guitarId),
  };
}

/** Segundos de las prácticas que eligieron esta guitarra desde una fecha. */
export function getGuitarUsageSeconds(
  history: readonly SessionRecord[],
  guitarId: string,
  sinceDate?: string,
): number {
  return history.reduce((total, session) => {
    if (session.guitarId !== guitarId) return total;
    const dateKey = getLocalDateKey(new Date(session.startedAt));
    if (sinceDate && dateKey < sinceDate) return total;
    return total + session.durationSeconds;
  }, 0);
}

export interface GuitarAttribution {
  /** Prácticas desde la fecha que registraron esta guitarra. */
  recordedSessions: number;
  /** Prácticas desde la fecha que no registraron ninguna guitarra. */
  missingSessions: number;
  usageSeconds: number;
}

/**
 * Cuánto se ha usado la guitarra y cuántas prácticas quedaron sin atribuir. El
 * segundo dato evita presentar un total incompleto como si fuera exacto.
 */
export function getGuitarAttribution(
  history: readonly SessionRecord[],
  guitarId: string,
  sinceDate?: string,
): GuitarAttribution {
  let recordedSessions = 0;
  let missingSessions = 0;
  let usageSeconds = 0;

  for (const session of history) {
    const dateKey = getLocalDateKey(new Date(session.startedAt));
    if (sinceDate && dateKey < sinceDate) continue;
    if (session.guitarId === guitarId) {
      recordedSessions += 1;
      usageSeconds += session.durationSeconds;
    } else if (!session.guitarId) {
      missingSessions += 1;
    }
  }

  return { recordedSessions, missingSessions, usageSeconds };
}

function daysBetween(fromDateKey: string, today: Date): number {
  const from = new Date(`${fromDateKey}T00:00:00`);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.max(
    0,
    Math.round((todayStart.getTime() - from.getTime()) / 86_400_000),
  );
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export type GuitarMaintenanceState =
  | "no-interval"
  | "no-history"
  | "ok"
  | "soon"
  | "due";

export type GuitarDueLimit = "days" | "hours" | "both" | null;

export interface GuitarMaintenance {
  state: GuitarMaintenanceState;
  latestChange: GuitarEntry | null;
  daysSinceChange: number | null;
  usageSeconds: number;
  hoursSinceChange: number;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  /** Progreso del intervalo más avanzado, de 0 a 1. */
  progress: number;
  /** Próxima fecha si el intervalo es en días. */
  nextChangeDate: string | null;
  /** Límite que está más cerca o que ya se ha alcanzado. */
  limit: GuitarDueLimit;
  recordedSessions: number;
  missingSessions: number;
}

/**
 * Estado del cambio de cuerdas. Vence cuando se cumple cualquiera de los
 * intervalos; sin historial no se inventa una fecha ni un vencimiento.
 */
export function getGuitarMaintenance(
  guitar: Guitar,
  entries: readonly GuitarEntry[],
  history: readonly SessionRecord[],
  today = new Date(),
): GuitarMaintenance {
  const latestChange = getLatestStringChange(entries, guitar.id);
  const hasInterval = Boolean(guitar.intervalDays || guitar.intervalHours);
  const attribution = getGuitarAttribution(
    history,
    guitar.id,
    latestChange?.date,
  );
  const hoursSinceChange = roundOneDecimal(attribution.usageSeconds / 3600);
  const base = {
    latestChange,
    usageSeconds: attribution.usageSeconds,
    hoursSinceChange,
    recordedSessions: attribution.recordedSessions,
    missingSessions: attribution.missingSessions,
  };

  if (!hasInterval) {
    return {
      ...base,
      state: "no-interval",
      daysSinceChange: latestChange
        ? daysBetween(latestChange.date, today)
        : null,
      daysRemaining: null,
      hoursRemaining: null,
      progress: 0,
      nextChangeDate: null,
      limit: null,
    };
  }

  if (!latestChange) {
    return {
      ...base,
      state: "no-history",
      daysSinceChange: null,
      daysRemaining: null,
      hoursRemaining: null,
      progress: 0,
      nextChangeDate: null,
      limit: null,
    };
  }

  const daysSinceChange = daysBetween(latestChange.date, today);
  const daysRemaining =
    guitar.intervalDays !== undefined
      ? guitar.intervalDays - daysSinceChange
      : null;
  const hoursRemaining =
    guitar.intervalHours !== undefined
      ? roundOneDecimal(guitar.intervalHours - hoursSinceChange)
      : null;
  const dueByDays = daysRemaining !== null && daysRemaining <= 0;
  const dueByHours = hoursRemaining !== null && hoursRemaining <= 0;
  const due = dueByDays || dueByHours;
  const soonByDays = daysRemaining !== null && daysRemaining <= 7;
  const soonByHours = hoursRemaining !== null && hoursRemaining <= 2;
  const progress = Math.min(
    1,
    Math.max(
      guitar.intervalDays !== undefined
        ? daysSinceChange / guitar.intervalDays
        : 0,
      guitar.intervalHours !== undefined
        ? hoursSinceChange / guitar.intervalHours
        : 0,
    ),
  );
  const limit: GuitarDueLimit =
    dueByDays && dueByHours ? "both"
    : dueByDays ? "days"
    : dueByHours ? "hours"
    : soonByDays ? "days"
    : soonByHours ? "hours"
    : null;

  return {
    ...base,
    state: due ? "due" : soonByDays || soonByHours ? "soon" : "ok",
    daysSinceChange,
    daysRemaining,
    hoursRemaining,
    progress,
    nextChangeDate:
      guitar.intervalDays !== undefined
        ? addDaysToDateKey(latestChange.date, guitar.intervalDays)
        : null,
    limit,
  };
}

const MAINTENANCE_PRIORITY: Record<GuitarMaintenanceState, number> = {
  due: 0,
  soon: 1,
  ok: 2,
  "no-history": 3,
  "no-interval": 4,
};

function remainingScore(maintenance: GuitarMaintenance): number {
  if (maintenance.daysRemaining !== null) return maintenance.daysRemaining;
  if (maintenance.hoursRemaining !== null) {
    return maintenance.hoursRemaining / 24;
  }
  return Number.POSITIVE_INFINITY;
}

/** Guitarras ordenadas por urgencia del próximo cambio de cuerdas. */
export function sortGuitarsByMaintenance(
  guitars: readonly Guitar[],
  entries: readonly GuitarEntry[],
  history: readonly SessionRecord[],
  today = new Date(),
): Array<{ guitar: Guitar; maintenance: GuitarMaintenance }> {
  return guitars
    .map((guitar) => ({
      guitar,
      maintenance: getGuitarMaintenance(guitar, entries, history, today),
    }))
    .sort((left, right) => {
      const priority =
        MAINTENANCE_PRIORITY[left.maintenance.state] -
        MAINTENANCE_PRIORITY[right.maintenance.state];
      if (priority !== 0) return priority;
      return remainingScore(left.maintenance) - remainingScore(right.maintenance);
    });
}

interface ResolvePracticeGuitarInput {
  /** Guitarra elegida explícitamente: plantilla, repetición o formulario. */
  explicitId?: string;
  /** Última guitarra usada en este dispositivo. */
  lastGuitarId?: string;
  guitars: readonly Guitar[];
}

/**
 * Guitarra de una práctica nueva: la explícita, la última usada o la única del
 * equipo. Devuelve `undefined` cuando el usuario tiene varias y ninguna sirve,
 * para no atribuir la sesión al instrumento equivocado.
 */
export function resolvePracticeGuitarId({
  explicitId,
  lastGuitarId,
  guitars,
}: ResolvePracticeGuitarInput): string | undefined {
  if (explicitId && guitars.some((guitar) => guitar.id === explicitId)) {
    return explicitId;
  }
  if (lastGuitarId && guitars.some((guitar) => guitar.id === lastGuitarId)) {
    return lastGuitarId;
  }
  if (guitars.length === 1) return guitars[0].id;
  return undefined;
}
