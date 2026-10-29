'use client';

import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import type {
  AttachmentDraft,
  AttachmentType,
  TabInputMode,
} from '@/types/practice-attachment';
import { ATTACHMENT_OPTIONS } from '@/utils/practice-attachments';

interface Props {
  type: AttachmentType;
  tabMode: TabInputMode;
  draft: AttachmentDraft;
  error: string | null;
  isSaving: boolean;
  onTabModeChange: (mode: TabInputMode) => void;
  onDraftChange: (changes: Partial<AttachmentDraft>) => void;
  onSubmit: () => void;
  onFileSelect: (file: File | undefined) => void;
  onCancel: () => void;
}

const TAB_MODES: { mode: TabInputMode; label: string }[] = [
  { mode: 'text', label: 'Escribir texto' },
  { mode: 'file', label: 'Subir archivo' },
];

const FileDropField = ({
  accept,
  hint,
  isSaving,
  onFileSelect,
}: Pick<Props, 'isSaving' | 'onFileSelect'> & {
  accept: string;
  hint: string;
}) => (
  <label className='flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line px-4 py-6 text-center text-sm transition hover:bg-white/5 focus-within:outline focus-within:outline-2 focus-within:outline-ink/60'>
    <span className='font-medium'>
      {isSaving ? 'Guardando archivo…' : 'Elegir archivo'}
    </span>
    <span className='text-xs text-muted'>{hint}</span>
    <input
      type='file'
      accept={accept}
      className='sr-only'
      disabled={isSaving}
      onChange={(event) => {
        onFileSelect(event.target.files?.[0]);
        event.currentTarget.value = '';
      }}
    />
  </label>
);

const TabModeSwitch = ({
  tabMode,
  onTabModeChange,
}: Pick<Props, 'tabMode' | 'onTabModeChange'>) => (
  <div
    role='group'
    aria-label='Método de entrada de la TAB'
    className='grid grid-cols-2 gap-1 rounded-md border border-line p-1 sm:w-fit'
  >
    {TAB_MODES.map(({ mode, label }) => (
      <button
        key={mode}
        type='button'
        aria-pressed={tabMode === mode}
        onClick={() => onTabModeChange(mode)}
        className={`min-h-10 rounded px-4 text-sm transition ${
          tabMode === mode ?
            'bg-white/10 text-ink'
          : 'text-muted hover:text-ink'
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
  const option = ATTACHMENT_OPTIONS[type];
  const isLinkType = option.input === 'url';
  const isFileMode =
    option.input === 'file' || (type === 'tab' && tabMode === 'file');
  const isTextMode = type === 'tab' && tabMode === 'text';

  return (
    <div
      aria-label={option.heading}
      role='group'
      className='mb-5 space-y-4 rounded-xl border border-line bg-canvas/40 p-4 sm:p-5'
    >
      <div className='flex items-center justify-between gap-3'>
        <h3 className='font-sans text-base font-semibold'>{option.heading}</h3>
        <button
          type='button'
          onClick={onCancel}
          className='text-sm text-muted underline underline-offset-4 hover:text-ink'
        >
          Cancelar
        </button>
      </div>

      {type === 'tab' && (
        <TabModeSwitch
          tabMode={tabMode}
          onTabModeChange={onTabModeChange}
        />
      )}

      <TextField
        value={draft.title}
        onChange={(event) => onDraftChange({ title: event.target.value })}
        placeholder='Nombre (opcional)'
        aria-label='Nombre del material'
        maxLength={80}
      />

      {isLinkType && (
        <TextField
          type='url'
          required
          value={draft.url}
          onChange={(event) => onDraftChange({ url: event.target.value })}
          placeholder={option.url?.placeholder ?? ''}
          aria-label={option.url?.label ?? option.heading}
        />
      )}

      {isTextMode && (
        <TextArea
          value={draft.text}
          onChange={(event) => onDraftChange({ text: event.target.value })}
          placeholder={'e|-----0-----|\nB|---1---1---|\nG|-0-------0-|'}
          aria-label='Contenido de la TAB'
          spellCheck={false}
          className='min-h-40 font-mono text-xs sm:text-sm'
        />
      )}

      {isFileMode && (
        <FileDropField
          accept={option.accept}
          hint={option.fileHint}
          isSaving={isSaving}
          onFileSelect={onFileSelect}
        />
      )}

      {error && (
        <p
          className='text-sm text-red-300'
          role='alert'
        >
          {error}
        </p>
      )}

      {!isFileMode && (
        <Button
          type='button'
          onClick={onSubmit}
          variant='primary'
          className='h-12 w-full sm:ml-auto sm:w-auto'
        >
          Añadir
        </Button>
      )}
    </div>
  );
};
