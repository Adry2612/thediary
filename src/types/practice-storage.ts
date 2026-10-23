import type { GuitarLick } from "./lick";
import type {
  PracticeTemplate,
  RepertoireItem,
  SessionRecord,
  UserChord,
} from "./practice";
import type { PracticeGoals } from "../utils/practice-goals";
import type { WeeklyRoutineSchedule } from "../utils/weekly-routine-schedule";

export type PersistedPracticeState = {
  history: SessionRecord[];
  templates: PracticeTemplate[];
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
  customChords: UserChord[];
  weeklySchedule: WeeklyRoutineSchedule;
  practiceGoals: PracticeGoals;
};
