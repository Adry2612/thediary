"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type RefCallback,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < viewportHeight &&
    rect.left < viewportWidth
  );
}

type ElementVisibility<T extends Element> = {
  /** Callback ref que vuelve a observar el nodo cuando cambia. */
  ref: RefCallback<T>;
  /** Nodo observado actualmente, si ya está montado. */
  element: T | null;
  /** Si el nodo actual está dentro del viewport. */
  isVisible: boolean;
  /** Si ya se midió el nodo actual (o cambió la clave de reinicio). */
  hasMeasured: boolean;
};

/**
 * Indica si un elemento sigue dentro del viewport.
 *
 * El nodo se sigue mediante un callback ref, no solo por la identidad del
 * `ref`: cuando el consumidor lo mueve a otro subárbol (por ejemplo al cambiar
 * a vista dividida), el observador se vuelve a enganchar al nodo nuevo. Antes
 * de observar se mide el rectángulo actual y se expone `hasMeasured`, para que
 * quien lo consuma no tome una decisión con datos de un nodo desmontado.
 *
 * `resetKey` fuerza una nueva medición sin cambiar de nodo, útil al volver a la
 * pantalla que lo contiene. Sin `IntersectionObserver`, se conserva el
 * comportamiento anterior: el elemento se considera visible.
 */
export function useElementVisibility<T extends Element = Element>(
  rootMargin = "0px",
  resetKey?: unknown,
): ElementVisibility<T> {
  const [element, setElement] = useState<T | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasMeasured, setHasMeasured] = useState(false);

  const ref = useCallback<RefCallback<T>>((node) => {
    setElement(node);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      setHasMeasured(false);
      return;
    }

    setIsVisible(isElementInViewport(element));
    setHasMeasured(true);

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin, threshold: 0 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [element, resetKey, rootMargin]);

  return { ref, element, isVisible, hasMeasured };
}
