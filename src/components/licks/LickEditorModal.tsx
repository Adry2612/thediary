"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextArea, TextField } from "@/components/ui/Field";
import { useI18nSection } from "@/i18n/I18nProvider";
import { createId } from "@/lib/create-id";
import { normalizeMusicalKey, MUSICAL_KEYS } from "@/lib/licks/keys";
import {
  LICK_TECHNIQUES,
  normalizeTechniques,
} from "@/lib/licks/techniques";
import { MAX_BPM, MIN_BPM } from "@/lib/metronome-tempo";
import type { GuitarLick, TechniqueId } from "@/types/lick";
import type { RepertoireItem } from "@/types/practice";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(lick?.title ?? "");
  const [tabContent, setTabContent] = useState(lick?.tabContent ?? "");
  const [key, setKey] = useState(lick?.key ?? "");
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
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
      tabContent,
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
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="lick-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-1rem)] w-[min(100%-1rem,46rem)] overflow-y-auto overscroll-contain border border-line bg-surface p-0 text-ink backdrop:bg-black/70 sm:max-h-[calc(100dvh-2rem)]"
    >
      <form onSubmit={submit} className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {text.editorEyebrow}
            </p>
            <h2
              id="lick-editor-title"
              className="mt-2 font-sans text-xl font-semibold tracking-tight text-ink"
            >
              {lick ? text.editTitle : text.createTitle}
            </h2>
            <p className="mt-2 max-w-prose text-sm text-muted">
              {text.editorDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={text.close}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

          <label className="block text-xs text-muted sm:col-span-2">
            {text.tabLabel}
            <TextArea
              value={tabContent}
              onChange={(event) => setTabContent(event.target.value)}
              placeholder={text.tabPlaceholder}
              wrap="off"
              spellCheck={false}
              className="mt-1 min-h-56 font-mono text-xs leading-6"
            />
            <span className="mt-1 block text-[11px] text-muted">
              {text.tabHint}
            </span>
          </label>

          <div className="block text-xs text-muted">
            {text.keyLabel}
            <SelectField
              className="mt-1"
              value={key}
              ariaLabel={text.keyLabel}
              onChange={setKey}
              options={[
                { value: "", label: text.keyNone },
                ...MUSICAL_KEYS.map((option) => ({
                  value: option,
                  label: option,
                })),
              ]}
            />
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
          <Button type="button" variant="ghost" onClick={onClose}>
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
