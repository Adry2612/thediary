"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readGuitarPreference,
  saveGuitarPreference,
} from "@/services/guitar-preference";
import type { GuitarType } from "@/types/practice";

/**
 * Último tipo de guitarra usado en este dispositivo. Se lee tras montar para
 * no romper la hidratación y cada cambio se guarda como preferencia.
 */
export function useGuitarPreference() {
  const [lastGuitarType, setLastGuitarType] = useState<GuitarType | null>(null);

  useEffect(() => {
    setLastGuitarType(readGuitarPreference());
  }, []);

  const rememberGuitarType = useCallback((value: GuitarType | null) => {
    setLastGuitarType(saveGuitarPreference(value));
  }, []);

  return { lastGuitarType, rememberGuitarType };
}
