import type { PracticeLaunchPlan } from "./practice-launch.ts";

/**
 * Los tres estados de la pantalla de práctica: elegir rutina, revisar el plan
 * y practicar. `practise` representa una sesión en marcha; el resto de la
 * pantalla solo se muestra en `choose` y `review`.
 */
export type PracticeFlowStep = "choose" | "review" | "practise";

/** Editor de rutinas abierto como camino secundario, sobre el paso actual. */
export interface PracticeBuilderState {
  /** Rutina que se edita; `null` cuando es una rutina nueva. */
  templateId: string | null;
}

export interface PracticeFlowState {
  step: PracticeFlowStep;
  /** Plan revisado (o en curso). Solo existe desde `review`. */
  plan: PracticeLaunchPlan | null;
  builder: PracticeBuilderState | null;
}

export const INITIAL_PRACTICE_FLOW: PracticeFlowState = {
  step: "choose",
  plan: null,
  builder: null,
};

/**
 * Abre el editor de rutinas sin abandonar el paso actual: al cerrarlo se
 * vuelve exactamente a donde se estaba (elegir o revisar).
 */
export function openPracticeBuilder(
  flow: PracticeFlowState,
  templateId: string | null = null,
): PracticeFlowState {
  if (flow.step === "practise") return flow;
  return { ...flow, builder: { templateId } };
}

/** Cierra el editor conservando el paso y el plan que ya hubiera. */
export function closePracticeBuilder(
  flow: PracticeFlowState,
): PracticeFlowState {
  if (!flow.builder) return flow;
  return { ...flow, builder: null };
}

/** Elegir una rutina guardada lleva a revisar su plan, no a empezar. */
export function reviewPracticePlan(
  flow: PracticeFlowState,
  plan: PracticeLaunchPlan,
): PracticeFlowState {
  if (flow.step === "practise") return flow;
  return { step: "review", plan, builder: null };
}

/** Volver desde la revisión descarta el plan y no inicia nada. */
export function backToPracticeChoice(
  flow: PracticeFlowState,
): PracticeFlowState {
  if (flow.step === "practise") return flow;
  return { step: "choose", plan: null, builder: null };
}

/** Solo se puede empezar el plan que se está revisando. */
export function startReviewedPractice(
  flow: PracticeFlowState,
): PracticeFlowState {
  if (flow.step !== "review" || !flow.plan) return flow;
  return { step: "practise", plan: flow.plan, builder: null };
}

/**
 * La práctica rápida empieza sin revisión: no hay plan que revisar.
 * También sirve para lanzar un plan ya validado desde otro sitio.
 */
export function startPracticeNow(
  flow: PracticeFlowState,
  plan: PracticeLaunchPlan,
): PracticeFlowState {
  return { step: "practise", plan, builder: null };
}

/** Al guardar o descartar la sesión la pantalla vuelve a elegir. */
export function finishPractice(flow: PracticeFlowState): PracticeFlowState {
  if (flow.step !== "practise") return flow;
  return { step: "choose", plan: null, builder: null };
}
