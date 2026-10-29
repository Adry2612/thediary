import {
  PRACTICE_SKILLS,
  type DailyStats,
  type PracticeSkill,
  type RepertoireItem,
  type SessionPhaseRecord,
  type SessionRecord,
  type SkillDistribution,
} from "../types/practice.ts";

export type PracticeChartPeriod = "week" | "month" | "year";
export type PracticeTimeRange = {
  startDate: string;
  endDate: string;
};

export type PracticeTimeBucket = {
  label: string;
  startDate: string;
  endDate: string;
  totalSeconds: number;
  /** Sesiones cuyo inicio cae dentro del rango del bucket. */
  sessionCount: number;
};

export type PracticeStatistics = {
  sessionCount: number;
  totalSeconds: number;
  mostPracticedSkill: PracticeSkill | null;
  mostPracticedSeconds: number;
};

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeek(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function getSessionDateKey(session: SessionRecord) {
  return toDateKey(new Date(session.startedAt));
}

function emptySkillValues(): Record<PracticeSkill, number> {
  return { technique: 0, theory: 0, repertoire: 0, lick: 0, improvisation: 0 };
}

export function getStreakCount(
  history: SessionRecord[],
  today = new Date(),
): number {
  const practicedDates = new Set(history.map(getSessionDateKey));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!practicedDates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (practicedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Días seguidos a partir de los que la racha se reconoce en el panel. */
export const STREAK_FIRE_MIN_DAYS = 7;

export function isStreakOnFire(streak: number): boolean {
  return streak >= STREAK_FIRE_MIN_DAYS;
}

export function getMonthlyHeatmapData(
  year: number,
  month: number,
  history: SessionRecord[],
): DailyStats[] {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("El mes debe ser un entero entre 1 y 12.");
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => ({
    dateKey: toDateKey(new Date(year, month - 1, index + 1)),
    sessionCount: 0,
    totalMinutes: 0,
    averageBpm: 0,
    skillMinutes: emptySkillValues(),
    bpmTotal: 0,
    bpmSessionCount: 0,
  }));
  const statsByDate = new Map(days.map((day) => [day.dateKey, day]));

  for (const session of history) {
    const dailyStats = statsByDate.get(getSessionDateKey(session));
    if (!dailyStats) continue;

    dailyStats.sessionCount += 1;
    dailyStats.totalMinutes += session.durationSeconds / 60;
    if (session.averageBpm > 0) {
      dailyStats.bpmTotal += session.averageBpm;
      dailyStats.bpmSessionCount += 1;
    }
    for (const skill of PRACTICE_SKILLS) {
      dailyStats.skillMinutes[skill] += session.skillSeconds[skill] / 60;
    }
  }

  return days.map(({ bpmTotal, bpmSessionCount, ...day }) => ({
    ...day,
    averageBpm: bpmSessionCount
      ? Math.round(bpmTotal / bpmSessionCount)
      : 0,
  }));
}

export function getSkillDistribution(
  history: SessionRecord[],
  timeRange: PracticeTimeRange,
): SkillDistribution {
  const skillSeconds = emptySkillValues();
  const skillSessionCounts = emptySkillValues();

  for (const session of history) {
    const sessionDate = getSessionDateKey(session);
    if (sessionDate < timeRange.startDate || sessionDate > timeRange.endDate) {
      continue;
    }

    for (const skill of PRACTICE_SKILLS) {
      const seconds = session.skillSeconds[skill];
      skillSeconds[skill] += seconds;
      if (seconds > 0) skillSessionCounts[skill] += 1;
    }
  }

  const totalSeconds = Object.values(skillSeconds).reduce(
    (total, seconds) => total + seconds,
    0,
  );
  const percentages = PRACTICE_SKILLS.map((skill) => {
    const exactPercentage = totalSeconds
      ? (skillSeconds[skill] / totalSeconds) * 100
      : 0;
    return {
      skill,
      percentage: Math.floor(exactPercentage),
      remainder: exactPercentage % 1,
    };
  });
  const remainder =
    (totalSeconds ? 100 : 0) -
    percentages.reduce((total, item) => total + item.percentage, 0);

  percentages
    .slice()
    .sort((left, right) => right.remainder - left.remainder)
    .slice(0, remainder)
    .forEach(({ skill }) => {
      const item = percentages.find((candidate) => candidate.skill === skill);
      if (item) item.percentage += 1;
    });

  const categories = PRACTICE_SKILLS.reduce<SkillDistribution["categories"]>(
    (result, skill) => {
      result[skill] = {
        minutes: skillSeconds[skill] / 60,
        percentage:
          percentages.find((item) => item.skill === skill)?.percentage ?? 0,
        sessionCount: skillSessionCounts[skill],
      };
      return result;
    },
    {
      technique: { minutes: 0, percentage: 0, sessionCount: 0 },
      theory: { minutes: 0, percentage: 0, sessionCount: 0 },
      repertoire: { minutes: 0, percentage: 0, sessionCount: 0 },
      lick: { minutes: 0, percentage: 0, sessionCount: 0 },
      improvisation: { minutes: 0, percentage: 0, sessionCount: 0 },
    },
  );

  return { totalMinutes: totalSeconds / 60, categories };
}

function getDailyPracticeSeconds(history: SessionRecord[]) {
  const dailySeconds = new Map<string, number>();
  for (const session of history) {
    const dateKey = toDateKey(new Date(session.startedAt));
    dailySeconds.set(
      dateKey,
      (dailySeconds.get(dateKey) ?? 0) + session.durationSeconds,
    );
  }

  return dailySeconds;
}

export type PracticeChartRange = {
  label: string;
  startDate: string;
  endDate: string;
};

function createRange(
  label: string,
  startDate: Date,
  endDate: Date,
): PracticeChartRange {
  return {
    label,
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
  };
}

function getWeekRanges(today: Date): PracticeChartRange[] {
  const monday = startOfWeek(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const label = new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
    }).format(date);
    return createRange(`${label} ${date.getDate()}`, date, date);
  });
}

function getMonthRanges(today: Date): PracticeChartRange[] {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstWeek = startOfWeek(monthStart);
  const ranges: PracticeChartRange[] = [];

  for (
    let weekStart = firstWeek;
    weekStart <= monthEnd;
    weekStart = addDays(weekStart, 7)
  ) {
    const weekEnd = addDays(weekStart, 6);
    const rangeStart = weekStart < monthStart ? monthStart : weekStart;
    const rangeEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
    ranges.push(
      createRange(
        `${rangeStart.getDate()}–${rangeEnd.getDate()}`,
        rangeStart,
        rangeEnd,
      ),
    );
  }

  return ranges;
}

function getYearRanges(today: Date): PracticeChartRange[] {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthStart = new Date(today.getFullYear(), monthIndex, 1);
    const monthEnd = new Date(today.getFullYear(), monthIndex + 1, 0);
    const label = new Intl.DateTimeFormat("es-ES", {
      month: "short",
    })
      .format(monthStart)
      .replace(/\.$/, "");

    return createRange(label, monthStart, monthEnd);
  });
}

/** Rangos de los intervalos que comparten los gráficos del panel. */
export function getPracticeChartRanges(
  period: PracticeChartPeriod,
  today = new Date(),
): PracticeChartRange[] {
  if (period === "week") return getWeekRanges(today);
  if (period === "month") return getMonthRanges(today);
  return getYearRanges(today);
}

function createBucket(
  range: PracticeChartRange,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket {
  let totalSeconds = 0;
  for (
    let cursor = new Date(`${range.startDate}T00:00:00`);
    toDateKey(cursor) <= range.endDate;
    cursor = addDays(cursor, 1)
  ) {
    totalSeconds += dailySeconds.get(toDateKey(cursor)) ?? 0;
  }

  return {
    ...range,
    totalSeconds,
    sessionCount: 0,
  };
}

/** Cuenta las sesiones que empiezan dentro del rango inclusivo del bucket. */
function countSessionsInRange(
  history: SessionRecord[],
  startDate: string,
  endDate: string,
): number {
  return history.filter((session) => {
    const sessionDate = getSessionDateKey(session);
    return sessionDate >= startDate && sessionDate <= endDate;
  }).length;
}

function addSessionCounts(
  buckets: PracticeTimeBucket[],
  history: SessionRecord[],
): PracticeTimeBucket[] {
  return buckets.map((bucket) => ({
    ...bucket,
    sessionCount: countSessionsInRange(
      history,
      bucket.startDate,
      bucket.endDate,
    ),
  }));
}

function rangesToBuckets(
  ranges: PracticeChartRange[],
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  return ranges.map((range) => createBucket(range, dailySeconds));
}

function getWeekBuckets(
  today: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  return rangesToBuckets(getWeekRanges(today), dailySeconds);
}

function getMonthBuckets(
  today: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  return rangesToBuckets(getMonthRanges(today), dailySeconds);
}

function getYearBuckets(
  today: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  return rangesToBuckets(getYearRanges(today), dailySeconds);
}

function buildPracticeTimeBuckets(
  period: PracticeChartPeriod,
  today: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  return rangesToBuckets(getPracticeChartRanges(period, today), dailySeconds);
}

function getPreviousPeriodBuckets(
  period: PracticeChartPeriod,
  today: Date,
  history: SessionRecord[],
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  if (period === "week") {
    return addSessionCounts(
      getWeekBuckets(addDays(today, -7), dailySeconds),
      history,
    );
  }
  if (period === "month") {
    return addSessionCounts(
      getMonthBuckets(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        dailySeconds,
      ),
      history,
    );
  }
  return addSessionCounts(
    getYearBuckets(new Date(today.getFullYear() - 1, 0, 1), dailySeconds),
    history,
  );
}

export function getPracticeTimeBuckets(
  history: SessionRecord[],
  period: PracticeChartPeriod,
  today = new Date(),
): PracticeTimeBucket[] {
  return addSessionCounts(
    buildPracticeTimeBuckets(
      period,
      today,
      getDailyPracticeSeconds(history),
    ),
    history,
  );
}

export type PracticeTimeSummary = {
  totalSeconds: number;
  sessionCount: number;
  averageSessionSeconds: number;
  bestBucket: { label: string; totalSeconds: number } | null;
  previousTotalSeconds: number;
  /** Variación relativa frente al periodo anterior; null si no hubo práctica. */
  changeRatio: number | null;
};

/**
 * Resumen del periodo que muestra el gráfico de ritmo: total, sesiones, media
 * por sesión, mejor unidad y comparación con el periodo calendario anterior.
 * Reutiliza los mismos buckets que el gráfico para no discrepar en los límites.
 */
export function getPracticeTimeSummary(
  history: SessionRecord[],
  period: PracticeChartPeriod,
  today = new Date(),
): PracticeTimeSummary {
  const dailySeconds = getDailyPracticeSeconds(history);
  const buckets = addSessionCounts(
    buildPracticeTimeBuckets(period, today, dailySeconds),
    history,
  );
  const previousBuckets = getPreviousPeriodBuckets(
    period,
    today,
    history,
    dailySeconds,
  );
  const totalSeconds = buckets.reduce(
    (total, bucket) => total + bucket.totalSeconds,
    0,
  );
  const sessionCount = buckets.reduce(
    (total, bucket) => total + bucket.sessionCount,
    0,
  );
  const bestBucket = buckets.reduce<PracticeTimeBucket | null>(
    (best, bucket) =>
      bucket.totalSeconds > (best?.totalSeconds ?? 0) ? bucket : best,
    null,
  );
  const previousTotalSeconds = previousBuckets.reduce(
    (total, bucket) => total + bucket.totalSeconds,
    0,
  );

  return {
    totalSeconds,
    sessionCount,
    averageSessionSeconds:
      sessionCount > 0 ? totalSeconds / sessionCount : 0,
    bestBucket: bestBucket
      ? { label: bestBucket.label, totalSeconds: bestBucket.totalSeconds }
      : null,
    previousTotalSeconds,
    changeRatio:
      previousTotalSeconds > 0
        ? (totalSeconds - previousTotalSeconds) / previousTotalSeconds
        : null,
  };
}

export function getPracticeStatistics(
  history: SessionRecord[],
): PracticeStatistics {
  const skillSeconds = Object.fromEntries(
    PRACTICE_SKILLS.map((skill) => [
      skill,
      history.reduce(
        (total, session) => total + session.skillSeconds[skill],
        0,
      ),
    ]),
  ) as Record<PracticeSkill, number>;

  let mostPracticedSkill: PracticeSkill | null = null;
  let mostPracticedSeconds = 0;
  for (const skill of PRACTICE_SKILLS) {
    if (skillSeconds[skill] <= mostPracticedSeconds) continue;
    mostPracticedSkill = skill;
    mostPracticedSeconds = skillSeconds[skill];
  }

  return {
    sessionCount: history.length,
    totalSeconds: history.reduce(
      (total, session) => total + session.durationSeconds,
      0,
    ),
    mostPracticedSkill,
    mostPracticedSeconds,
  };
}

/** Clave de un contenido comparable: sin mayúsculas, acentos ni espacios extra. */
export function normalizePracticeContentName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export type GuitarBalance = {
  electricSeconds: number;
  acousticSeconds: number;
  unclassifiedSeconds: number;
};

/**
 * Tiempo del periodo por tipo de guitarra. Las sesiones sin tipo registrado se
 * informan aparte y no se reparten entre los dos tipos.
 */
export function getGuitarBalance(
  history: SessionRecord[],
  timeRange: PracticeTimeRange,
): GuitarBalance {
  const balance: GuitarBalance = {
    electricSeconds: 0,
    acousticSeconds: 0,
    unclassifiedSeconds: 0,
  };

  for (const session of history) {
    const sessionDate = getSessionDateKey(session);
    if (sessionDate < timeRange.startDate || sessionDate > timeRange.endDate) {
      continue;
    }

    if (session.guitarType === "electric") {
      balance.electricSeconds += session.durationSeconds;
    } else if (session.guitarType === "acoustic") {
      balance.acousticSeconds += session.durationSeconds;
    } else {
      balance.unclassifiedSeconds += session.durationSeconds;
    }
  }

  return balance;
}

/** Porcentaje entero del tiempo clasificado que corresponde a cada guitarra. */
export function getGuitarBalanceShares(balance: GuitarBalance): {
  electric: number;
  acoustic: number;
} {
  const classifiedSeconds =
    balance.electricSeconds + balance.acousticSeconds;
  if (classifiedSeconds <= 0) return { electric: 0, acoustic: 0 };

  const electric = Math.round(
    (balance.electricSeconds / classifiedSeconds) * 100,
  );
  return { electric, acoustic: 100 - electric };
}

export type PracticeContentRank = {
  key: string;
  label: string;
  seconds: number;
  sessionCount: number;
};

export type PracticeContentRankings = {
  songs: PracticeContentRank[];
  techniques: PracticeContentRank[];
  theory: PracticeContentRank[];
};

const CONTENT_RANK_LIMIT = 3;

type RankAccumulator = {
  key: string;
  label: string;
  seconds: number;
  sessionIds: Set<string>;
};

function addLessonTime(
  ranking: Map<string, RankAccumulator>,
  key: string,
  label: string,
  seconds: number,
  sessionId: string,
) {
  const current = ranking.get(key) ?? {
    key,
    label,
    seconds: 0,
    sessionIds: new Set<string>(),
  };
  current.seconds += seconds;
  current.sessionIds.add(sessionId);
  ranking.set(key, current);
}

function toContentRanks(
  ranking: Map<string, RankAccumulator>,
): PracticeContentRank[] {
  return [...ranking.values()]
    .map(({ key, label, seconds, sessionIds }) => ({
      key,
      label,
      seconds,
      sessionCount: sessionIds.size,
    }))
    .sort(
      (left, right) =>
        right.seconds - left.seconds ||
        right.sessionCount - left.sessionCount ||
        left.label.localeCompare(right.label, "es"),
    )
    .slice(0, CONTENT_RANK_LIMIT);
}

/**
 * Rankings de todo el historial: canción, técnica y tema de teoría. Técnica y
 * teoría se agrupan por el nombre del bloque; las canciones, por su elemento
 * del repertorio, usando el título actual si todavía existe.
 */
export function getPracticeContentRankings(
  history: SessionRecord[],
  repertoireItems: RepertoireItem[] = [],
): PracticeContentRankings {
  const itemsById = new Map(repertoireItems.map((item) => [item.id, item]));
  const songs = new Map<string, RankAccumulator>();
  const techniques = new Map<string, RankAccumulator>();
  const theory = new Map<string, RankAccumulator>();

  for (const session of history) {
    for (const phase of session.phases ?? []) {
      if (phase.elapsedSeconds <= 0) continue;

      if (phase.repertoireItemId) {
        const item = itemsById.get(phase.repertoireItemId);
        addLessonTime(
          songs,
          `song:${phase.repertoireItemId}`,
          item?.title ?? phase.name,
          phase.elapsedSeconds,
          session.id,
        );
        continue;
      }

      const name = phase.name.trim();
      if (!name) continue;
      const key = `${phase.skill}:${normalizePracticeContentName(name)}`;
      if (phase.skill === "technique") {
        addLessonTime(techniques, key, name, phase.elapsedSeconds, session.id);
      } else if (phase.skill === "theory") {
        addLessonTime(theory, key, name, phase.elapsedSeconds, session.id);
      }
    }
  }

  return {
    songs: toContentRanks(songs),
    techniques: toContentRanks(techniques),
    theory: toContentRanks(theory),
  };
}

export type PracticeTempoPeriod = "week" | "month";

const TEMPO_WINDOW_DAYS: Record<PracticeTempoPeriod, number> = {
  week: 7,
  month: 30,
};

/** Mínimo practicado por contenido en cada ventana para poder compararlo. */
const TEMPO_MIN_CONTENT_SECONDS = 5 * 60;

export type TempoContentChange = {
  key: string;
  label: string;
  beforeBpm: number;
  nowBpm: number;
  deltaBpm: number;
  weightSeconds: number;
};

export type TempoTrend = {
  deltaBpm: number;
  deltaPercent: number;
  comparedCount: number;
  isSmallSample: boolean;
  hasMetronomeData: boolean;
  movers: TempoContentChange[];
};

type TempoEntry = {
  key: string;
  label: string;
  bpm: number;
  seconds: number;
  startedAtMs: number;
  sessionId: string;
};

type TempoContentWindow = {
  label: string;
  seconds: number;
  entries: TempoEntry[];
};

export type TempoContentIdentity = { key: string; label: string };

/** Contenido al que pertenece un bloque, para comparar tempo como con como. */
export function getTempoContentIdentity(
  phase: SessionPhaseRecord,
  repertoireItems: RepertoireItem[] = [],
): TempoContentIdentity | null {
  if (phase.repertoireItemId) {
    const item = repertoireItems.find(
      (candidate) => candidate.id === phase.repertoireItemId,
    );
    const part = phase.repertoirePartId
      ? item?.parts.find(
          (candidate) => candidate.id === phase.repertoirePartId,
        )
      : undefined;
    return {
      key: phase.repertoirePartId
        ? `song:${phase.repertoireItemId}:part:${phase.repertoirePartId}`
        : `song:${phase.repertoireItemId}`,
      label: part && item ? `${item.title} · ${part.name}` : (item?.title ?? phase.name),
    };
  }

  if (phase.lickId) {
    return { key: `lick:${phase.lickId}`, label: phase.name };
  }

  const name = phase.name.trim();
  if (!name) return null;
  return { key: `${phase.skill}:${normalizePracticeContentName(name)}`, label: name };
}

function getLocalDayStart(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function collectTempoEntries(
  session: SessionRecord,
  repertoireItems: RepertoireItem[],
): TempoEntry[] {
  const startedAtMs = Date.parse(session.startedAt);
  if (!Number.isFinite(startedAtMs)) return [];

  const phases = session.phases ?? [];
  const entries: TempoEntry[] = [];
  for (const phase of phases) {
    if (phase.elapsedSeconds <= 0) continue;
    const bpm = phase.averageBpm ?? 0;
    if (bpm <= 0) continue;
    const identity = getTempoContentIdentity(phase, repertoireItems);
    if (!identity) continue;
    entries.push({
      ...identity,
      bpm,
      seconds: phase.elapsedSeconds,
      startedAtMs,
      sessionId: session.id,
    });
  }

  if (entries.length === 0 && phases.length === 1 && session.averageBpm > 0) {
    const phase = phases[0];
    if (phase.elapsedSeconds > 0) {
      const identity = getTempoContentIdentity(phase, repertoireItems);
      if (identity) {
        entries.push({
          ...identity,
          bpm: session.averageBpm,
          seconds: phase.elapsedSeconds,
          startedAtMs,
          sessionId: session.id,
        });
      }
    }
  }

  return entries;
}

function addTempoEntries(
  contents: Map<string, TempoContentWindow>,
  entries: TempoEntry[],
) {
  for (const entry of entries) {
    const current = contents.get(entry.key) ?? {
      label: entry.label,
      seconds: 0,
      entries: [],
    };
    current.label = entry.label;
    current.seconds += entry.seconds;
    current.entries.push(entry);
    contents.set(entry.key, current);
  }
}

/** Nivel reciente: media de las hasta tres sesiones más recientes de la ventana. */
function getRecentTempoLevel(entries: TempoEntry[]): number | null {
  const bySession = new Map<
    string,
    { startedAtMs: number; weightedBpm: number; seconds: number }
  >();

  for (const entry of entries) {
    const current = bySession.get(entry.sessionId) ?? {
      startedAtMs: entry.startedAtMs,
      weightedBpm: 0,
      seconds: 0,
    };
    current.weightedBpm += entry.bpm * entry.seconds;
    current.seconds += entry.seconds;
    bySession.set(entry.sessionId, current);
  }

  const recentSessions = [...bySession.values()]
    .sort((left, right) => right.startedAtMs - left.startedAtMs)
    .slice(0, 3);
  const totalSeconds = recentSessions.reduce(
    (total, session) => total + session.seconds,
    0,
  );
  if (totalSeconds <= 0) return null;

  return Math.round(
    recentSessions.reduce(
      (total, session) => total + session.weightedBpm,
      0,
    ) / totalSeconds,
  );
}

/**
 * Progreso de tempo entre dos ventanas móviles consecutivas. Compara el nivel
 * reciente de cada contenido practicado en ambas, pondera por el tiempo actual
 * y resume el cambio con el número de contenidos comparados.
 */
export function getTempoTrend(
  history: SessionRecord[],
  period: PracticeTempoPeriod = "week",
  today = new Date(),
  repertoireItems: RepertoireItem[] = [],
): TempoTrend {
  const days = TEMPO_WINDOW_DAYS[period];
  const todayStart = getLocalDayStart(today);
  const currentStart = addDays(todayStart, -(days - 1));
  const previousStart = addDays(todayStart, -(days * 2 - 1));
  const previousEnd = addDays(currentStart, -1);

  const currentContents = new Map<string, TempoContentWindow>();
  const previousContents = new Map<string, TempoContentWindow>();

  for (const session of history) {
    const startedAtMs = Date.parse(session.startedAt);
    if (!Number.isFinite(startedAtMs)) continue;
    const sessionDay = getLocalDayStart(new Date(startedAtMs));
    const entries = collectTempoEntries(session, repertoireItems);
    if (entries.length === 0) continue;

    if (sessionDay >= currentStart && sessionDay <= todayStart) {
      addTempoEntries(currentContents, entries);
    } else if (sessionDay >= previousStart && sessionDay <= previousEnd) {
      addTempoEntries(previousContents, entries);
    }
  }

  const changes: TempoContentChange[] = [];
  let weightSum = 0;
  let currentWeightedBpm = 0;
  let previousWeightedBpm = 0;

  for (const [key, current] of currentContents) {
    const previous = previousContents.get(key);
    if (!previous) continue;
    if (
      current.seconds < TEMPO_MIN_CONTENT_SECONDS ||
      previous.seconds < TEMPO_MIN_CONTENT_SECONDS
    ) {
      continue;
    }

    const nowBpm = getRecentTempoLevel(current.entries);
    const beforeBpm = getRecentTempoLevel(previous.entries);
    if (nowBpm === null || beforeBpm === null) continue;

    changes.push({
      key,
      label: current.label,
      beforeBpm,
      nowBpm,
      deltaBpm: nowBpm - beforeBpm,
      weightSeconds: current.seconds,
    });
    weightSum += current.seconds;
    currentWeightedBpm += nowBpm * current.seconds;
    previousWeightedBpm += beforeBpm * current.seconds;
  }

  const gains = changes
    .filter((change) => change.deltaBpm > 0)
    .sort((left, right) => right.deltaBpm - left.deltaBpm)
    .slice(0, 2);
  const drops = changes
    .filter((change) => change.deltaBpm < 0)
    .sort((left, right) => left.deltaBpm - right.deltaBpm)
    .slice(0, 2);

  return {
    deltaBpm: weightSum
      ? Math.round((currentWeightedBpm - previousWeightedBpm) / weightSum)
      : 0,
    deltaPercent:
      previousWeightedBpm > 0
        ? Math.round(
            ((currentWeightedBpm - previousWeightedBpm) /
              previousWeightedBpm) *
              100,
          )
        : 0,
    comparedCount: changes.length,
    isSmallSample: changes.length > 0 && changes.length <= 2,
    hasMetronomeData:
      currentContents.size > 0 || previousContents.size > 0,
    movers: [...gains, ...drops],
  };
}
