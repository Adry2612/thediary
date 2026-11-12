"use client";

import { useState } from "react";
import { ResourcePreview } from "@/components/practice/ResourcePreview";
import { useAppData } from "@/components/providers/AppDataProvider";
import { RESOURCE_LABELS } from "@/utils/practice-resources";
import type { PracticeResource } from "@/types/practice";

type LickMaterialsLayout = "sidebar" | "stacked";
type LickMaterialsPart = "all" | "selector" | "preview";

/**
 * Material de estudio de un lick: una lista de recursos y su visor. Se usa en
 * la ficha y durante la práctica, sin el formulario de edición. La ficha puede
 * separar el selector y el visor para alinear el vídeo con el material.
 */
export function LickMaterials({
  resources = [],
  emptyLabel,
  className = "",
  layout = "sidebar",
  part = "all",
  selectedId,
  onSelect,
}: {
  resources?: PracticeResource[];
  emptyLabel?: string;
  className?: string;
  /** `stacked` pone el selector encima del visor para columnas estrechas. */
  layout?: LickMaterialsLayout;
  /** `selector` o `preview` permiten separar las dos piezas en la ficha. */
  part?: LickMaterialsPart;
  /** Selección controlada; sin ella el componente mantiene su propio estado. */
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const { user } = useAppData();
  const [internalSelectedId, setInternalSelectedId] = useState(
    resources[0]?.id,
  );
  const currentId = selectedId ?? internalSelectedId;
  const active =
    resources.find((resource) => resource.id === currentId) ?? resources[0];
  const isStacked = layout === "stacked";

  function select(resourceId: string) {
    setInternalSelectedId(resourceId);
    onSelect?.(resourceId);
  }

  if (resources.length === 0) {
    if (part !== "all" || !emptyLabel) return null;
    return (
      <p
        className={`rounded-lg border border-dashed border-line bg-canvas/60 px-4 py-6 text-sm text-muted ${className}`}
      >
        {emptyLabel}
      </p>
    );
  }

  const selector = (
    <nav
      aria-label="Material del lick"
      className={
        isStacked
          ? "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          : "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:block md:space-y-2 md:overflow-visible md:px-0 md:pb-0"
      }
    >
      {resources.map((resource) => (
        <button
          key={resource.id}
          type="button"
          onClick={() => select(resource.id)}
          aria-current={resource.id === active?.id ? "true" : undefined}
          className={`block w-44 shrink-0 rounded-md border p-3 text-left transition ${
            isStacked ? "" : "md:w-full"
          } ${
            resource.id === active?.id
              ? "border-ink/40 bg-white/5"
              : "border-line hover:bg-white/5"
          }`}
        >
          <span className="block truncate text-sm">{resource.title}</span>
          <span className="mt-1 block truncate text-xs text-muted">
            {RESOURCE_LABELS[resource.kind]}
          </span>
        </button>
      ))}
    </nav>
  );

  const preview = active ? (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-lg border border-line">
        <ResourcePreview
          key={active.id}
          resource={active}
          userId={user?.id}
        />
      </div>
    </div>
  ) : null;

  if (part === "selector") {
    return <div className={className}>{selector}</div>;
  }

  if (part === "preview") {
    return <div className={className}>{preview}</div>;
  }

  return (
    <div
      className={`${
        isStacked
          ? "flex flex-col gap-4"
          : "grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)]"
      } ${className}`}
    >
      {selector}
      {preview}
    </div>
  );
}
