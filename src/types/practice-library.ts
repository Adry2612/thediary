import type { CloudSyncMap } from "./cloud-sync";
import type { PracticeResourceKind, PracticeSkill } from "./practice";

export interface PracticeAsset {
  id: string;
  fileName: string;
  kind: Exclude<PracticeResourceKind, "songsterr">;
  blob: Blob;
}

export interface PracticeAudioRecording {
  id: string;
  title: string;
  sessionName: string;
  sessionId?: string;
  practiceDate?: string;
  phaseId?: string | number;
  phaseOrder?: number;
  phaseName?: string;
  practiceSkill?: PracticeSkill;
  createdAt: string;
  durationSeconds?: number;
  mimeType: string;
  blob?: Blob;
  playbackUrl?: string;
  cloudSync?: CloudSyncMap;
}
