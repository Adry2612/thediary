"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/Field";
import { PracticeResourceEditor } from "@/components/practice/PracticeResourceEditor";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useI18nSection } from "@/i18n/I18nProvider";
import { detectGuitarProKey } from "@/services/lick-key-detection";
import { createId } from "@/utils/create-id";
import { normalizeMusicalKey, MUSICAL_KEYS } from "@/utils/licks/keys";
import {
  formatClipTime,
  validateReferenceDraft,
} from "@/utils/licks/reference-video";
import {
  LICK_TECHNIQUES,
  normalizeTechniques,
} from "@/utils/licks/techniques";
import { MAX_BPM, MIN_BPM } from "@/utils/metronome-tempo";
import { getTechniqueName } from "@/utils/catalogs/techniques";
import { useDisplayPreferences } from "@/hooks/useDisplayPreferences";
import type { GuitarLick, TechniqueId } from "@/types/lick";
import type { PracticeResource, RepertoireItem } from "@/types/practice";

/**
 * Editor de un lick a pantalla completa: la ficha y el material de estudio
 * ocupan todo el ancho de la columna, sin el diálogo estrecho de antes.
 */
export function LickEditor({
  lick,
  songs,
  onSave,
  onSaveDraft,
  onCancel,
}: {
  lick: GuitarLick | null;
  songs: RepertoireItem[];
  onSave: (lick: GuitarLick) => void;
  /** Guarda sin salir del editor; el borrador sigue siendo un lick normal. */
  onSaveDraft: (lick: GuitarLick) => void;
  onCancel: () => void;
}) {
  const text = useI18nSection("licks");
  const { techniqueNameLanguage } = useDisplayPreferences();
  const { user } = useAppData();
  const [title, setTitle] = useState(lick?.title ?? "");
  const [resources, setResources] = useState<PracticeResource[]>(
    lick?.resources ?? [],
  );
  const [key, setKey] = useState(lick?.key ?? "");
  const [keySource, setKeySource] = useState<GuitarLick["keySource"]>(
    lick?.keySource,
  );
  const [isDetectingKey, setIsDetectingKey] = useState(false);
  const [detectKeyMessage, setDetectKeyMessage] = useState<string | null>(null);
  const detectingKeyRef = useRef(false);
  const guitarProResources = resources.filter(
    (resource) => resource.kind === "guitarpro" && resource.assetId,
  );
  const [techniques, setTechniques] = useState<TechniqueId[]>(
    lick?.techniques ?? [],
  );
  const [associatedSongId, setAssociatedSongId] = useState(
    lick?.associatedSongId ?? "",
  );
  const [targetBpm, setTargetBpm] = useState(
    lick?.targetBpm !== undefined ? String(lick.targetBpm) : "",
  );
  const [videoUrl, setVideoUrl] = useState(lick?.referenceVideo?.url ?? "");
  const [videoStart, setVideoStart] = useState(
    lick?.referenceVideo
      ? formatClipTime(lick.referenceVideo.startSeconds)
      : "",
  );
  const [videoEnd, setVideoEnd] = useState(
    lick?.referenceVideo
      ? formatClipTime(lick.referenceVideo.endSeconds)
      : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<GuitarLick | null>(lick);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setSaveState("idle");
  }, [
    title,
    resources,
    key,
    techniques,
    associatedSongId,
    targetBpm,
    videoUrl,
    videoStart,
    videoEnd,
  ]);

  function toggleTechnique(id: TechniqueId) {
    setTechniques((current) =>
      current.includes(id)
        ? current.filter((technique) => technique !== id)
        : [...current, id],
    );
  }

  async function detectKey(resource?: PracticeResource) {
    const candidates = resource ? [resource] : guitarProResources;
    if (candidates.length === 0 || detectingKeyRef.current) return;

    detectingKeyRef.current = true;
    setIsDetectingKey(true);
    setDetectKeyMessage(null);
    let hadError = false;
    try {
      for (const candidate of candidates) {
        if (!candidate.assetId) continue;
        try {
          const detected = await detectGuitarProKey(
            candidate.assetId,
            user?.id,
          );
          if (!detected) continue;
          setKey(detected);
          setKeySource("auto");
          setDetectKeyMessage(text.detectKeySuccess);
          return;
        } catch {
          hadError = true;
        }
      }
      setDetectKeyMessage(
        hadError ? text.detectKeyError : text.detectKeyNotFound,
      );
    } finally {
      detectingKeyRef.current = false;
      setIsDetectingKey(false);
    }
  }

  function handleResourceAdded(resource: PracticeResource) {
    if (resource.kind !== "guitarpro" || !resource.assetId) return;
    if (key.trim()) return;
    void detectKey(resource);
  }

  function buildLick({ strict }: { strict: boolean }): GuitarLick | null {
    const trimmedTitle = title.trim();
    if (!trimmedTitle && strict) {
      setError(text.errorTitle);
      return null;
    }

    let parsedTarget: number | undefined;
    if (targetBpm.trim()) {
      const value = Number(targetBpm);
      if (Number.isInteger(value) && value >= MIN_BPM && value <= MAX_BPM) {
        parsedTarget = value;
      } else if (strict) {
        setError(text.errorBpm);
        return null;
      }
    }
    if (!strict && parsedTarget === undefined) {
      parsedTarget = draft?.targetBpm;
    }

    const reference = validateReferenceDraft({
      url: videoUrl,
      start: videoStart,
      end: videoEnd,
    });
    if ("error" in reference) {
      setError(
        reference.error === "invalidUrl"
          ? text.errorReferenceUrl
          : reference.error === "invalidStart"
            ? text.errorReferenceStart
            : text.errorReferenceEnd,
      );
      return null;
    }

    const now = new Date().toISOString();
    const normalizedKey = normalizeMusicalKey(key);
    return {
      id: draft?.id ?? createId(),
      title: trimmedTitle || text.untitled,
      ...(resources.length > 0 ? { resources } : {}),
      ...(normalizedKey ? { key: normalizedKey } : {}),
      ...(normalizedKey && keySource ? { keySource } : {}),
      ...(reference.value ? { referenceVideo: reference.value } : {}),
      techniques: normalizeTechniques(techniques),
      ...(associatedSongId ? { associatedSongId } : {}),
      ...(parsedTarget !== undefined ? { targetBpm: parsedTarget } : {}),
      ...(draft?.currentBpm !== undefined
        ? { currentBpm: draft.currentBpm }
        : {}),
      bpmHistory: draft?.bpmHistory ?? [],
      createdAt: draft?.createdAt ?? now,
      ...(draft?.lastPracticedAt
        ? { lastPracticedAt: draft.lastPracticedAt }
        : {}),
      practiceCount: draft?.practiceCount ?? 0,
    };
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = buildLick({ strict: true });
    if (!next) return;
    setError(null);
    onSave(next);
  }

  function saveDraft() {
    const next = buildLick({ strict: false });
    if (!next) return;
    setError(null);
    setDraft(next);
    onSaveDraft(next);
    setSaveState("saved");
  }

  return (
    <PageShell>
      <BackLink href={lick ? `/licks/${lick.id}` : "/licks"}>
        {text.back}
      </BackLink>

      <PageHeader
        className="mt-6"
        title={lick ? text.editTitle : text.createTitle}
        description={text.editorDescription}
        actions={
          <ButtonLink
            href={lick ? `/licks/${lick.id}` : "/licks"}
            variant="ghost"
          >
            {text.cancel}
          </ButtonLink>
        }
      />

      <form onSubmit={submit} className="enter mt-2 space-y-6">
        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <label className="block text-xs text-muted">
            {text.titleLabel}
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder={text.titlePlaceholder}
              className="mt-1"
            />
          </label>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
            {saveState === "saved" ? (
              <span
                role="status"
                aria-live="polite"
                className="text-xs text-accent-green-fg"
              >
                {text.draftSaved}
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="field"
              onClick={saveDraft}
              disabled={isDetectingKey}
            >
              {text.saveDraft}
            </Button>
          </div>
          <PracticeResourceEditor
            phaseId="lick"
            resources={resources}
            title={text.materialsLabel}
            description={text.materialsHint}
            removeLabel={text.removeMaterial}
            onChange={(_, changes) =>
              setResources(changes.resources ?? [])
            }
            onResourceAdded={handleResourceAdded}
          />
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
            {text.referenceVideoTitle}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-xs text-muted sm:col-span-2">
              {text.referenceVideoUrl}
              <TextField
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                inputMode="url"
                className="mt-1"
              />
            </label>
            <label className="block text-xs text-muted">
              {text.referenceVideoStart}
              <TextField
                value={videoStart}
                onChange={(event) => setVideoStart(event.target.value)}
                placeholder="0:00"
                inputMode="numeric"
                className="mt-1"
              />
            </label>
            <label className="block text-xs text-muted">
              {text.referenceVideoEnd}
              <TextField
                value={videoEnd}
                onChange={(event) => setVideoEnd(event.target.value)}
                placeholder="0:15"
                inputMode="numeric"
                className="mt-1"
              />
            </label>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {text.referenceVideoHint}
          </p>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
            {text.detailsLabel}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="block text-xs text-muted">
              {text.keyLabel}
              <SelectField
                className="mt-1"
                value={key}
                ariaLabel={text.keyLabel}
                onChange={(next) => {
                  setKey(next);
                  setKeySource(next ? "manual" : undefined);
                  setDetectKeyMessage(null);
                }}
                options={[
                  { value: "", label: text.keyNone },
                  ...MUSICAL_KEYS.map((option) => ({
                    value: option,
                    label: option,
                  })),
                ]}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="field"
                  onClick={() => void detectKey()}
                  disabled={guitarProResources.length === 0 || isDetectingKey}
                >
                  {isDetectingKey ? text.detectingKey : text.detectKey}
                </Button>
                {keySource === "auto" ? (
                  <span className="rounded-md border border-amber-300/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-200">
                    {text.keyAutoBadge}
                  </span>
                ) : null}
              </div>
              {keySource === "auto" ? (
                <p className="mt-1 text-[11px] text-amber-200/90">
                  {text.keyAutoHint}
                </p>
              ) : null}
              {guitarProResources.length === 0 ? (
                <p className="mt-1 text-[11px] text-muted">
                  {text.detectKeyNoGuitarPro}
                </p>
              ) : null}
              {detectKeyMessage ? (
                <p
                  role="status"
                  className="mt-1 text-[11px] text-muted"
                >
                  {detectKeyMessage}
                </p>
              ) : null}
            </div>

            <div className="block text-xs text-muted">
              {text.songLabel}
              <SelectField
                className="mt-1"
                value={associatedSongId}
                ariaLabel={text.songLabel}
                onChange={setAssociatedSongId}
                options={[
                  { value: "", label: text.songNone },
                  ...songs.map((song) => ({
                    value: song.id,
                    label: song.title,
                  })),
                ]}
              />
              <span className="mt-1 block text-[11px] text-muted">
                {text.songHint}
              </span>
            </div>

            <label className="block text-xs text-muted">
              {text.targetBpmLabel}
              <TextField
                type="number"
                min={MIN_BPM}
                max={MAX_BPM}
                step={1}
                inputMode="numeric"
                value={targetBpm}
                onChange={(event) => setTargetBpm(event.target.value)}
                className="mt-1"
              />
              <span className="mt-1 block text-[11px] text-muted">
                {text.targetBpmHint}
              </span>
            </label>

            <fieldset className="sm:col-span-2">
              <legend className="text-xs text-muted">
                {text.techniquesLabel}
              </legend>
              <p className="mt-1 text-[11px] text-muted">
                {text.techniquesHint}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {LICK_TECHNIQUES.map((technique) => {
                  const selected = techniques.includes(technique.id);
                  return (
                    <button
                      key={technique.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleTechnique(technique.id)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 ${
                        selected
                          ? "border-accent-green-fg/60 bg-accent-green-bg text-accent-green-fg"
                          : "border-line text-muted hover:border-white/20 hover:text-ink"
                      }`}
                    >
                      <span aria-hidden="true" className="font-mono text-[10px]">
                        {technique.glyph}
                      </span>
                      {getTechniqueName(technique.id, techniqueNameLanguage)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </section>

        {error ? (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-5">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {text.cancel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isDetectingKey}
          >
            {text.save}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
