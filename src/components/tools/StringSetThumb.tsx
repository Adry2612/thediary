"use client";

import { useEffect, useState } from "react";

type StringSetThumbSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<StringSetThumbSize, string> = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
};

interface StringSetThumbProps {
  image?: string;
  size?: StringSetThumbSize;
}

/**
 * Miniatura de un juego. Solo se pinta cuando hay una foto; sin ella no deja
 * hueco ni marcador, porque el texto de al lado ya identifica el juego.
 */
export function StringSetThumb({ image, size = "md" }: StringSetThumbProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [image]);

  if (!image || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${SIZE_CLASSES[size]} shrink-0 border border-line object-cover`}
    />
  );
}
