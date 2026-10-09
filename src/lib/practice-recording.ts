import type { PracticeAudioRecording } from "@/lib/practice-library";
import type { PracticeSkill } from "@/types/practice";
import { createId } from "./create-id.ts";

interface PracticeRecordingPhase {
  id: string | number;
  name: string;
  order: number;
  skill: PracticeSkill;
}

interface CreatePracticeAudioRecordingInput {
  title: string;
  sessionName: string;
  sessionId: string;
  practiceDate: string;
  phase?: PracticeRecordingPhase;
  durationSeconds?: number;
  blob: Blob;
}

export function createPracticeAudioRecording({
  title,
  sessionName,
  sessionId,
  practiceDate,
  phase,
  durationSeconds,
  blob,
}: CreatePracticeAudioRecordingInput): PracticeAudioRecording {
  return {
    id: createId(),
    title: title.trim() || sessionName,
    sessionName,
    sessionId,
    practiceDate,
    phaseId: phase?.id,
    phaseOrder: phase?.order,
    phaseName: phase?.name,
    practiceSkill: phase?.skill,
    createdAt: new Date().toISOString(),
    ...(durationSeconds === undefined ? {} : { durationSeconds }),
    mimeType: blob.type,
    blob,
  };
}
