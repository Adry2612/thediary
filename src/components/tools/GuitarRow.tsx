"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GuitarThumbnail } from "@/components/tools/GuitarThumbnail";
import { StringSetThumb } from "@/components/tools/StringSetThumb";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { Guitar } from "@/types/equipment";
import type {
  GuitarMaintenance,
  GuitarMaintenanceState,
} from "@/utils/equipment";

const STATE_TONE: Record<GuitarMaintenanceState, string> = {
  due: "text-red-300",
  soon: "text-amber-300",
  ok: "text-muted",
  "no-history": "text-muted",
  "no-interval": "text-muted",
};

interface GuitarRowProps {
  guitar: Guitar;
  maintenance: GuitarMaintenance;
  onChangeStrings: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onDelete: () => void;
}

/**
 * Una fila por guitarra: foto, estado en palabras y una sola acción principal.
 * Las acciones secundarias viven en el menú para que ninguna compita con
 * "Cambié las cuerdas".
 */
export function GuitarRow({
  guitar,
  maintenance,
  onChangeStrings,
  onEdit,
  onHistory,
  onDelete,
}: GuitarRowProps) {
  const text = useI18nSection("equipment");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function closeOnOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  const stateLabel =
    maintenance.state === "due" ? text.stateDue
    : maintenance.state === "soon" ? text.stateSoon
    : maintenance.state === "ok" ? text.stateOk
    : maintenance.state === "no-history" ? text.stateNoHistory
    : text.stateNoInterval;
  const limitLabel =
    maintenance.limit === "days" ? text.limitDays
    : maintenance.limit === "hours" ? text.limitHours
    : maintenance.limit === "both" ? text.limitBoth
    : null;
  const hasChange = Boolean(maintenance.latestChange);
  const metrics: string[] = [];
  if (hasChange) {
    metrics.push(
      guitar.intervalDays
        ? `${maintenance.daysSinceChange ?? 0} / ${guitar.intervalDays} ${text.daysShort}`
        : `${maintenance.daysSinceChange ?? 0} ${text.daysShort}`,
    );
    metrics.push(
      guitar.intervalHours
        ? `${maintenance.hoursSinceChange} / ${guitar.intervalHours} ${text.hoursShort}`
        : `${maintenance.hoursSinceChange} ${text.hoursShort}`,
    );
  }

  function runAction(action: () => void) {
    setIsMenuOpen(false);
    action();
  }

  return (
    <article className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line py-4 last:border-b-0">
      <GuitarThumbnail assetId={guitar.photoAssetId} />

      {maintenance.latestChange?.stringSet?.image && (
        <StringSetThumb
          image={maintenance.latestChange.stringSet.image}
          size="sm"
        />
      )}

      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-medium text-ink">{guitar.name}</p>
        <p className={`mt-0.5 text-xs ${STATE_TONE[maintenance.state]}`}>
          {stateLabel}
          {limitLabel ? ` · ${limitLabel}` : ""}
          {maintenance.latestChange && maintenance.missingSessions > 0 && (
            <span className="text-muted">
              {" · "}
              {maintenance.missingSessions} {text.missingSessions}
            </span>
          )}
        </p>
      </div>

      {metrics.length > 0 && (
        <p className="font-mono text-xs tabular-nums text-muted">
          {metrics.join(" · ")}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={maintenance.state === "due" ? "primary" : "ghost"}
          onClick={onChangeStrings}
        >
          {hasChange ? text.addStringChange : text.firstChange}
        </Button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label={text.menu}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex size-12 items-center justify-center rounded-md border border-line text-lg leading-none text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <span aria-hidden="true">⋯</span>
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              aria-label={text.menu}
              className="absolute right-0 bottom-full z-20 mb-1 w-40 border border-line bg-surface py-1 shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onHistory)}
                className="block w-full px-3 py-2 text-left text-sm text-ink transition hover:bg-white/5"
              >
                {text.history}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onEdit)}
                className="block w-full px-3 py-2 text-left text-sm text-ink transition hover:bg-white/5"
              >
                {text.editGuitar}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onDelete)}
                className="block w-full px-3 py-2 text-left text-sm text-red-300 transition hover:bg-white/5"
              >
                {text.deleteGuitar}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
