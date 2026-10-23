"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";
import { formatLickDate } from "@/utils/licks/presentation";
import { MAX_BPM, MIN_BPM } from "@/utils/metronome-tempo";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { GuitarLick } from "@/types/lick";

export function LickBpmPanel({ lick }: { lick: GuitarLick }) {
  const text = useI18nSection("licks");
  const { locale } = useI18n();
  const recordLickBpm = usePracticeStore((state) => state.recordLickBpm);
  const markLickPracticed = usePracticeStore((state) => state.markLickPracticed);
  const [bpm, setBpm] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<
    { tone: "success" | "error"; text: string } | null
  >(null);

  function record(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(bpm);
    if (!Number.isInteger(value) || value < MIN_BPM || value > MAX_BPM) {
      setMessage({ tone: "error", text: text.bpmError });
      return;
    }
    if (!recordLickBpm(lick.id, value, notes)) {
      setMessage({ tone: "error", text: text.bpmError });
      return;
    }
    setBpm("");
    setNotes("");
    setMessage({ tone: "success", text: text.bpmSaved });
  }

  const entries = [...lick.bpmHistory].sort(
    (first, second) => Date.parse(first.date) - Date.parse(second.date),
  );

  return (
    <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {text.recordBpmTitle}
          </p>
          <h2 className="mt-1 font-sans text-lg font-semibold tracking-tight text-ink">
            {text.historyTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">{text.historyHint}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl tabular-nums text-ink">
            {lick.currentBpm ?? "–"}
          </p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted">
            {text.currentBpm}
          </p>
          <p className="mt-2 text-[11px] text-muted">
            {text.practiceCount}: {lick.practiceCount}
          </p>
        </div>
      </div>

      <form onSubmit={record} className="mt-5 grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-end">
        <label className="block text-xs text-muted">
          {text.bpmLabel}
          <TextField
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            step={1}
            inputMode="numeric"
            value={bpm}
            onChange={(event) => setBpm(event.target.value)}
            placeholder={text.bpmPlaceholder}
            className="mt-1"
            required
          />
        </label>
        <label className="block text-xs text-muted">
          {text.noteLabel}
          <TextField
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={text.notePlaceholder}
            maxLength={160}
            className="mt-1"
          />
        </label>
        <Button type="submit" variant="primary" size="field">
          {text.record}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="field"
          onClick={() => {
            markLickPracticed(lick.id);
            setMessage({ tone: "success", text: text.markedPracticed });
          }}
        >
          {text.markPracticed}
        </Button>
      </div>

      {message ? (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`mt-3 text-sm ${message.tone === "error" ? "text-red-300" : "text-accent-green-fg"}`}
        >
          {message.text}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-line bg-canvas/60 px-4 py-6 text-center text-sm text-muted">
          {text.historyEmpty}
        </p>
      ) : (
        <ol className="mt-6 space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-line bg-canvas/50 px-3 py-2"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm tabular-nums text-ink">
                  {entry.bpm} BPM
                </span>
                <span className="text-[11px] text-muted">
                  {formatLickDate(entry.date, locale, true)}
                </span>
              </div>
              {entry.notes ? (
                <p className="min-w-0 text-xs text-muted">{entry.notes}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
