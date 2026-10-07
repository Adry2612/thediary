"use client";

import { useEffect } from "react";
import { usePracticeStore } from "@/stores/usePracticeStore";

export function PracticeStoreHydrator() {
  useEffect(() => {
    void usePracticeStore.persist.rehydrate();
  }, []);

  return null;
}
