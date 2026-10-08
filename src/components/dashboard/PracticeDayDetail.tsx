"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PracticeSessionDetails } from "@/components/dashboard/PracticeSessionDetails";
import { getLocalDateKey } from "@/lib/local-date";
import {
  deletePracticeRecording,
  listPracticeRecordings,
  type PracticeAudioRecording,
} from "@/lib/practice-library";
import { groupPracticeRecordingsBySession } from "@/lib/practice-recording-filtering";
import { usePracticeStore } from "@/stores/usePracticeStore";

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}

interface PracticeDayDetailProps {
  dateKey: string;
}

export function PracticeDayDetail({ dateKey }: PracticeDayDetailProps) {
  const history = usePracticeStore((state) => state.history);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const [recordings, setRecordings] = useState<PracticeAudioRecording[]>([]);
  const [recordingsLoaded, setRecordingsLoaded] = useState(false);
  const [recordingsError, setRecordingsError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    void listPracticeRecordings()
      .then((savedRecordings) => {
        if (!isActive) return;
        setRecordings(savedRecordings);
        setRecordingsError(null);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setRecordingsError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las grabaciones.",
        );
      })
      .finally(() => {
        if (isActive) setRecordingsLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const sessions = useMemo(
    () =>
      history
        .filter(
          (session) =>
            getLocalDateKey(new Date(session.startedAt)) === dateKey,
        )
        .sort((left, right) =>
          left.startedAt.localeCompare(right.startedAt),
        ),
    [dateKey, history],
  );
  const recordingsBySession = useMemo(
    () =>
      groupPracticeRecordingsBySession(
        recordings,
        sessions.map((session) => ({
          id: session.id,
          title: session.title,
          dateKey: getLocalDateKey(new Date(session.startedAt)),
        })),
      ),
    [recordings, sessions],
  );

  async function removeRecording(recordingId: string) {
    try {
      await deletePracticeRecording(recordingId);
      setRecordings((current) =>
        current.filter((recording) => recording.id !== recordingId),
      );
      setDeleteError(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la grabación.",
      );
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/dashboard"
        className="text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Volver al dashboard
      </Link>
      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          Detalle de práctica
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {formatDate(dateKey)}
        </h1>
        {hasHydrated && (
          <p className="mt-3 text-base text-muted">
            {sessions.length}{" "}
            {sessions.length === 1
              ? "sesión registrada"
              : "sesiones registradas"}
          </p>
        )}
      </header>

      {recordingsError && (
        <p className="mt-6 text-sm text-red-300" role="alert">
          {recordingsError}
        </p>
      )}
      {deleteError && (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {deleteError}
        </p>
      )}

      {!hasHydrated ? (
        <p className="mt-8 text-sm text-muted" role="status">
          Cargando sesiones…
        </p>
      ) : sessions.length > 0 ? (
        <div className="mt-8 space-y-5">
          {sessions.map((session) => (
            <PracticeSessionDetails
              key={session.id}
              session={session}
              sessionRecordings={
                recordingsLoaded
                  ? (recordingsBySession.get(session.id) ?? [])
                  : []
              }
              repertoireItems={repertoireItems}
              onDeleteRecording={(recordingId) =>
                void removeRecording(recordingId)
              }
            />
          ))}
        </div>
      ) : (
        <section className="mt-8 border-y border-line py-8">
          <h2 className="text-lg font-semibold text-ink">
            No hay prácticas guardadas este día
          </h2>
          <p className="mt-2 text-sm text-muted">
            El historial no contiene sesiones para esta fecha.
          </p>
        </section>
      )}
    </main>
  );
}
