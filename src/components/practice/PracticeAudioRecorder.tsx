"use client";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { PracticeRecordingItem } from "@/components/practice/PracticeRecordingItem";
import { PracticeRecordingWaveform } from "@/components/practice/PracticeRecordingWaveform";
import { usePracticeAudioRecorder } from "@/hooks/usePracticeAudioRecorder";
import type { PracticeSkill } from "@/types/practice";

export function PracticeAudioRecorder({
  sessionName,
  sessionId,
  practiceDate,
  phase,
  shouldStop = false,
}: {
  sessionName: string;
  sessionId: string;
  practiceDate?: string;
  phase?: {
    id: string | number;
    name: string;
    order: number;
    skill: PracticeSkill;
  };
  shouldStop?: boolean;
}) {
  const {
    recordingStream,
    recordings,
    isReady,
    recordingTitle,
    setRecordingTitle,
    isRecording,
    isSaving,
    error,
    storageError,
    handleWaveformError,
    startRecording,
    stopRecording,
    removeRecording,
  } = usePracticeAudioRecorder({
    sessionName,
    sessionId,
    practiceDate,
    phase,
    shouldStop,
  });

  return (
    <section className="enter rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.05em] text-muted">
            Grabación de audio
          </p>
          <h3 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8">
            Captura tu práctica
          </h3>
          <p className="mt-2 max-w-prose text-sm text-muted">
            El audio se guarda solo en este dispositivo. Se necesita permiso
            para usar el micrófono y la página debe servirse por HTTPS o
            localhost.
          </p>
        </div>
        <span
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${isRecording ? "border-accent-green-fg/30 bg-accent-green-bg text-accent-green-fg" : "border-line text-muted"}`}
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${isRecording ? "animate-pulse bg-accent-green-fg" : "bg-muted"}`}
          />
          {shouldStop
            ? "Sesión completada"
            : isSaving
              ? "Guardando audio"
              : isRecording
                ? "Grabando"
                : "Lista para grabar"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block text-xs text-muted">
          Nombre de la grabación
          <TextField
            value={recordingTitle}
            onChange={(event) => setRecordingTitle(event.target.value)}
            maxLength={100}
            className="mt-1"
          />
        </label>

        <Button
          type="button"
          variant={isRecording ? "ghost" : "primary"}
          onClick={isRecording ? stopRecording : () => void startRecording()}
          disabled={!isReady || isSaving || shouldStop}
          className="w-full sm:w-auto"
        >
          {shouldStop
            ? "Sesión completada"
            : isSaving
            ? "Guardando audio…"
            : isRecording
              ? "Detener y guardar"
              : "Iniciar grabación"}
        </Button>
      </div>

      <PracticeRecordingWaveform
        stream={recordingStream}
        onError={handleWaveformError}
      />

      {error && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      {storageError && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {storageError}
        </p>
      )}

      <div className="mt-8 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-xs uppercase tracking-[0.05em] text-muted">
            Grabaciones guardadas
          </h4>
          <span className="font-mono text-xs text-muted">
            {recordings.length} {recordings.length === 1 ? "audio" : "audios"}
          </span>
        </div>
        {recordings.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {recordings.map((recording) => (
              <PracticeRecordingItem
                key={recording.id}
                recording={recording}
                onDelete={(id) => void removeRecording(id)}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-line px-4 py-6 text-sm text-muted">
            Todavía no hay grabaciones.
          </p>
        )}
      </div>
    </section>
  );
}
