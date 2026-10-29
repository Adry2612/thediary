"use client";

import { useEffect, useState } from "react";
import { getPracticeAssetForUser } from "@/services/practice-asset";
import type { PracticeResource } from "@/types/practice";

/**
 * URL temporal (`blob:`) del archivo de un material, o el error si no se pudo
 * cargar. La URL se revoca al desmontar o al cambiar de material.
 */
export function useAssetUrl(
  resource: PracticeResource | null,
  userId?: string,
) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;
    setUrl(null);
    setError(null);
    if (!resource?.assetId || resource.kind === "songsterr") return;

    const assetRequest = getPracticeAssetForUser(
      resource.assetId,
      userId,
    );
    void assetRequest
      .then((asset) => {
        if (!asset) throw new Error("No se encontró el archivo.");
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(asset.blob);
        setUrl(objectUrl);
      })
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setError(
          loadError instanceof Error ?
            loadError.message
          : "No se pudo abrir el archivo.",
        );
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resource, userId]);

  return { url, error };
}
