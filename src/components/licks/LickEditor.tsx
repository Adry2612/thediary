"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/Field";
import { LickTab } from "@/components/licks/LickTab";
import { TabScoreEditor } from "@/components/tab-score/TabScoreEditor";
import { EditIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";
import { createId } from "@/utils/create-id";
import { normalizeMusicalKey, MUSICAL_KEYS } from "@/utils/licks/keys";
import { detectTabKey } from "@/utils/licks/key-detection";
import {
  LICK_TECHNIQUES,
  normalizeTechniques,
} from "@/utils/licks/techniques";
import { MAX_BPM, MIN_BPM } from "@/utils/metronome-tempo";
import { normalizeTab } from "@/utils/repertoire-tab";
import { resolveTabScore } from "@/utils/tab-score/resolve";
import type { GuitarLick, TechniqueId } from "@/types/lick";
import type { RepertoireItem } from "@/types/practice";

/**
 * Editor de un lick a pantalla completa. Antes vivía dentro de un diálogo
 * estrecho y la tablatura no cabía; aquí la partitura ocupa todo el ancho de
 * la columna y la ficha del lick queda encima como contexto.
 */
export function LickEditor({
  lick,
  songs,
  onSave,
  onCancel,
}: {
  lick: GuitarLick | null;
  songs: RepertoireItem[];
  onSave: (lick: GuitarLick) => void;
  onCancel: () => void;
}) {
  const text = useI18nSection("licks");
  const [title, setTitle] = useState(lick?.title ?? "");
  const hasLegacyTab = Boolean(
    lick && !lick.score && !lick.tab && lick.tabContent?.trim(),
  );
  const [score, setScore] = useState(() =>
    resolveTabScore({ score: lick?.score, tab: lick?.tab }),
  );
  const [useVisualTab, setUseVisualTab] = useState(!hasLegacyTab);
  const detectedKey = useMemo(
    () => detectTabKey(normalizeTab(lick?.tab)),
    [lick?.tab],
  );
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
      if (!Number.isInteger(value) || value < MIN_BPM || value > MAX_BPM) {
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
      ...(useVisualTab ? { score } : {}),
      ...(lick?.tab ? { tab: lick.tab } : {}),
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
          <h2 className="mb-3 font-sans text-xl font-semibold tracking-tight text-ink">
            {text.tabLabel}
          </h2>

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
              <TabScoreEditor
                initialScore={score}
                label={text.tabTitle}
                onChange={setScore}
              />
            </>
          ) : (
            <div className="rounded-xl border border-line bg-surface p-5">
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
                      {text[technique.labelKey] ?? technique.id}
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
          <Button type="submit" variant="primary">
            {text.save}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
