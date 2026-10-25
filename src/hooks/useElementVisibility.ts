"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Indica si un elemento sigue dentro del viewport.
 *
 * Empieza en `true` para no hacer parpadear a quien lo consume antes de que el
 * observador avise, y se queda en `true` si el navegador no trae
 * `IntersectionObserver`: el consumidor conserva entonces su comportamiento
 * anterior en vez de esconderse para siempre.
 */
export function useElementVisibility(
  ref: RefObject<Element | null>,
  rootMargin = "0px",
) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin, threshold: 0 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isVisible;
}
