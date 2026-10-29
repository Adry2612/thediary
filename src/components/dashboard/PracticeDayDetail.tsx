"use client";

import { useEffect, useMemo, useState } from "react";
import { PracticeSessionDetails } from "@/components/dashboard/PracticeSessionDetails";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { SessionEditor } from "@/components/dashboard/SessionEditor";
import { PracticeRecordingItem } from "@/components/practice/PracticeRecordingItem";
import { getLocalDateKey } from "@/utils/local-date";
import { formatDateLabel } from "@/utils/format";
import { deletePracticeRecording, listPracticeRecordings } from "@/services/practice-library";
import type { PracticeAudioRecording } from "@/types/practice-library";
import { associateDayRecordings } from "@/utils/practice-recording-filtering";
import { usePracticeStore } from "@/stores/usePracticeStore";

interface PracticeDayDetailProps {
  dateKey: string;
}

export function PracticeDayDetail({ dateKey }: PracticeDayDetailProps) {
  const history = usePracticeStore((state) => state.history);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const licks = usePracticeStore((state) => state.licks);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const updateSession = usePracticeStore((state) => state.updateSession);
  const deleteSession = usePracticeStore((state) => state.deleteSession);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
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
  const sessionDescriptors = useMemo(
    () =>
      sessions.map((session) => ({
        id: session.id,
        title: session.title,
        dateKey: getLocalDateKey(new Date(session.startedAt)),
      })),
    [sessions],
  );
  const { bySession: recordingsBySession, unlinked: unlinkedRecordings } =
    useMemo(
      () => associateDayRecordings(recordings, sessionDescriptors, dateKey),
      [dateKey, recordings, sessionDescriptors],
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
    <PageShell>
      <BackLink href="/dashboard">Volver al dashboard</BackLink>
      <PageHeader
        className="mt-8"
        title={formatDateLabel(dateKey, "es-ES", true)}
        description={
          hasHydrated
            ? `${sessions.length} ${
                sessions.length === 1
                  ? "sesión registrada"
                  : "sesiones registradas"
              }`
            : undefined
        }
      />

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
        <>
          <div className="mt-8 space-y-5">
            {sessions.map((session) =>
              editingSessionId === session.id ? (
                <SessionEditor
                  key={session.id}
                  session={session}
                  onSave={(updated) => {
                    updateSession(updated);
                    setEditingSessionId(null);
                  }}
                  onCancel={() => setEditingSessionId(null)}
                />
              ) : (
                <PracticeSessionDetails
                  key={session.id}
                  session={session}
                  sessionRecordings={
                    recordingsBySession.get(session.id) ?? []
                  }
                  recordingsLoading={!recordingsLoaded}
                  repertoireItems={repertoireItems}
                  licks={licks}
                  onDeleteRecording={(recordingId) =>
                    void removeRecording(recordingId)
                  }
                  onEdit={() => setEditingSessionId(session.id)}
                  onDelete={(sessionId) => deleteSession(sessionId)}
                />
              ),
            )}
          </div>

          {unlinkedRecordings.length > 0 && (
            <section
              aria-labelledby="unlinked-recordings-title"
              className="mt-10 border-t border-line pt-6"
            >
              <h2
                id="unlinked-recordings-title"
                className="text-lg font-semibold text-ink"
              >
                Otras grabaciones de este día
              </h2>
              <p className="mt-2 text-sm text-muted">
                No están asociadas a ninguna práctica guardada.
              </p>
              <ul className="mt-4 space-y-3">
                {unlinkedRecordings.map((recording) => (
                  <PracticeRecordingItem
                    key={recording.id}
                    recording={recording}
                    onDelete={(recordingId) =>
                      void removeRecording(recordingId)
                    }
                  />
                ))}
              </ul>
            </section>
          )}
        </>
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
    </PageShell>
  );
}
