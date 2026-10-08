"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PracticeRecordingItem } from "@/components/practice/PracticeRecordingItem";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/Field";
import {
  getFilteredPracticeRecordings,
  isPracticeRecordingSort,
  groupPracticeRecordingsByDate,
  type PracticeRecordingFilters,
} from "@/lib/practice-recording-filtering";
import {
  deletePracticeRecording,
  listPracticeRecordings,
  type PracticeAudioRecording,
} from "@/lib/practice-library";

const INITIAL_FILTERS: PracticeRecordingFilters = {
  phaseOrder: "",
  phaseName: "",
  sort: "newest",
};
function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

export function RecordingsLibrary() {
  const [recordings, setRecordings] = useState<PracticeAudioRecording[]>([]);
  const [filters, setFilters] =
    useState<PracticeRecordingFilters>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    void listPracticeRecordings()
      .then((savedRecordings) => {
        if (!isActive) return;
        setRecordings(savedRecordings);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las grabaciones.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const blockOptions = useMemo(
    () =>
      Array.from(
        new Set(
          recordings
            .map((recording) => recording.phaseOrder)
            .filter((order): order is number => order !== undefined),
        ),
      )
        .sort((left, right) => left - right)
        .map((order) => ({
          value: String(order),
          label: `Bloque ${order}`,
        })),
    [recordings],
  );
  const filteredRecordings = useMemo(
    () => getFilteredPracticeRecordings(recordings, filters),
    [filters, recordings],
  );
  const recordingGroups = useMemo(
    () =>
      groupPracticeRecordingsByDate(
        filteredRecordings,
        filters.sort === "oldest" ? "oldest" : "newest",
      ),
    [filteredRecordings, filters.sort],
  );

  function updateFilter<Key extends keyof PracticeRecordingFilters>(
    key: Key,
    value: PracticeRecordingFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

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
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          Archivo personal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Grabaciones
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Escucha tus tomas agrupadas por día y localízalas por bloque o tipo
          de práctica.
        </p>
      </header>

      {(loadError || deleteError) && (
        <p className="mb-5 text-sm text-red-300" role="alert">
          {loadError ?? deleteError}
        </p>
      )}

      <section
        aria-label="Filtros y orden de grabaciones"
        className="rounded-xl border border-line bg-surface p-5 sm:p-6"
      >
        <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Bloque</p>
            <SelectField
              value={filters.phaseOrder}
              ariaLabel="Filtrar por bloque"
              onChange={(value) => updateFilter("phaseOrder", value)}
              className="mt-1"
              options={[
                { value: "", label: "Todos los bloques" },
                ...blockOptions,
              ]}
            />
          </div>
          <div>
            <label
              htmlFor="recording-phase-name"
              className="text-xs text-muted"
            >
              Nombre del bloque
            </label>
            <TextField
              id="recording-phase-name"
              value={filters.phaseName}
              onChange={(event) => updateFilter("phaseName", event.target.value)}
              placeholder="Buscar bloque"
              aria-label="Filtrar por nombre del bloque"
              className="mt-1"
            />
          </div>
          <div>
            <p className="text-xs text-muted">Ordenar por</p>
            <SelectField
              value={filters.sort}
              ariaLabel="Ordenar grabaciones"
              onChange={(value) => {
                if (isPracticeRecordingSort(value)) {
                  updateFilter("sort", value);
                }
              }}
              className="mt-1"
              options={[
                { value: "newest", label: "Día más reciente" },
                { value: "oldest", label: "Día más antiguo" },
                { value: "type", label: "Tipo de práctica" },
                { value: "name", label: "Nombre: A–Z" },
                { value: "block", label: "Orden de bloque" },
              ]}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-muted" aria-live="polite">
          {filteredRecordings.length}{" "}
          {filteredRecordings.length === 1
            ? "grabación encontrada"
            : "grabaciones encontradas"}
        </p>
      </section>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted" role="status">
          Cargando grabaciones…
        </p>
      ) : filteredRecordings.length > 0 ? (
        <div className="mt-8 space-y-10">
          {recordingGroups.map((group) => (
            <section
              key={group.dateKey || "unknown-date"}
              aria-labelledby={`recordings-${group.dateKey || "unknown-date"}`}
            >
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                <h2
                  id={`recordings-${group.dateKey || "unknown-date"}`}
                  className="font-sans text-2xl font-semibold capitalize tracking-tight text-ink sm:text-3xl"
                >
                  {group.dateKey
                    ? formatDateLabel(group.dateKey)
                    : "Fecha no disponible"}
                </h2>
                <span className="font-mono text-xs text-muted">
                  {group.recordings.length}{" "}
                  {group.recordings.length === 1 ? "grabación" : "grabaciones"}
                </span>
              </header>
              <ul className="mt-4 space-y-3">
                {group.recordings.map((recording) => (
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
          ))}
        </div>
      ) : recordings.length > 0 ? (
        <section className="mt-8 border-y border-line py-8">
          <h2 className="text-lg font-semibold text-ink">
            No hay coincidencias
          </h2>
          <p className="mt-2 text-sm text-muted">
            Prueba con otro bloque, tipo o nombre.
          </p>
          <button
            type="button"
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="mt-4 text-sm text-ink underline underline-offset-4"
          >
            Limpiar filtros
          </button>
        </section>
      ) : (
        <section className="mt-8 border-y border-line py-8">
          <h2 className="text-lg font-semibold text-ink">
            Todavía no hay grabaciones
          </h2>
          <p className="mt-2 text-sm text-muted">
            Inicia una grabación desde una sesión de práctica para que aparezca
            aquí.
          </p>
          <Link
            href="/practice"
            className="mt-4 inline-flex text-sm text-ink underline underline-offset-4"
          >
            Ir a práctica
          </Link>
        </section>
      )}
    </main>
  );
}
