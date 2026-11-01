"use client";

import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  TabScoreCanvas,
  type TabScoreLayout,
  type TabScoreRenderStatus,
} from "@/components/tab-score/TabScoreCanvas";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useTabScoreEditor } from "@/hooks/useTabScoreEditor";
import type { TabScore } from "@/types/tab-score";
import { announceSelection } from "@/utils/tab-score/announce";
import { scoreToText } from "@/utils/tab-score/text";
import { buildAlphaTex } from "@/utils/tab-score/alphatex";
import { getStringCount } from "@/utils/tab-score/model";
import type {
  TabMoveDirection,
  TabPosition,
} from "@/utils/tab-score/selection";

const ARROW_DIRECTIONS: Record<string, TabMoveDirection> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export function TabScoreEditor({
  initialScore,
  label,
  onChange,
  onLayout,
  className = "",
}: {
  initialScore: TabScore;
  label?: string;
  onChange?: (score: TabScore) => void;
  onLayout?: (layout: TabScoreLayout) => void;
  className?: string;
}) {
  const text = useI18nSection("tabScore");
  const [status, setStatus] = useState<TabScoreRenderStatus>({
    loading: true,
    error: null,
  });
  const editor = useTabScoreEditor({ initialScore, onChange });
  const containerRef = useRef<HTMLDivElement>(null);
  const stringCount = useMemo(
    () => getStringCount(editor.score.tuning),
    [editor.score.tuning],
  );
  const alphaTex = useMemo(
    () => buildAlphaTex(editor.score, { standardNotation: false }),
    [editor.score],
  );
  const textAlternative = useMemo(
    () => scoreToText(editor.score),
    [editor.score],
  );

  function select(position: TabPosition, extend: boolean) {
    editor.dispatch({ type: "select", position, extend });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const { key, shiftKey } = event;

    if (event.metaKey || event.ctrlKey) {
      const command = key.toLowerCase();
      if (command === "z") {
        event.preventDefault();
        editor.dispatch({ type: shiftKey ? "redo" : "undo" });
        return;
      }
      if (command === "y") {
        event.preventDefault();
        editor.dispatch({ type: "redo" });
        return;
      }
      if (command === "c") {
        event.preventDefault();
        editor.dispatch({ type: "copyBeats" });
        return;
      }
      if (command === "x") {
        event.preventDefault();
        editor.dispatch({ type: "cutBeats" });
        return;
      }
      if (command === "v") {
        event.preventDefault();
        editor.dispatch({ type: "paste" });
        return;
      }
      return;
    }

    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      editor.dispatch({ type: "digit", digit: key });
      return;
    }

    const direction = ARROW_DIRECTIONS[key];
    if (direction) {
      event.preventDefault();
      editor.dispatch({ type: "move", direction, extend: shiftKey });
      return;
    }

    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      editor.dispatch({ type: "deleteNote" });
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      editor.dispatch({ type: "commitBuffer" });
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      editor.dispatch({ type: "clearSelection" });
    }
  }

  const selection = editor.selectionVisible ? editor.selection : undefined;
  const announcement = announceSelection({
    score: editor.score,
    selection: selection ?? null,
    stringCount,
    labels: text,
  });

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={() => containerRef.current?.focus()}
      className={`rounded-xl border border-line bg-white text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${className}`}
    >
      <div className="border-b border-zinc-200 px-3 py-2 text-xs text-zinc-600">
        <span data-testid="tab-score-selection">{announcement}</span>
        {status.error && (
          <span role="alert" className="ml-3 text-red-700">
            {text.error}
          </span>
        )}
      </div>

      <p
        aria-live="polite"
        aria-atomic="true"
        data-testid="tab-score-announcement"
        className="sr-only"
      >
        {announcement}
      </p>

      <pre data-testid="tab-score-text" className="sr-only">
        {textAlternative}
      </pre>

      <TabScoreCanvas
        alphaTex={alphaTex}
        stringCount={stringCount}
        label={label}
        interactive
        selection={selection}
        selectedBeats={selection ? editor.selectedBeats : []}
        onSelect={select}
        onStatus={setStatus}
        onLayout={onLayout}
        className="p-3 sm:p-4"
      />
    </div>
  );
}
