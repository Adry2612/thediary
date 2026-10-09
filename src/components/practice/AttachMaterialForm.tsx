"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea, TextField } from "@/components/ui/Field";
import type {
  AttachmentDraft,
  AttachmentType,
  TabInputMode,
} from "@/types/practice-attachment";

interface Props {
  type: AttachmentType;
  tabMode: TabInputMode;
  draft: AttachmentDraft;
  error: string | null;
  isSaving: boolean;
  onTabModeChange: (mode: TabInputMode) => void;
  onDraftChange: (changes: Partial<AttachmentDraft>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFileSelect: (file: File | undefined) => void;
  onCancel: () => void;
}

const HEADINGS: Record<AttachmentType, string> = {
  tab: "Añadir TAB",
  pdf: "Añadir PDF",
  youtube: "Añadir vídeo de YouTube",
  spotify: "Añadir canción de Spotify",
};

const URL_FIELDS = {
  youtube: {
    label: "Enlace de YouTube",
    placeholder: "https://www.youtube.com/watch?v=…",
  },
  spotify: {
    label: "Enlace de Spotify",
    placeholder: "https://open.spotify.com/track/…",
  },
};

const FILE_ACCEPT: Record<AttachmentType, string> = {
  tab: ".gp,.gpx,.gp3,.gp4,.gp5,.txt,text/plain",
  pdf: "application/pdf,.pdf",
  youtube: "",
  spotify: "",
};

const FILE_HINTS: Record<AttachmentType, string> = {
  tab: "Guitar Pro (.gp, .gpx, .gp3–.gp5) o texto (.txt)",
  pdf: "Archivo PDF",
  youtube: "",
  spotify: "",
};

const TAB_MODES: { mode: TabInputMode; label: string }[] = [
  { mode: "text", label: "Escribir texto" },
  { mode: "file", label: "Subir archivo" },
];

const FileDropField = ({
  type,
  isSaving,
  onFileSelect,
}: Pick<Props, "type" | "isSaving" | "onFileSelect">) => (
  <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line px-4 py-6 text-center text-sm transition hover:bg-white/5 focus-within:outline focus-within:outline-2 focus-within:outline-ink/60">
    <span className="font-medium">
      {isSaving ? "Guardando archivo…" : "Elegir archivo"}
    </span>
    <span className="text-xs text-muted">{FILE_HINTS[type]}</span>
    <input
      type="file"
      accept={FILE_ACCEPT[type]}
      className="sr-only"
      disabled={isSaving}
      onChange={(event) => {
        onFileSelect(event.target.files?.[0]);
        event.currentTarget.value = "";
      }}
    />
  </label>
);

const TabModeSwitch = ({
  tabMode,
  onTabModeChange,
}: Pick<Props, "tabMode" | "onTabModeChange">) => (
  <div
    role="group"
    aria-label="Método de entrada de la TAB"
    className="grid grid-cols-2 gap-1 rounded-md border border-line p-1 sm:w-fit"
  >
    {TAB_MODES.map(({ mode, label }) => (
      <button
        key={mode}
        type="button"
        aria-pressed={tabMode === mode}
        onClick={() => onTabModeChange(mode)}
        className={`min-h-10 rounded px-4 text-sm transition ${
          tabMode === mode ? "bg-white/10 text-ink" : "text-muted hover:text-ink"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export const AttachMaterialForm = ({
  type,
  tabMode,
  draft,
  error,
  isSaving,
  onTabModeChange,
  onDraftChange,
  onSubmit,
  onFileSelect,
  onCancel,
}: Props) => {
  const isLinkType = type === "youtube" || type === "spotify";
  const isFileMode = type === "pdf" || (type === "tab" && tabMode === "file");
  const isTextMode = type === "tab" && tabMode === "text";

  return (
    <form
      onSubmit={onSubmit}
      aria-label={HEADINGS[type]}
      className="mb-5 space-y-4 rounded-xl border border-line bg-canvas/40 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-sans text-base font-semibold">{HEADINGS[type]}</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Cancelar
        </button>
      </div>

      {type === "tab" && (
        <TabModeSwitch tabMode={tabMode} onTabModeChange={onTabModeChange} />
      )}

      <TextField
        value={draft.title}
        onChange={(event) => onDraftChange({ title: event.target.value })}
        placeholder="Nombre (opcional)"
        aria-label="Nombre del material"
        maxLength={80}
      />

      {isLinkType && (
        <TextField
          type="url"
          required
          value={draft.url}
          onChange={(event) => onDraftChange({ url: event.target.value })}
          placeholder={URL_FIELDS[type].placeholder}
          aria-label={URL_FIELDS[type].label}
        />
      )}

      {isTextMode && (
        <TextArea
          value={draft.text}
          onChange={(event) => onDraftChange({ text: event.target.value })}
          placeholder={"e|-----0-----|\nB|---1---1---|\nG|-0-------0-|"}
          aria-label="Contenido de la TAB"
          spellCheck={false}
          className="min-h-40 font-mono text-xs sm:text-sm"
        />
      )}

      {isFileMode && (
        <FileDropField
          type={type}
          isSaving={isSaving}
          onFileSelect={onFileSelect}
        />
      )}

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {!isFileMode && (
        <Button
          type="submit"
          variant="primary"
          className="h-12 w-full sm:ml-auto sm:w-auto"
        >
          Añadir
        </Button>
      )}
    </form>
  );
};
