"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getHeaderHidden } from "@/utils/header-visibility";

const MOBILE_QUERY = "(max-width: 767px)";

interface UseHeaderAutoHideOptions {
  /** Menú móvil o tutorial abiertos: el header no debe desaparecer. */
  disabled?: boolean;
}

/**
 * Esconde el header al bajar y lo devuelve al subir. Solo actúa en móvil; en
 * escritorio (o mientras `disabled` está activo) permanece visible.
 */
export function useHeaderAutoHide({
  disabled = false,
}: UseHeaderAutoHideOptions = {}) {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const isHiddenRef = useRef(false);
  const disabledRef = useRef(disabled);
  const lastYRef = useRef(0);
  const downDistanceRef = useRef(0);
  const upDistanceRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const reveal = useCallback(() => {
    isHiddenRef.current = false;
    setIsHidden(false);
    downDistanceRef.current = 0;
    upDistanceRef.current = 0;
  }, []);

  useEffect(() => {
    disabledRef.current = disabled;
    if (disabled) reveal();
  }, [disabled, reveal]);

  useEffect(() => {
    reveal();
    lastYRef.current = window.scrollY;
  }, [pathname, reveal]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    let isMobile = media.matches;

    const handleMediaChange = () => {
      isMobile = media.matches;
      lastYRef.current = window.scrollY;
      if (!isMobile) reveal();
    };

    const handleScroll = () => {
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const scrollY = window.scrollY;

        if (!isMobile || disabledRef.current) {
          lastYRef.current = scrollY;
          downDistanceRef.current = 0;
          upDistanceRef.current = 0;
          if (isHiddenRef.current) reveal();
          return;
        }

        const delta = scrollY - lastYRef.current;
        if (delta > 0) {
          downDistanceRef.current += delta;
          upDistanceRef.current = 0;
        } else if (delta < 0) {
          upDistanceRef.current += -delta;
          downDistanceRef.current = 0;
        }
        lastYRef.current = scrollY;

        const nextHidden = getHeaderHidden({
          scrollY,
          downDistance: downDistanceRef.current,
          upDistance: upDistanceRef.current,
          isHidden: isHiddenRef.current,
        });

        if (nextHidden !== isHiddenRef.current) {
          isHiddenRef.current = nextHidden;
          setIsHidden(nextHidden);
          downDistanceRef.current = 0;
          upDistanceRef.current = 0;
        }
      });
    };

    lastYRef.current = window.scrollY;
    media.addEventListener("change", handleMediaChange);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      media.removeEventListener("change", handleMediaChange);
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [reveal]);

  return { isHidden, reveal };
}
