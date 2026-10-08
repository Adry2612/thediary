import type { PracticeAudioRecording } from "@/lib/practice-library";

export type PracticeRecordingSort =
  | "newest"
  | "oldest"
  | "block"
  | "name"
  | "type";

const PRACTICE_RECORDING_SORTS: PracticeRecordingSort[] = [
  "newest",
  "oldest",
  "block",
  "name",
  "type",
];

export function isPracticeRecordingSort(
  value: string,
): value is PracticeRecordingSort {
  return PRACTICE_RECORDING_SORTS.some((sort) => sort === value);
}

export type PracticeRecordingFilters = {
  phaseOrder: string;
  phaseName: string;
  sort: PracticeRecordingSort;
};

export type PracticeRecordingGroup = {
  dateKey: string;
  recordings: PracticeAudioRecording[];
};

export interface PracticeRecordingSession {
  id: string;
  title?: string;
  dateKey: string;
}

export function getSessionPracticeRecordings(
  recordings: PracticeAudioRecording[],
  sessionId: string,
) {
  return recordings.filter((recording) => recording.sessionId === sessionId);
}

function getCreatedAtDateKey(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getLegacySessionKey(title: string, dateKey: string) {
  return JSON.stringify([title, dateKey]);
}

export function groupPracticeRecordingsBySession(
  recordings: PracticeAudioRecording[],
  sessions: PracticeRecordingSession[],
) {
  const recordingsBySession = new Map<string, PracticeAudioRecording[]>();
  const legacySessionIds = new Map<string, string[]>();

  for (const session of sessions) {
    recordingsBySession.set(session.id, []);
    const key = getLegacySessionKey(
      session.title ?? "Mi sesión",
      session.dateKey,
    );
    const matchingSessionIds = legacySessionIds.get(key);
    if (matchingSessionIds) {
      matchingSessionIds.push(session.id);
      continue;
    }
    legacySessionIds.set(key, [session.id]);
  }

  for (const recording of recordings) {
    if (recording.sessionId) {
      recordingsBySession.get(recording.sessionId)?.push(recording);
      continue;
    }

    const key = getLegacySessionKey(
      recording.sessionName,
      getCreatedAtDateKey(recording.createdAt),
    );
    for (const sessionId of legacySessionIds.get(key) ?? []) {
      recordingsBySession.get(sessionId)?.push(recording);
    }
  }

  return recordingsBySession;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export function getPracticeRecordingDateKey(
  recording: PracticeAudioRecording,
) {
  if (recording.practiceDate) return recording.practiceDate;

  return getCreatedAtDateKey(recording.createdAt);
}

export function getFilteredPracticeRecordings(
  recordings: PracticeAudioRecording[],
  filters: PracticeRecordingFilters,
) {
  const query = normalizeSearchText(filters.phaseName.trim());
  const matchingRecordings = recordings.filter((recording) => {
    if (
      filters.phaseOrder &&
      String(recording.phaseOrder ?? "") !== filters.phaseOrder
    ) {
      return false;
    }

    return !query || normalizeSearchText(recording.phaseName ?? "").includes(query);
  });

  return matchingRecordings.sort((left, right) => {
    const dateDifference =
      getPracticeRecordingDateKey(right).localeCompare(
        getPracticeRecordingDateKey(left),
      ) || right.createdAt.localeCompare(left.createdAt);
    if (filters.sort === "oldest") return -dateDifference;
    if (filters.sort === "block") {
      const leftOrder = left.phaseOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.phaseOrder ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || dateDifference;
    }
    if (filters.sort === "name") {
      return (
        left.title.localeCompare(right.title, "es", {
          sensitivity: "base",
        }) || dateDifference
      );
    }
    if (filters.sort === "type") {
      if (!left.practiceSkill && right.practiceSkill) return 1;
      if (left.practiceSkill && !right.practiceSkill) return -1;
      return (
        (left.practiceSkill ?? "").localeCompare(
          right.practiceSkill ?? "",
          "es",
        ) || dateDifference
      );
    }

    return dateDifference;
  });
}

export function groupPracticeRecordingsByDate(
  recordings: PracticeAudioRecording[],
  order: "newest" | "oldest",
): PracticeRecordingGroup[] {
  const groupedRecordings = new Map<string, PracticeAudioRecording[]>();

  for (const recording of recordings) {
    const dateKey = getPracticeRecordingDateKey(recording);
    groupedRecordings.set(dateKey, [
      ...(groupedRecordings.get(dateKey) ?? []),
      recording,
    ]);
  }

  return Array.from(groupedRecordings, ([dateKey, dayRecordings]) => ({
    dateKey,
    recordings: dayRecordings,
  })).sort((left, right) => {
    if (!left.dateKey) return 1;
    if (!right.dateKey) return -1;
    const comparison = left.dateKey.localeCompare(right.dateKey);
    return order === "oldest" ? comparison : -comparison;
  });
}
