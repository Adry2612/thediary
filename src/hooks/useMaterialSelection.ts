"use client";

import { useEffect, useState } from "react";
import type { PracticeResource } from "@/types/practice";

interface MaterialEntry {
  resource: PracticeResource;
}

/**
 * Qué material de la lista se está viendo. Si el seleccionado desaparece (se
 * adjunta otro, se recarga la lista), vuelve al primero.
 */
export function useMaterialSelection(resources: MaterialEntry[]) {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    resources[0]?.resource.id ?? null,
  );
  const activeResource =
    resources.find(({ resource }) => resource.id === selectedResourceId)
      ?.resource ?? resources[0]?.resource;

  useEffect(() => {
    if (!resources.some(({ resource }) => resource.id === selectedResourceId)) {
      setSelectedResourceId(resources[0]?.resource.id ?? null);
    }
  }, [resources, selectedResourceId]);

  return { activeResource, selectResource: setSelectedResourceId };
}
