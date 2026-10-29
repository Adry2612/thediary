"use client";

import { useEffect, useState } from "react";
import { getPracticeAssetForUser } from "@/services/practice-asset";
import type { PracticeResource } from "@/types/practice";

/**
 * Visor de partituras Guitar Pro. alphaTab se carga en el navegador al montar
 * el visor, no con el resto de la página.
 */
export function GuitarProViewer({
  resource,
  userId,
}: {
  resource: PracticeResource;
  userId?: string;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!container || !resource.assetId) return;
    const target = container;
    let isMounted = true;
    let destroyViewer = () => {};

    async function renderScore() {
      setError(null);
      setIsLoading(true);
      const asset = await getPracticeAssetForUser(
        resource.assetId!,
        userId,
      );
      if (!asset) throw new Error("No se encontró el archivo Guitar Pro.");
      if (!isMounted) return;

      const alphaTab = await import("@coderline/alphatab");
      if (!isMounted) return;
      const api = new alphaTab.AlphaTabApi(target, {
        core: {
          useWorkers: false,
          fontDirectory: "/alphatab/font/",
        },
        player: { enablePlayer: false },
      });
      destroyViewer = () => api.destroy();
      api.error.on((renderError) => {
        if (isMounted) setError(renderError.message);
      });
      api.load(new Uint8Array(await asset.blob.arrayBuffer()));
      if (isMounted) setIsLoading(false);
    }

    void renderScore().catch((renderError: unknown) => {
      if (!isMounted) return;
      setError(
        renderError instanceof Error ?
          renderError.message
        : "No se pudo visualizar el archivo Guitar Pro.",
      );
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      destroyViewer();
      target.replaceChildren();
    };
  }, [container, resource.assetId, userId]);

  return (
    <div className="min-h-64 overflow-auto bg-white p-4 text-zinc-900">
      {isLoading && <p className="text-sm text-muted">Cargando tablatura…</p>}
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div ref={setContainer} />
    </div>
  );
}
