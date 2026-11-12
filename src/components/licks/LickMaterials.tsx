"use client";

import { useState } from "react";
import { ResourcePreview } from "@/components/practice/ResourcePreview";
import { useAppData } from "@/components/providers/AppDataProvider";
import { RESOURCE_LABELS } from "@/utils/practice-resources";
import type { PracticeResource } from "@/types/practice";

/**
 * Material de estudio de un lick: una lista de recursos y su visor. Se usa en
 * la ficha y durante la práctica, sin el formulario de edición.
 */
export function LickMaterials({
  resources = [],
  emptyLabel,
  className = "",
}: {
  resources?: PracticeResource[];
  emptyLabel?: string;
  className?: string;
}) {
  const { user } = useAppData();
  const [selectedId, setSelectedId] = useState(resources[0]?.id);
  const active =
    resources.find((resource) => resource.id === selectedId) ?? resources[0];

  if (resources.length === 0) {
    if (!emptyLabel) return null;
    return (
      <p
        className={`rounded-lg border border-dashed border-line bg-canvas/60 px-4 py-6 text-sm text-muted ${className}`}
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)] ${className}`}>
      <nav
        aria-label="Material del lick"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:block md:space-y-2 md:overflow-visible md:px-0 md:pb-0"
      >
        {resources.map((resource) => (
          <button
            key={resource.id}
            type="button"
            onClick={() => setSelectedId(resource.id)}
            aria-current={resource.id === active?.id ? "true" : undefined}
            className={`block w-44 shrink-0 rounded-md border p-3 text-left transition md:w-full ${
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

      {active ? (
        <div className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-line">
            <ResourcePreview
              key={active.id}
              resource={active}
              userId={user?.id}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
