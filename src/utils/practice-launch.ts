import type {
  GuitarType,
  PracticePhase,
  PracticeResource,
  PracticeTemplate,
  RepertoireItem,
  SessionRecord,
} from "../types/practice.ts";
import { normalizePracticePhaseLinks } from "./practice-plan.ts";
import { normalizeTargetMinutes } from "./practice-target.ts";

export interface PracticeLaunchPlan {
  name: string;
  phases: PracticePhase[];
  /** Guitarra elegida al preparar el plan; sin valor si no se especificó. */
  guitarType?: GuitarType;
  /** Rutina guardada de la que sale el plan, si la hubo. */
  templateId?: string;
  /** Tiempo objetivo opcional de la sesión, en minutos. */
  targetMinutes?: number;
  /** Guitarra concreta de Mi equipo, si se eligió. */
  guitarId?: string;
}

/** Plan listo para abrir sesión, con lo que la sesión necesita además. */
export interface PracticeLaunchSession extends PracticeLaunchPlan {
  attachedResources?: PracticeResource[];
  isCountUp?: boolean;
}

/** Práctica rápida: un único bloque de técnica a contrarreloj. */
export function createQuickPracticePlan(
  title: string,
  blockName: string,
  phaseId: string,
): PracticeLaunchSession {
  return {
    name: title,
    phases: [
      {
        id: phaseId,
        name: blockName,
        durationMinutes: 120,
        skill: "technique",
      },
    ],
    isCountUp: true,
  };
}

/**
 * Práctica rápida de un elemento del repertorio. Vincular el elemento es lo que
 * hace que su tiempo practicado cuente cuando la práctica se completa (la parte
 * se deja sin elegir).
 */
export function createQuickRepertoirePlan(
  item: RepertoireItem,
  options: {
    guitarType?: GuitarType;
    guitarId?: string;
    targetMinutes?: number;
  } = {},
): PracticeLaunchSession {
  const guitarType = options.guitarType ?? item.guitarType;
  const guitarId = options.guitarId;
  const targetMinutes = normalizeTargetMinutes(options.targetMinutes);

  return {
    name: item.title,
    ...(guitarType ? { guitarType } : {}),
    ...(guitarId ? { guitarId } : {}),
    ...(targetMinutes ? { targetMinutes } : {}),
    phases: [
      {
        id: `quick-${item.id}`,
        name: item.title,
        durationMinutes: 1,
        skill: "repertoire",
        repertoireItemId: item.id,
        resources: item.guitarPro ? [item.guitarPro] : undefined,
      },
    ],
    attachedResources: item.resources,
    isCountUp: true,
  };
}

/** Plan de una rutina guardada, tal como está guardada. */
export function createTemplatePlan(
  template: Pick<PracticeTemplate, "id" | "name" | "phases" | "guitarType">,
): PracticeLaunchPlan {
  return {
    name: template.name,
    phases: template.phases.map(normalizePracticePhaseLinks),
    ...(template.guitarType ? { guitarType: template.guitarType } : {}),
    templateId: template.id,
  };
}

export function createPracticePlanFromSession(
  session: Pick<SessionRecord, "title" | "phases" | "guitarType" | "guitarId">,
): PracticeLaunchPlan | null {
  if (!session.phases?.length) return null;

  return {
    name: session.title ?? "Mi sesión",
    phases: session.phases.map((phase) =>
      normalizePracticePhaseLinks({
        id: phase.id,
        name: phase.name,
        durationMinutes:
          phase.durationMinutes ??
          Math.max(1, Math.ceil(phase.elapsedSeconds / 60)),
        skill: phase.skill,
        exercises: phase.exercises ? [...phase.exercises] : undefined,
        resources: phase.resources?.map((resource) => ({ ...resource })),
        repertoireItemId: phase.repertoireItemId,
        repertoirePartId: phase.repertoirePartId,
        lickId: phase.lickId,
      }),
    ),
    ...(session.guitarType ? { guitarType: session.guitarType } : {}),
    ...(session.guitarId ? { guitarId: session.guitarId } : {}),
  };
}
