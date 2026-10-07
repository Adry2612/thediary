"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { getPracticeAsset } from "@/lib/practice-library";
import { normalizeSongsterrUrl } from "@/lib/practice-templates";
import type { PracticePhase, PracticeResource } from "@/types/practice";

function GuitarProViewer({ resource }: { resource: PracticeResource }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!container || !resource.assetId) return;
    const target = container;
    let isMounted = true;
    let destroyViewer = () => {};

    async function renderScore() {
      const asset = await getPracticeAsset(resource.assetId!);
      if (!asset) throw new Error("No se encontró el archivo Guitar Pro local.");
      if (!isMounted) return;

      const alphaTab = await import("@coderline/alphatab");
      if (!isMounted) return;
      const api = new alphaTab.AlphaTabApi(target, {
        core: {
          useWorkers: false,
          fontDirectory: "/alphatab/font/",
        },
        player: { enablePlayer: false },
      });
      destroyViewer = () => api.destroy();
      api.error.on((renderError) => {
        if (isMounted) setError(renderError.message);
      });
      api.load(new Uint8Array(await asset.blob.arrayBuffer()));
      if (isMounted) setIsLoading(false);
    }

    void renderScore().catch((renderError: unknown) => {
      if (!isMounted) return;
      setError(
        renderError instanceof Error
          ? renderError.message
          : "No se pudo visualizar el archivo Guitar Pro.",
      );
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      destroyViewer();
      target.replaceChildren();
    };
  }, [container, resource.assetId]);

  return (
    <div className="min-h-64 overflow-auto bg-white p-4 text-zinc-900">
      {isLoading && (
        <p className="text-sm text-zinc-600">Cargando tablatura…</p>
      )}
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div ref={setContainer} />
    </div>
  );
}

function useAssetUrl(resource: PracticeResource | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;
    setUrl(null);
    setError(null);
    if (!resource?.assetId || resource.kind === "songsterr") return;

    void getPracticeAsset(resource.assetId)
      .then((asset) => {
        if (!asset) throw new Error("No se encontró el archivo en este dispositivo.");
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(asset.blob);
        setUrl(objectUrl);
      })
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo abrir el archivo.",
        );
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resource]);

  return { url, error };
}

function ResourcePreview({ resource }: { resource: PracticeResource }) {
  const { url, error } = useAssetUrl(resource);

  if (resource.kind === "songsterr") {
    const safeUrl = normalizeSongsterrUrl(resource.url ?? "");
    if (!safeUrl) {
      return <p className="p-6 text-sm text-muted">El enlace de Songsterr no es válido.</p>;
    }

    return (
      <div>
        <iframe
          src={safeUrl}
          title={resource.title}
          className="h-[32rem] w-full border-0 bg-white"
          loading="lazy"
          allow="fullscreen"
        />
        <a
          href={safeUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-muted underline underline-offset-4"
        >
          Abrir Songsterr en otra pestaña
        </a>
      </div>
    );
  }

  if (error) return <p className="p-6 text-sm text-red-300">{error}</p>;
  if (!url) return <p className="p-6 text-sm text-muted">Cargando archivo…</p>;
  if (resource.kind === "pdf") {
    return (
      <iframe
        src={url}
        title={resource.title}
        className="h-[36rem] w-full border-0 bg-white"
      />
    );
  }

  return <GuitarProViewer resource={resource} />;
}

export function PracticeMaterials({ phases }: { phases: PracticePhase[] }) {
  const resources = useMemo(
    () =>
      phases.flatMap((phase) =>
        (phase.resources ?? []).map((resource) => ({
          phaseName: phase.name,
          resource,
        })),
      ),
    [phases],
  );
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    resources[0]?.resource.id ?? null,
  );
  const activeResource =
    resources.find(({ resource }) => resource.id === selectedResourceId)
      ?.resource ?? resources[0]?.resource;

  useEffect(() => {
    if (!resources.some(({ resource }) => resource.id === selectedResourceId)) {
      setSelectedResourceId(resources[0]?.resource.id ?? null);
    }
  }, [resources, selectedResourceId]);

  if (resources.length === 0) return null;

  return (
    <Card>
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.05em] text-muted">
          Material de estudio
        </p>
        <h2 className="mt-2 font-serif text-2xl">Tablaturas y partituras</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="Materiales de práctica" className="space-y-2">
          {resources.map(({ phaseName, resource }) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => setSelectedResourceId(resource.id)}
              aria-current={resource.id === activeResource?.id ? "true" : undefined}
              className={`block w-full border p-3 text-left transition ${
                resource.id === activeResource?.id
                  ? "border-ink/40 bg-white/5"
                  : "border-line hover:bg-white/5"
              }`}
            >
              <span className="block truncate text-sm">{resource.title}</span>
              <span className="mt-1 block truncate text-xs text-muted">
                {phaseName}
              </span>
            </button>
          ))}
        </nav>
        {activeResource && (
          <div className="min-w-0">
            <p className="mb-3 text-xs text-muted">{activeResource.title}</p>
            <div className="overflow-hidden border border-line">
              <ResourcePreview
                key={activeResource.id}
                resource={activeResource}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
