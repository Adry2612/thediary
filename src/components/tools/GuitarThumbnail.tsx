"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { GuitarIcon } from "@/components/ui/icons";
import { getPracticeAssetForUser } from "@/services/practice-asset";

interface GuitarThumbnailProps {
  assetId?: string;
}

/**
 * Miniatura de la guitarra en una caja de tamaño fijo. El hueco se reserva
 * siempre, así una foto que tarda en cargar o que falta no mueve la fila.
 */
export function GuitarThumbnail({ assetId }: GuitarThumbnailProps) {
  const { user } = useAppData();
  const userId = user?.id;
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;
    setUrl(null);
    setFailed(false);
    if (!assetId) return;

    void getPracticeAssetForUser(assetId, userId)
      .then((asset) => {
        if (!isMounted) return;
        if (!asset) {
          setFailed(true);
          return;
        }
        objectUrl = URL.createObjectURL(asset.blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (isMounted) setFailed(true);
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId, userId]);

  return (
    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas">
      {url && !failed ? (
        // La foto es un blob local: `next/image` no aplica y no hay dominio fijo.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <GuitarIcon aria-hidden="true" className="size-6 text-muted/70" />
      )}
    </span>
  );
}
