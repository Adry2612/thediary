'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { CatalogCandidate } from '@/types/catalog';
import { CoverArt } from '@/components/repertoire/CoverArt';
import { DialogHeader } from '@/components/ui/DialogHeader';
import { ModalDialog } from '@/components/ui/ModalDialog';
import { SearchField } from '@/components/ui/SearchField';
import {
  useCatalogSearch,
  type CatalogSearchStatus,
} from '@/hooks/useCatalogSearch';
import { useDialogModal } from '@/hooks/useDialogModal';
import { useDeferredClose } from '@/hooks/useDeferredClose';
import { useI18nSection } from '@/i18n/I18nProvider';
import { MIN_CATALOG_QUERY_LENGTH } from '@/utils/catalog-results';

/** Pausa desde la última tecla antes de consultar el catálogo. */
const SEARCH_DELAY_MS = 350;

interface CatalogSearchDialogProps {
  /** Consulta de arranque; al traer texto, se busca nada más abrir. */
  initialQuery?: string;
  onSelect: (candidate: CatalogCandidate) => void;
  onClose: () => void;
}

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function getStatusMessage(
  status: CatalogSearchStatus,
  resultCount: number,
  text: Record<string, string>,
): string {
  if (status === 'loading') return text.catalogSearching;
  if (status === 'unavailable') return text.catalogUnavailable;
  if (status === 'empty') return text.catalogEmpty;
  if (status === 'ready') {
    return `${resultCount} ${resultCount === 1 ? text.catalogResult : text.catalogResults}`;
  }
  return '';
}

/**
 * Búsqueda en el catálogo. Se monta solo mientras está abierta y los resultados
 * se refrescan solos al escribir: cada cambio reinicia una espera corta, así que
 * una ráfaga de teclas produce una sola petición. Enter busca sin esperar.
 */
export function CatalogSearchDialog({
  initialQuery = '',
  onSelect,
  onClose,
}: CatalogSearchDialogProps) {
  const text = useI18nSection('repertoire');
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const closeDialog = useDeferredClose(onClose);
  const { dialogRef, handleCancel } = useDialogModal(true, () =>
    closeDialog.requestClose(),
  );
  const initial = normalize(initialQuery);
  const [query, setQuery] = useState(initial);
  const lastQueryRef = useRef(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status, results, search, reset } = useCatalogSearch();

  useEffect(() => {
    if (initial.length >= MIN_CATALOG_QUERY_LENGTH) void search(initial);
  }, [initial, search]);

  useEffect(() => {
    const next = normalize(query);
    if (next === lastQueryRef.current) return;
    lastQueryRef.current = next;

    if (next.length < MIN_CATALOG_QUERY_LENGTH) {
      reset();
      return;
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void search(next);
    }, SEARCH_DELAY_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [query, search, reset]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  function searchNow() {
    const next = normalize(query);
    if (next.length < MIN_CATALOG_QUERY_LENGTH) return;
    // Enter se salta la espera: se cancela el temporizador pendiente para no
    // repetir la misma consulta medio segundo después.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lastQueryRef.current = next;
    void search(next);
  }

  function choose(candidate: CatalogCandidate) {
    closeDialog.requestClose(() => {
      onSelect(candidate);
      onClose();
    });
  }

  const statusMessage = getStatusMessage(status, results.length, text);

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      onCancel={handleCancel}
      isClosing={closeDialog.isClosing}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog.requestClose();
      }}
      variant='lg'
    >
      <div
        className='p-5 sm:p-6'
        onKeyDown={(event) => {
          // Con el foco en el campo de búsqueda, el navegador usa Escape para
          // vaciarlo y no cierra la modal. Aquí Escape cierra siempre.
          if (event.key === 'Escape') {
            event.preventDefault();
            closeDialog.requestClose();
          }
        }}
      >
        <DialogHeader
          titleId={titleId}
          title={text.catalogSearchTitle}
          description={text.catalogSearchHint}
          onClose={closeDialog.requestClose}
          closeLabel={text.close}
        />

        <div className='mt-4'>
          <SearchField
            label={
              <span className='sr-only'>{text.catalogSearchTitle}</span>
            }
            inputRef={inputRef}
            placeholder={text.catalogSearchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                searchNow();
              }
            }}
            autoComplete='off'
            spellCheck={false}
          />

          <p
            role='status'
            aria-live='polite'
            className='mt-2 min-h-4 text-xs text-muted'
          >
            {statusMessage}
          </p>

          {results.length > 0 && (
            <ul
              className='mt-1 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1'
              aria-busy={status === 'loading'}
              aria-label={text.catalogSearchTitle}
            >
              {results.map((candidate) => (
                <li key={`${candidate.source}-${candidate.id}`}>
                  <button
                    type='button'
                    onClick={() => choose(candidate)}
                    className='flex w-full items-center gap-3 rounded-lg border border-line/70 bg-canvas/40 p-2.5 text-left transition hover:border-ink/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60'
                  >
                    <CoverArt
                      coverUrl={candidate.coverUrl}
                      alt={candidate.album ?? ''}
                    />
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm text-ink'>
                        {candidate.title}
                      </span>
                      <span className='block truncate text-xs text-muted'>
                        {candidate.artist}
                      </span>
                      {(candidate.album || candidate.releaseYear) && (
                        <span className='block truncate text-xs text-muted/80'>
                          {[candidate.album, candidate.releaseYear]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      )}
                    </span>
                    <span className='hidden shrink-0 text-xs text-muted sm:inline'>
                      {text.catalogUse}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ModalDialog>
  );
}
