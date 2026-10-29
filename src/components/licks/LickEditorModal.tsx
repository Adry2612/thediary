"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/Field";
import { LickTab } from "@/components/licks/LickTab";
import { TabEditor } from "@/components/repertoire/TabEditor";
import { EditIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useDialogMotion } from "@/hooks/useDialogMotion";
import { useDeferredClose } from "@/hooks/useDeferredClose";
import { createId } from "@/utils/create-id";
import { normalizeMusicalKey, MUSICAL_KEYS } from "@/utils/licks/keys";
import { detectTabKey } from "@/utils/licks/key-detection";
import {
  LICK_TECHNIQUES,
  normalizeTechniques,
} from "@/utils/licks/techniques";
import { MAX_BPM, MIN_BPM } from "@/utils/metronome-tempo";
import { normalizeTab } from "@/utils/repertoire-tab";
import type { GuitarLick, TechniqueId } from "@/types/lick";
import type { RepertoireItem, RepertoireTab } from "@/types/practice";

export function LickEditorModal({
  lick,
  songs,
  onSave,
  onClose,
}: {
  lick: GuitarLick | null;
  songs: RepertoireItem[];
  onSave: (lick: GuitarLick) => void;
  onClose: () => void;
}) {
  const text = useI18nSection("licks");
  const { dialogRef, isClosing: isMotionClosing } = useDialogMotion(true);
  const { isClosing, requestClose } = useDeferredClose(onClose);
  const [title, setTitle] = useState(lick?.title ?? "");
  const hasLegacyTab = Boolean(lick && !lick.tab && lick.tabContent?.trim());
  const [tab, setTab] = useState<RepertoireTab>(() => normalizeTab(lick?.tab));
  const [useVisualTab, setUseVisualTab] = useState(!hasLegacyTab);
  const detectedKey = useMemo(() => detectTabKey(tab), [tab]);
  const [key, setKey] = useState(lick?.key ?? "");
  const [keyIsAuto, setKeyIsAuto] = useState(!lick?.key);
  const [techniques, setTechniques] = useState<TechniqueId[]>(
    lick?.techniques ?? [],
  );
  const [associatedSongId, setAssociatedSongId] = useState(
    lick?.associatedSongId ?? "",
  );
  const [targetBpm, setTargetBpm] = useState(
    lick?.targetBpm !== undefined ? String(lick.targetBpm) : "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!keyIsAuto) return;
    setKey(detectedKey ?? "");
  }, [detectedKey, keyIsAuto]);

  function toggleTechnique(id: TechniqueId) {
    setTechniques((current) =>
      current.includes(id)
        ? current.filter((technique) => technique !== id)
        : [...current, id],
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError(text.errorTitle);
      return;
    }

    let parsedTarget: number | undefined;
    if (targetBpm.trim()) {
      const value = Number(targetBpm);
      if (
        !Number.isInteger(value) ||
        value < MIN_BPM ||
        value > MAX_BPM
      ) {
        setError(text.errorBpm);
        return;
      }
      parsedTarget = value;
    }

    const now = new Date().toISOString();
    const normalizedKey = normalizeMusicalKey(key);
    onSave({
      id: lick?.id ?? createId(),
      title: trimmedTitle,
      ...(useVisualTab ? { tab: normalizeTab(tab) } : {}),
      ...(!useVisualTab && lick?.tabContent
        ? { tabContent: lick.tabContent }
        : {}),
      ...(normalizedKey ? { key: normalizedKey } : {}),
      techniques: normalizeTechniques(techniques),
      ...(associatedSongId ? { associatedSongId } : {}),
      ...(parsedTarget !== undefined ? { targetBpm: parsedTarget } : {}),
      ...(lick?.currentBpm !== undefined
        ? { currentBpm: lick.currentBpm }
        : {}),
      bpmHistory: lick?.bpmHistory ?? [],
      createdAt: lick?.createdAt ?? now,
      ...(lick?.lastPracticedAt
        ? { lastPracticedAt: lick.lastPracticedAt }
        : {}),
      practiceCount: lick?.practiceCount ?? 0,
    });
    requestClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="lick-editor-title"
      data-closing={isClosing || isMotionClosing ? "true" : undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose();
      }}
      className="overlay-motion fixed inset-0 m-auto max-h-[calc(100dvh-1rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-[min(100%-2.5rem,46rem)] overflow-y-auto overscroll-contain border border-line bg-surface p-0 text-ink backdrop:bg-black/70 sm:max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:w-[min(100%-1rem,46rem)]"
    >
      <form onSubmit={submit} className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="lick-editor-title"
              className="font-sans text-xl font-semibold tracking-tight text-ink"
            >
              {lick ? text.editTitle : text.createTitle}
            </h2>
            <p className="mt-2 max-w-prose text-sm text-muted">
              {text.editorDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={() => requestClose()}
            aria-label={text.close}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs text-muted sm:col-span-2">
            {text.titleLabel}
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder={text.titlePlaceholder}
              className="mt-1"
              autoFocus
            />
          </label>

          <div className="sm:col-span-2">
            {useVisualTab ? (
              <>
                <div
                  role="note"
                  className="mb-3 flex items-start gap-3 rounded-lg border border-accent-green-fg/30 bg-accent-green-bg/25 p-3 sm:p-4"
                >
                  <EditIcon className="mt-0.5 size-4 shrink-0 text-accent-green-fg" />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-green-fg">
                      {text.quickTabEyebrow}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {text.quickTabNotice}
                    </p>
                  </div>
                </div>
                {hasLegacyTab ? (
                  <p className="mb-2 text-[11px] text-muted">
                    {text.tabConvertHint}
                  </p>
                ) : null}
                <TabEditor
                  value={tab}
                  onChange={setTab}
                  defaultOpen
                  bpm={Number(targetBpm) || undefined}
                />
              </>
            ) : (
              <div>
                <p className="text-xs text-muted">{text.tabLabel}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {text.tabLegacyNotice}
                </p>
                <LickTab
                  content={lick?.tabContent}
                  emptyLabel={text.tabEmpty}
                  ariaLabel={text.tabTitle}
                  maxLines={10}
                  className="mt-2"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="field"
                  className="mt-3"
                  onClick={() => setUseVisualTab(true)}
                >
                  {text.tabConvert}
                </Button>
              </div>
            )}
          </div>

          <div className="block text-xs text-muted">
            {text.keyLabel}
            <SelectField
              className="mt-1"
              value={key}
              ariaLabel={text.keyLabel}
              onChange={(next) => {
                setKey(next);
                setKeyIsAuto(false);
              }}
              options={[
                { value: "", label: text.keyNone },
                ...MUSICAL_KEYS.map((option) => ({
                  value: option,
                  label: option,
                })),
              ]}
            />
            {detectedKey ? (
              <span
                aria-live="polite"
                className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted"
              >
                {text.keyDetected}:{" "}
                <span className="font-mono text-ink">{detectedKey}</span>
                {detectedKey !== key ? (
                  <button
                    type="button"
                    onClick={() => {
                      setKey(detectedKey);
                      setKeyIsAuto(true);
                    }}
                    className="underline underline-offset-2 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
                  >
                    {text.keyUseDetected}
                  </button>
                ) : null}
              </span>
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
                    {text[technique.labelKey] ?? technique.id}
                  </button>
                );
              })}
            </div>
          </fieldset>

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
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-line pt-5">
          <Button type="button" variant="ghost" onClick={() => requestClose()}>
            {text.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {text.save}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
