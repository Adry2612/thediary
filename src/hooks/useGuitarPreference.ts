"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readGuitarIdPreference,
  readGuitarPreference,
  saveGuitarIdPreference,
  saveGuitarPreference,
} from "@/services/guitar-preference";
import type { GuitarType } from "@/types/practice";

/**
 * Último tipo de guitarra y última guitarra concreta usados en este
 * dispositivo. Se leen tras montar para no romper la hidratación y cada cambio
 * se guarda como preferencia.
 */
export function useGuitarPreference() {
  const [lastGuitarType, setLastGuitarType] = useState<GuitarType | null>(null);
  const [lastGuitarId, setLastGuitarId] = useState<string | null>(null);

  useEffect(() => {
    setLastGuitarType(readGuitarPreference());
    setLastGuitarId(readGuitarIdPreference());
  }, []);

  const rememberGuitarType = useCallback((value: GuitarType | null) => {
    setLastGuitarType(saveGuitarPreference(value));
  }, []);

  const rememberGuitarId = useCallback((value: string | null) => {
    setLastGuitarId(saveGuitarIdPreference(value));
  }, []);

  return {
    lastGuitarType,
    rememberGuitarType,
    lastGuitarId,
    rememberGuitarId,
  };
}
