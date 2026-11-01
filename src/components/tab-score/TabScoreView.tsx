"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  ALPHA_TAB_FONT_DIRECTORY,
  ALPHA_TAB_WORKER_URL,
  configureAlphaTabEnvironment,
} from "@/services/alpha-tab-environment";
import {
  readShowStandardNotation,
  saveShowStandardNotation,
} from "@/services/tab-score-preferences";
import type { TabScore } from "@/types/tab-score";
import { buildAlphaTex } from "@/utils/tab-score/alphatex";
import { scoreToText } from "@/utils/tab-score/text";

type AlphaTabApi = import("@coderline/alphatab").AlphaTabApi;

export function TabScoreView({
  score,
  showNotationToggle = false,
  className = "",
}: {
  score: TabScore;
  showNotationToggle?: boolean;
  className?: string;
}) {
  const text = useI18nSection("tabScore");
  const [showStandardNotation, setShowStandardNotation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowStandardNotation(readShowStandardNotation());
  }, []);

  const textAlternative = useMemo(() => scoreToText(score), [score]);
  const alphaTex = useMemo(
    () => buildAlphaTex(score, { standardNotation: showStandardNotation }),
    [score, showStandardNotation],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let api: AlphaTabApi | null = null;
    setIsLoading(true);
    setError(null);
    host.replaceChildren();

    void (async () => {
      try {
        const alphaTab = await import("@coderline/alphatab");
        if (disposed) return;
        configureAlphaTabEnvironment(alphaTab);
        api = new alphaTab.AlphaTabApi(host, {
          core: {
            useWorkers: false,
            fontDirectory: ALPHA_TAB_FONT_DIRECTORY,
            scriptFile: ALPHA_TAB_WORKER_URL,
          },
          display: {
            // Sin justificar, la última línea se queda a media anchura.
            justifyLastSystem: true,
          },
          player: { enablePlayer: false },
        });
        api.error.on((renderError) => {
          if (disposed) return;
          setError(renderError.message);
          setIsLoading(false);
        });
        api.renderFinished.on(() => {
          if (!disposed) setIsLoading(false);
        });
        api.tex(alphaTex);
      } catch (renderError) {
        if (disposed) return;
        setError(
          renderError instanceof Error
            ? renderError.message
            : "No se pudo dibujar la tablatura.",
        );
        setIsLoading(false);
      }
    })();

    return () => {
      disposed = true;
      api?.destroy();
      host.replaceChildren();
    };
  }, [alphaTex]);

  function toggleStandardNotation() {
    setShowStandardNotation((current) => {
      const next = !current;
      saveShowStandardNotation(next);
      return next;
    });
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-white p-3 text-zinc-900 sm:p-4 ${className}`}
    >
      {showNotationToggle && (
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleStandardNotation}
            aria-pressed={showStandardNotation}
            className={`text-xs ${
              showStandardNotation
                ? "border-zinc-800 bg-zinc-800 text-white hover:bg-zinc-700"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {text.standardNotation}
          </Button>
        </div>
      )}

      <div
        ref={hostRef}
        className="w-full overflow-hidden"
        aria-hidden={isLoading || error !== null}
      />

      {isLoading && (
        <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-700">
          {textAlternative}
        </pre>
      )}

      {error && (
        <div className="mt-2">
          <p role="alert" className="text-sm text-red-700">
            {text.error}
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-700">
            {textAlternative}
          </pre>
        </div>
      )}

      {!isLoading && !error && <pre className="sr-only">{textAlternative}</pre>}
    </div>
  );
}
