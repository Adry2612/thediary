"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLocalDateKey } from "@/lib/local-date";
import { createPracticeAudioRecording } from "@/lib/practice-recording";
import { getRecordingDurationSeconds } from "@/lib/recording-duration";
import {
  deletePracticeRecording,
  listPracticeRecordings,
  savePracticeRecording,
  type PracticeAudioRecording,
} from "@/lib/practice-library";
import { getSessionPracticeRecordings } from "@/lib/practice-recording-filtering";
import type { PracticeSkill } from "@/types/practice";

interface PracticeRecordingPhase {
  id: string | number;
  name: string;
  order: number;
  skill: PracticeSkill;
}

interface UsePracticeAudioRecorderOptions {
  sessionName: string;
  sessionId: string;
  practiceDate?: string;
  phase?: PracticeRecordingPhase;
  shouldStop: boolean;
}

export function usePracticeAudioRecorder({
  sessionName,
  sessionId,
  practiceDate,
  phase,
  shouldStop,
}: UsePracticeAudioRecorderOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingStoppedAtRef = useRef<number | null>(null);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null,
  );
  const [recordings, setRecordings] = useState<PracticeAudioRecording[]>([]);
  const [recordingTitle, setRecordingTitle] = useState(sessionName);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  const refreshRecordings = useCallback(async () => {
    try {
      const savedRecordings = await listPracticeRecordings();
      setRecordings(getSessionPracticeRecordings(savedRecordings, sessionId));
      setStorageError(null);
    } catch (loadError) {
      setStorageError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las grabaciones guardadas.",
      );
    }
  }, [sessionId]);

  const handleWaveformError = useCallback((message: string) => {
    setError(
      `La grabación sigue activa, pero no se pudo mostrar la onda: ${message}`,
    );
  }, []);

  useEffect(() => {
    void refreshRecordings();
  }, [refreshRecordings]);

  useEffect(() => {
    if (shouldStop && recorderRef.current?.state === "recording") {
      recordingStoppedAtRef.current = performance.now();
      recorderRef.current.stop();
    }
  }, [shouldStop]);

  useEffect(
    () => () => {
      const recorder = recorderRef.current;
      if (recorder?.state === "recording") {
        recordingStoppedAtRef.current = performance.now();
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startRecording() {
    setError(null);
    const recordingContext = {
      sessionId,
      sessionName,
      practiceDate: practiceDate ?? getLocalDateKey(new Date()),
      phase,
    };
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
      setRecordingStream(stream);
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
      recordingStoppedAtRef.current = null;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });
      recorder.addEventListener("error", () => {
        setError("Ha ocurrido un error al grabar el audio.");
        setIsRecording(false);
        if (recorder.state === "recording") {
          recordingStoppedAtRef.current = performance.now();
          recorder.stop();
        }
      });
      recorder.addEventListener(
        "stop",
        () => {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setRecordingStream(null);
          recorderRef.current = null;
          setIsRecording(false);
          const stoppedAtMilliseconds =
            recordingStoppedAtRef.current ?? performance.now();
          const recordingStartedAt = recordingStartedAtRef.current;
          recordingStoppedAtRef.current = null;
          recordingStartedAtRef.current = null;
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          chunksRef.current = [];
          if (blob.size === 0) {
            setIsSaving(false);
            return;
          }
          if (recordingStartedAt === null) {
            setError("No se pudo calcular la duración de esta grabación.");
          }

          setIsSaving(true);
          const recording = createPracticeAudioRecording({
            ...recordingContext,
            title: recordingTitle,
            durationSeconds:
              recordingStartedAt === null
                ? undefined
                : getRecordingDurationSeconds(
                    recordingStartedAt,
                    stoppedAtMilliseconds,
                  ),
            blob,
          });
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
      recordingStartedAtRef.current = performance.now();
      recorder.start(250);
      setIsRecording(true);
    } catch (recordingError) {
      recordingStartedAtRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecordingStream(null);
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "No se pudo acceder al micrófono.",
      );
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder?.state !== "recording") return;

    recordingStoppedAtRef.current = performance.now();
    recorder.stop();
    setIsSaving(true);
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

  return {
    recordingStream,
    recordings,
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
  };
}
