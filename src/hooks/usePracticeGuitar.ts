"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGuitarPreference } from "@/hooks/useGuitarPreference";
import { resolvePracticeGuitarId } from "@/utils/equipment";
import type { Guitar } from "@/types/equipment";

interface UsePracticeGuitarInput {
  /** Guitarra ya decidida: plantilla, sesión repetida o sesión editada. */
  explicitId?: string;
  guitars: readonly Guitar[];
}

/**
 * Guitarra de una práctica nueva. Hereda la última usada en el dispositivo —o
 * la única del equipo— y solo deja elegir cuando hay más de una, para no
 * preguntar en cada sesión ni dejar el uso a medias.
 */
export function usePracticeGuitar({
  explicitId,
  guitars,
}: UsePracticeGuitarInput) {
  const { lastGuitarId, rememberGuitarId } = useGuitarPreference();
  const [guitarId, setGuitarIdState] = useState<string | undefined>(explicitId);
  const touchedRef = useRef(false);

  useEffect(() => {
    if (touchedRef.current) return;
    setGuitarIdState(
      resolvePracticeGuitarId({
        explicitId,
        lastGuitarId: lastGuitarId ?? undefined,
        guitars,
      }),
    );
  }, [explicitId, lastGuitarId, guitars]);

  const setGuitarId = useCallback((value: string | undefined) => {
    touchedRef.current = true;
    setGuitarIdState(value);
  }, []);

  const rememberGuitar = useCallback(() => {
    if (guitarId) rememberGuitarId(guitarId);
  }, [guitarId, rememberGuitarId]);

  return {
    guitarId,
    setGuitarId,
    rememberGuitar,
    /** Con una sola guitarra no se pregunta: se atribuye sola. */
    showSelector: guitars.length > 1,
  };
}
