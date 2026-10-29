"use client";

import { useEffect, useRef, useState } from "react";
import {
  createPracticePlanFromSession,
  createTemplatePlan,
  type PracticeLaunchSession,
} from "@/utils/practice-launch";
import type { ActivePracticeSession } from "@/stores/useActivePracticeSessionStore";
import { validatePracticeTemplate } from "@/utils/practice-templates";
import type {
  PracticeTemplate,
  RepertoireItem,
  SessionRecord,
} from "@/types/practice";
import type { GuitarLick } from "@/types/lick";

interface UseRequestedLaunchOptions {
  requestedTemplateId?: string;
  requestedSessionId?: string;
  requestedQuickRepertoireId?: string;
  autoStartTemplate?: boolean;
  hasHydrated: boolean;
  activeSessionHydrated: boolean;
  activeSession: ActivePracticeSession | null;
  templates: PracticeTemplate[];
  history: SessionRecord[];
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
  templateNotFound: string;
  repeatNotFound: string;
  invalidTemplate: string;
  invalidRepeat: string;
  /** Abre la sesión con el plan ya construido. */
  launch: (plan: PracticeLaunchSession) => void;
}

/**
 * Atiende la práctica que pide la URL (`quickRepertoire`, `template`, `session`)
 * una sola vez por petición, esperando a que el estado esté hidratado y sin
 * pisar una sesión que ya esté en marcha. La práctica rápida de repertorio se
 * entrega como pendiente para que la pantalla confirme la guitarra antes de
 * arrancar.
 */
export function useRequestedLaunch({
  requestedTemplateId,
  requestedSessionId,
  requestedQuickRepertoireId,
  autoStartTemplate,
  hasHydrated,
  activeSessionHydrated,
  activeSession,
  templates,
  history,
  repertoireItems,
  licks,
  templateNotFound,
  repeatNotFound,
  invalidTemplate,
  invalidRepeat,
  launch,
}: UseRequestedLaunchOptions) {
  const [templateLaunchError, setTemplateLaunchError] = useState<string | null>(
    null,
  );
  const [pendingQuickRepertoire, setPendingQuickRepertoire] =
    useState<RepertoireItem | null>(null);
  const launchedTemplateId = useRef<string | null>(null);
  const launchedSessionId = useRef<string | null>(null);
  const launchedQuickRepertoireId = useRef<string | null>(null);

  useEffect(() => {
    if (
      !requestedQuickRepertoireId ||
      !hasHydrated ||
      !activeSessionHydrated ||
      activeSession ||
      launchedQuickRepertoireId.current === requestedQuickRepertoireId
    ) {
      return;
    }

    launchedQuickRepertoireId.current = requestedQuickRepertoireId;
    const item = repertoireItems.find(
      (candidate) => candidate.id === requestedQuickRepertoireId,
    );
    if (!item) {
      setTemplateLaunchError(templateNotFound);
      return;
    }

    setPendingQuickRepertoire(item);
    setTemplateLaunchError(null);
  }, [
    activeSession,
    activeSessionHydrated,
    hasHydrated,
    repertoireItems,
    requestedQuickRepertoireId,
    templateNotFound,
  ]);

  useEffect(() => {
    if (
      requestedSessionId ||
      requestedQuickRepertoireId ||
      !autoStartTemplate ||
      !requestedTemplateId ||
      !hasHydrated ||
      !activeSessionHydrated ||
      activeSession
    ) {
      return;
    }
    if (launchedTemplateId.current === requestedTemplateId) return;

    launchedTemplateId.current = requestedTemplateId;
    const template = templates.find(
      (candidate) => candidate.id === requestedTemplateId,
    );
    if (!template) {
      setTemplateLaunchError(templateNotFound);
      return;
    }

    const plan = createTemplatePlan(template);
    if (
      validatePracticeTemplate(plan.name, plan.phases, {
        repertoireItems,
        licks,
      })
    ) {
      setTemplateLaunchError(invalidTemplate);
      return;
    }

    launch(plan);
    setTemplateLaunchError(null);
  }, [
    activeSession,
    activeSessionHydrated,
    autoStartTemplate,
    hasHydrated,
    invalidTemplate,
    launch,
    licks,
    repertoireItems,
    requestedQuickRepertoireId,
    requestedSessionId,
    requestedTemplateId,
    templateNotFound,
    templates,
  ]);

  useEffect(() => {
    if (
      !requestedSessionId ||
      !hasHydrated ||
      !activeSessionHydrated ||
      activeSession
    ) {
      return;
    }
    if (launchedSessionId.current === requestedSessionId) return;

    launchedSessionId.current = requestedSessionId;
    const session = history.find(
      (candidate) => candidate.id === requestedSessionId,
    );
    const plan = session ? createPracticePlanFromSession(session) : null;
    if (!plan) {
      setTemplateLaunchError(repeatNotFound);
      return;
    }
    if (
      validatePracticeTemplate(plan.name, plan.phases, {
        repertoireItems,
        licks,
      })
    ) {
      setTemplateLaunchError(invalidRepeat);
      return;
    }

    launch(plan);
    setTemplateLaunchError(null);
  }, [
    activeSession,
    activeSessionHydrated,
    hasHydrated,
    history,
    invalidRepeat,
    launch,
    licks,
    repertoireItems,
    repeatNotFound,
    requestedSessionId,
  ]);

  return {
    templateLaunchError,
    setTemplateLaunchError,
    pendingQuickRepertoire,
    clearPendingQuickRepertoire: () => setPendingQuickRepertoire(null),
  };
}
