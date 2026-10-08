"use client";

import { useEffect, useState } from "react";
import { PracticeAudioPlayer } from "@/components/practice/PracticeAudioPlayer";
import { PRACTICE_SKILL_LABELS } from "@/lib/dashboard-data";
import type { PracticeAudioRecording } from "@/lib/practice-library";

interface PracticeRecordingItemProps {
  recording: PracticeAudioRecording;
  onDelete: (recordingId: string) => void;
}

function useRecordingUrl(blob: Blob) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}

export function PracticeRecordingItem({
  recording,
  onDelete,
}: PracticeRecordingItemProps) {
  const audioUrl = useRecordingUrl(recording.blob);
  const date = new Date(recording.createdAt).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <li className="rounded-lg border border-line bg-canvas/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{recording.title}</p>
          <p className="mt-1 text-xs text-muted">
            {recording.sessionName} · {date}
          </p>
          <p className="mt-1 text-xs text-muted">
            {recording.phaseOrder ? `Bloque ${recording.phaseOrder} · ` : ""}
            {recording.phaseName ?? "Bloque sin asociar"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {recording.practiceSkill
              ? PRACTICE_SKILL_LABELS[recording.practiceSkill]
              : "Tipo de práctica sin asociar"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(recording.id)}
          aria-label={`Eliminar grabación ${recording.title}`}
          title="Eliminar grabación"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-red-300 transition hover:bg-red-400/10 hover:text-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M4.5 6h11m-9.5 0 .6 10h7.8l.6-10M8 6V4h4v2m-3 3v4m2-4v4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
      {audioUrl && (
        <div className="mt-4 border-t border-line pt-4">
          <PracticeAudioPlayer
            src={audioUrl}
            title={recording.title}
            durationSeconds={recording.durationSeconds}
          />
        </div>
      )}
    </li>
  );
}
