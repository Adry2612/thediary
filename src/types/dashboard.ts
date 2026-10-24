import type { DailyStats, SessionRecord } from "./practice";

/**
 * Celda del calendario anual: un día con sus estadísticas y sus sesiones, o
 * `null` para los huecos de relleno antes del primer día del año y después del
 * último, que la rejilla necesita para empezar en lunes.
 */
export type CalendarCell = {
  dateKey: string;
  stats?: DailyStats;
  sessions: SessionRecord[];
} | null;

/** Día que muestra la ficha emergente de los calendarios, ya colocado. */
export type PracticeTooltipDay = {
  dateKey: string;
  totalMinutes: number;
  sessionCount: number;
  sessions: SessionRecord[];
  left: number;
  top: number;
  showBelow: boolean;
  maxHeight: number;
};

/** Ficha emergente del gráfico de tiempo, ya colocada. */
export type ChartTooltip = {
  label: string;
  duration: string;
  sessionCount: number;
  average: string;
  /** Porcentaje respecto al mejor bucket del periodo, ya formateado. */
  ofBest: string;
  left: number;
  top: number;
};

/**
 * Fila del control de objetivos de práctica: un valor ajustable con su rango y
 * las dos acciones que el control ofrece.
 */
export type GoalControl = {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  ariaLabel: string;
  adjust: (direction: -1 | 1) => void;
  onChange: (value: number) => void;
};
