"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPracticeTooltipPosition } from "@/utils/practice-tooltip";
import type { PracticeTooltipDay } from "@/types/dashboard";

type PracticeTooltipDayData = Omit<
  PracticeTooltipDay,
  "left" | "top" | "showBelow" | "maxHeight"
>;

/**
 * Margen para cruzar el hueco entre el día y la ficha sin que esta se cierre.
 * También evita que el parpadeo del puntero al cambiar de día la reinicie.
 */
const HIDE_DELAY_MS = 150;

/**
 * Espera antes de cambiar de día mientras ya hay un resumen abierto. Cruzar la
 * cuadrícula anual hacia la ficha pasa por celdas vecinas; sin esta intención,
 * cada una reemplazaría el día abierto y la ficha se movería bajo el puntero.
 */
const HOVER_INTENT_MS = 180;

/**
 * Día cuyo resumen está abierto y dónde colocarlo. Comparten el estado el
 * calendario anual y el resumen semanal.
 *
 * La ficha es interactiva: permanece abierta mientras el puntero esté en el día
 * o en la propia ficha. Se cierra al salir de ambos, al hacer scroll en la
 * página (no en la lista interna) y al redimensionar la ventana.
 */
export function usePracticeDayTooltip() {
  const [hoveredDay, setHoveredDay] = useState<PracticeTooltipDay | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const switchTimerRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  /**
   * El navegador puede avisar de la entrada en la ficha antes de la salida del
   * día. Sin esta marca, la salida programaría un cierre que ya no cancela
   * nadie y la ficha desaparecería bajo el puntero.
   */
  const isPointerOverCardRef = useRef(false);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current === null) return;
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const cancelScheduledSwitch = useCallback(() => {
    if (switchTimerRef.current === null) return;
    window.clearTimeout(switchTimerRef.current);
    switchTimerRef.current = null;
  }, []);

  const hideTooltip = useCallback(() => {
    cancelHide();
    cancelScheduledSwitch();
    isPointerOverCardRef.current = false;
    setHoveredDay(null);
  }, [cancelHide, cancelScheduledSwitch]);

  const scheduleHide = useCallback(() => {
    cancelHide();
    if (isPointerOverCardRef.current) return;
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      cancelScheduledSwitch();
      setHoveredDay(null);
    }, HIDE_DELAY_MS);
  }, [cancelHide, cancelScheduledSwitch]);

  const showTooltip = useCallback(
    (element: HTMLElement, day: PracticeTooltipDayData) => {
      cancelHide();
      cancelScheduledSwitch();
      setHoveredDay({
        ...day,
        ...getPracticeTooltipPosition(element),
      });
    },
    [cancelHide, cancelScheduledSwitch],
  );

  /**
   * Abre el resumen al instante si no hay ninguno, y espera la intención del
   * puntero cuando solo cambia de día. Así el primer día y el foco de teclado
   * responden de inmediato, pero cruzar celdas hacia la ficha no la sustituye.
   */
  const scheduleTooltip = useCallback(
    (element: HTMLElement, day: PracticeTooltipDayData) => {
      cancelHide();
      cancelScheduledSwitch();
      if (!hoveredDay) {
        showTooltip(element, day);
        return;
      }
      if (hoveredDay.dateKey === day.dateKey) return;
      switchTimerRef.current = window.setTimeout(() => {
        switchTimerRef.current = null;
        showTooltip(element, day);
      }, HOVER_INTENT_MS);
    },
    [cancelHide, cancelScheduledSwitch, hoveredDay, showTooltip],
  );

  const handleCardPointerEnter = useCallback(() => {
    isPointerOverCardRef.current = true;
    cancelHide();
    cancelScheduledSwitch();
  }, [cancelHide, cancelScheduledSwitch]);

  const handleCardPointerLeave = useCallback(() => {
    isPointerOverCardRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const isOpen = hoveredDay !== null;
  useEffect(() => {
    if (!isOpen) return;

    function handleScroll(event: Event) {
      const target = event.target;
      if (target instanceof Node && cardRef.current?.contains(target)) return;
      hideTooltip();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hideTooltip();
    }

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", hideTooltip);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", hideTooltip);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hideTooltip, isOpen]);

  useEffect(
    () => () => {
      cancelHide();
      cancelScheduledSwitch();
    },
    [cancelHide, cancelScheduledSwitch],
  );

  return {
    hoveredDay,
    cardRef,
    showTooltip,
    scheduleTooltip,
    hideTooltip,
    scheduleHide,
    handleCardPointerEnter,
    handleCardPointerLeave,
  };
}
