"use client";

import {
  formatPracticeDuration,
  PRACTICE_SKILLS,
  PRACTICE_SKILL_LABELS,
  type PracticeDay,
} from "@/lib/dashboard-data";

type PracticeHeatmapProps = {
  days: PracticeDay[];
  month: Date;
  todayKey: string;
  selectedDate: string;
  canGoForward: boolean;
  onSelectDate: (dateKey: string) => void;
  onChangeMonth: (offset: -1 | 1) => void;
};

const WEEKDAY_LABELS = ["L", "", "X", "", "V", "", ""];

function getIntensity(minutes: number) {
  if (minutes === 0) return "bg-zinc-800/70";
  if (minutes < 25) return "bg-[#26372b]";
  if (minutes < 40) return "bg-[#3c5943]";
  if (minutes < 55) return "bg-[#5c8064]";
  return "bg-[#89a78b]";
}

function formatSelectedDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

export function PracticeHeatmap({
  days,
  month,
  todayKey,
  selectedDate,
  canGoForward,
  onSelectDate,
  onChangeMonth,
}: PracticeHeatmapProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const weekCount = Math.ceil((firstDayOffset + daysInMonth) / 7);
  const practiceByDate = new Map(days.map((day) => [day.dateKey, day]));
  const selectedDay = practiceByDate.get(selectedDate);
  const visibleCells = Array.from({ length: weekCount * 7 }, (_, index) => {
    const dayNumber = index - firstDayOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;

    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    return {
      dayNumber,
      dateKey,
      practice: practiceByDate.get(dateKey),
      isFuture: dateKey > todayKey,
    };
  });

  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            Constancia
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-zinc-100">
            Mapa de práctica
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeMonth(-1)}
            aria-label="Mes anterior"
            className="flex size-10 items-center justify-center rounded-md border border-zinc-800 text-zinc-300 transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path
                d="m12.5 4.5-5 5.5 5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <p className="min-w-32 text-center text-sm text-zinc-300">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => onChangeMonth(1)}
            disabled={!canGoForward}
            aria-label="Mes siguiente"
            className="flex size-10 items-center justify-center rounded-md border border-zinc-800 text-zinc-300 transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path
                d="m7.5 4.5 5 5.5-5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-2">
        <div className="flex w-full min-w-[360px] justify-center gap-3">
          <div className="grid grid-rows-7 gap-1 pt-0.5 text-[10px] leading-4 text-zinc-500">
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={index} className="h-4 w-3">
                {label}
              </span>
            ))}
          </div>
          <div
            role="group"
            aria-label={`Días de práctica de ${monthLabel}`}
            className="grid grid-flow-col grid-rows-7 gap-1"
            style={{
              gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))`,
            }}
          >
            {visibleCells.map((cell, index) => {
              if (!cell) {
                return <span key={`empty-${index}`} className="size-4" aria-hidden="true" />;
              }

              const minutes = cell.practice?.minutes ?? 0;
              const isSelected = cell.dateKey === selectedDate;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={cell.isFuture}
                  onClick={() => onSelectDate(cell.dateKey)}
                  aria-label={`${cell.dayNumber} de ${monthLabel}: ${minutes ? `${minutes} minutos de práctica` : "sin práctica registrada"}`}
                  aria-pressed={isSelected}
                  title={`${cell.dayNumber}: ${minutes} min`}
                  className={`size-4 rounded-[3px] ${getIntensity(minutes)} transition hover:outline hover:outline-1 hover:outline-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-200 disabled:cursor-default disabled:opacity-30 ${isSelected ? "outline outline-2 outline-offset-1 outline-[#d9c68f]" : ""}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-5">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Menos</span>
          {[0, 12, 30, 45, 60].map((minutes) => (
            <span
              key={minutes}
              aria-hidden="true"
              className={`size-3 rounded-[2px] ${getIntensity(minutes)}`}
            />
          ))}
          <span>Más</span>
        </div>
        <p className="text-xs text-zinc-500">
          Selecciona un día para ver el desglose
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-zinc-500">
            Día seleccionado
          </p>
          <h3 className="mt-1 text-zinc-200">
            {formatSelectedDate(selectedDate)}
          </h3>
        </div>
        {selectedDay && selectedDay.minutes > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:mt-0 sm:grid-cols-3">
            <p className="font-mono text-sm text-zinc-200">
              {formatPracticeDuration(selectedDay.minutes)}{" "}
              <span className="font-sans text-xs text-zinc-500">total</span>
            </p>
            <p className="font-mono text-sm text-zinc-200">
              {selectedDay.averageBpm}{" "}
              <span className="font-sans text-xs text-zinc-500">BPM</span>
            </p>
            <p className="col-span-2 text-xs text-zinc-500 sm:col-span-1 sm:text-right">
              {PRACTICE_SKILLS.map((skill) => (
                `${PRACTICE_SKILL_LABELS[skill]} ${Math.round(selectedDay.skillMinutes[skill])}m`
              )).join(" · ")}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500 sm:mt-0">
            No hay práctica registrada para este día.
          </p>
        )}
      </div>
    </section>
  );
}
