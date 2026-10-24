import { PracticeWorkspace } from "@/components/practice/PracticeWorkspace";
import type { PracticePhase } from "@/types/practice";
import { getDictionary } from "@/i18n/translations";

const practiceText = getDictionary().practicePage;
const techniqueName = getDictionary().licks.techniqueAlternatePicking;

const phases: PracticePhase[] = [
  { id: 1, name: techniqueName, durationMinutes: 10, skill: "technique" },
  { id: 2, name: practiceText.repertoire, durationMinutes: 20, skill: "repertoire" },
  {
    id: 3,
    name: practiceText.cooldown,
    durationMinutes: 5,
    skill: "technique",
  },
];

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{
    template?: string;
    repeatSessionId?: string;
    quickRepertoire?: string;
    start?: string;
  }>;
}) {
  const {
    template: requestedTemplateId,
    repeatSessionId,
    quickRepertoire,
    start,
  } = await searchParams;

  return (
    <PracticeWorkspace
      initialPhases={phases}
      requestedTemplateId={requestedTemplateId}
      requestedSessionId={repeatSessionId}
      requestedQuickRepertoireId={quickRepertoire}
      autoStartTemplate={start === "1"}
    />
  );
}
