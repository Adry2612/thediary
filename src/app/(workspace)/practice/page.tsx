import { PracticeWorkspace } from "@/components/practice/PracticeWorkspace";
import type { PracticePhase } from "@/types/practice";

const phases: PracticePhase[] = [
  { id: 1, name: "Técnica", durationMinutes: 10, skill: "technique" },
  { id: 2, name: "Repertorio", durationMinutes: 20, skill: "repertoire" },
  {
    id: 3,
    name: "Vuelta a la calma",
    durationMinutes: 5,
    skill: "technique",
  },
];

const SUGGESTED_DURATIONS = [15, 30, 45, 60];

function createSuggestedPhases(totalMinutes: number): PracticePhase[] {
  const techniqueMinutes = Math.round(totalMinutes * 0.3);
  const repertoireMinutes = Math.round(totalMinutes * 0.5);

  return [
    {
      id: 1,
      name: "Técnica",
      durationMinutes: techniqueMinutes,
      skill: "technique",
    },
    {
      id: 2,
      name: "Repertorio",
      durationMinutes: repertoireMinutes,
      skill: "repertoire",
    },
    {
      id: 3,
      name: "Vuelta a la calma",
      durationMinutes: totalMinutes - techniqueMinutes - repertoireMinutes,
      skill: "technique",
    },
  ];
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{
    minutes?: string;
    template?: string;
    repeatSessionId?: string;
    start?: string;
  }>;
}) {
  const {
    minutes: requestedMinutes,
    template: requestedTemplateId,
    repeatSessionId,
    start,
  } = await searchParams;
  const requestedDuration = Number(requestedMinutes);
  const phasesForSession = SUGGESTED_DURATIONS.includes(requestedDuration)
    ? createSuggestedPhases(requestedDuration)
    : phases;

  return (
    <PracticeWorkspace
      initialPhases={phasesForSession}
      requestedTemplateId={requestedTemplateId}
      requestedSessionId={repeatSessionId}
      autoStartTemplate={start === "1"}
    />
  );
}
