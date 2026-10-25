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
 * fila semanal hacia la ficha pasa por celdas vecinas; sin esta intención,
 * cada una reemplazaría el día abierto y la ficha se movería bajo el puntero.
 */
const HOVER_INTENT_MS = 180;

type PracticeDayTooltipOptions = {
  /**
   * La ficha anual es solo una vista previa: no recibe el puntero, así que
   * cualquier día bajo ella puede seguir usándose. En este modo no hay
   * intención de hover ni entrada en la ficha: se abre al instante y se cierra
   * con cualquier scroll, cambio de tamaño, Escape o salida del calendario.
   */
  preview?: boolean;
};

/**
 * Día cuyo resumen está abierto y dónde colocarlo. Lo comparten la ficha
 * flotante del resumen semanal y la vista previa del calendario anual.
 *
 * En el modo interactivo la ficha permanece abierta mientras el puntero esté en
 * el día o en la propia ficha. En el modo de vista previa no captura el puntero
 * y se cierra en cuanto se deja de consultar el día.
 */
export function usePracticeDayTooltip({
  preview = false,
}: PracticeDayTooltipOptions = {}) {
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
  /**
   * Tras redimensionar, el navegador puede volver a emitir `mouseenter` sobre
   * el día que sigue bajo el puntero. La vista previa espera a que el puntero
   * se mueva para no reaparecer anclada a la posición anterior.
   */
  const suppressPreviewHoverRef = useRef(false);

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
    if (!preview && isPointerOverCardRef.current) return;
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      cancelScheduledSwitch();
      setHoveredDay(null);
    }, HIDE_DELAY_MS);
  }, [cancelHide, cancelScheduledSwitch, preview]);

  const showTooltip = useCallback(
    (element: HTMLElement, day: PracticeTooltipDayData) => {
      if (preview && suppressPreviewHoverRef.current) return;
      cancelHide();
      cancelScheduledSwitch();
      setHoveredDay({
        ...day,
        ...getPracticeTooltipPosition(element),
      });
    },
    [cancelHide, cancelScheduledSwitch, preview],
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
      if (preview || !hoveredDay) {
        showTooltip(element, day);
        return;
      }
      if (hoveredDay.dateKey === day.dateKey) return;
      switchTimerRef.current = window.setTimeout(() => {
        switchTimerRef.current = null;
        showTooltip(element, day);
      }, HOVER_INTENT_MS);
    },
    [cancelHide, cancelScheduledSwitch, hoveredDay, preview, showTooltip],
  );

  const handleCardPointerEnter = useCallback(() => {
    if (preview) return;
    isPointerOverCardRef.current = true;
    cancelHide();
    cancelScheduledSwitch();
  }, [cancelHide, cancelScheduledSwitch, preview]);

  const handleCardPointerLeave = useCallback(() => {
    if (preview) return;
    isPointerOverCardRef.current = false;
    scheduleHide();
  }, [preview, scheduleHide]);

  const isOpen = hoveredDay !== null;
  useEffect(() => {
    if (!isOpen) return;

    function handleScroll(event: Event) {
      if (!preview) {
        const target = event.target;
        if (target instanceof Node && cardRef.current?.contains(target)) return;
      }
      hideTooltip();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hideTooltip();
    }

    function handleResize() {
      if (preview) {
        suppressPreviewHoverRef.current = true;
        const release = () => {
          suppressPreviewHoverRef.current = false;
          window.removeEventListener("pointermove", release);
        };
        window.addEventListener("pointermove", release);
      }
      hideTooltip();
    }

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hideTooltip, isOpen, preview]);

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
