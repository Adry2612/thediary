"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import {
  deletePracticeRecording,
  listPracticeRecordings,
  savePracticeRecording,
  type PracticeAudioRecording,
} from "@/lib/practice-library";

function useRecordingUrl(blob: Blob) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}

function RecordingItem({
  recording,
  onDelete,
}: {
  recording: PracticeAudioRecording;
  onDelete: (recordingId: string) => void;
}) {
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
        </div>
        <button
          type="button"
          onClick={() => onDelete(recording.id)}
          className="rounded-sm px-2 py-1 text-xs text-muted underline underline-offset-4 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
        >
          Eliminar
        </button>
      </div>
      {audioUrl && (
        <audio
          controls
          preload="none"
          src={audioUrl}
          className="mt-4 h-11 w-full"
        >
          Tu navegador no puede reproducir esta grabación.
        </audio>
      )}
    </li>
  );
}

export function PracticeAudioRecorder({
  sessionName,
  shouldStop = false,
}: {
  sessionName: string;
  shouldStop?: boolean;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordings, setRecordings] = useState<PracticeAudioRecording[]>([]);
  const [recordingTitle, setRecordingTitle] = useState(sessionName);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  const refreshRecordings = useCallback(async () => {
    try {
      setRecordings(await listPracticeRecordings());
      setStorageError(null);
    } catch (loadError) {
      setStorageError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las grabaciones guardadas.",
      );
    }
  }, []);

  useEffect(() => {
    void refreshRecordings();
  }, [refreshRecordings]);

  useEffect(() => {
    if (shouldStop && recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, [shouldStop]);

  useEffect(
    () => () => {
      const recorder = recorderRef.current;
      if (recorder?.state === "recording") recorder.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startRecording() {
    setError(null);
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("Este navegador no permite grabar audio desde la app.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });
      recorder.addEventListener("error", () => {
        setError("Ha ocurrido un error al grabar el audio.");
        setIsRecording(false);
        if (recorder.state === "recording") recorder.stop();
      });
      recorder.addEventListener(
        "stop",
        () => {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          recorderRef.current = null;
          setIsRecording(false);
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          chunksRef.current = [];
          if (blob.size === 0) {
            setIsSaving(false);
            return;
          }

          setIsSaving(true);
          const recording: PracticeAudioRecording = {
            id: crypto.randomUUID(),
            title: recordingTitle.trim() || sessionName,
            sessionName,
            createdAt: new Date().toISOString(),
            mimeType: blob.type,
            blob,
          };
          void savePracticeRecording(recording)
            .then(refreshRecordings)
            .catch((saveError: unknown) => {
              setStorageError(
                saveError instanceof Error
                  ? saveError.message
                  : "No se pudo guardar la grabación.",
              );
            })
            .finally(() => setIsSaving(false));
        },
        { once: true },
      );
      recorder.start(250);
      setIsRecording(true);
    } catch (recordingError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "No se pudo acceder al micrófono.",
      );
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
      setIsSaving(true);
    }
  }

  async function removeRecording(recordingId: string) {
    try {
      await deletePracticeRecording(recordingId);
      setRecordings((current) =>
        current.filter((recording) => recording.id !== recordingId),
      );
      setStorageError(null);
    } catch (deleteError) {
      setStorageError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la grabación.",
      );
    }
  }

  return (
    <section className="enter rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.05em] text-muted">
            Grabación de audio
          </p>
          <h3 className="mt-2 font-serif text-2xl">Captura tu práctica</h3>
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
          disabled={isSaving || shouldStop}
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
              <RecordingItem
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
