"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SearchField } from "@/components/ui/SearchField";
import { useDialogModal } from "@/hooks/useDialogModal";
import {
  filterSearchPickerItems,
  type SearchPickerItem,
} from "@/utils/search-picker";

interface SearchPickerDialogProps {
  open: boolean;
  eyebrow: string;
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  noResultsMessage: string;
  closeLabel: string;
  items: readonly SearchPickerItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/**
 * Modal de búsqueda compartido por canciones y técnicas. Solo se ocupa de
 * filtrar una lista, marcar la opción actual y devolver el id elegido.
 */
export function SearchPickerDialog({
  open,
  eyebrow,
  title,
  description,
  searchLabel,
  searchPlaceholder,
  emptyMessage,
  noResultsMessage,
  closeLabel,
  items,
  selectedId,
  onSelect,
  onClose,
}: SearchPickerDialogProps) {
  const titleId = useId();
  const { dialogRef, handleCancel } = useDialogModal(open, onClose);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const hasItems = items.length > 0;
  const visibleItems = useMemo(
    () => filterSearchPickerItems(items, query),
    [items, query],
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function pick(id: string) {
    onSelect(id);
    onClose();
  }

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      onCancel={handleCancel}
      onClose={onClose}
      variant="lg"
      className="max-w-xl"
    >
      <div className="p-5 sm:p-6">
        <DialogHeader
          eyebrow={eyebrow}
          titleId={titleId}
          title={title}
          description={description}
          onClose={onClose}
          closeLabel={closeLabel}
        />

        <div className="mt-5">
          <SearchField
            label={searchLabel}
            inputRef={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
            }}
            placeholder={searchPlaceholder}
            spellCheck={false}
          />
        </div>

        <div className="mt-4 max-h-[55vh] overflow-y-auto border-y border-line">
          {visibleItems.length > 0 ? (
            <ul className="divide-y divide-line">
              {visibleItems.map((item) => {
                const selected = item.id === selectedId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => pick(item.id)}
                      aria-current={selected ? "true" : undefined}
                      className={`flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink/60 ${
                        selected
                          ? "bg-accent-green-bg/20"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-medium text-ink">
                          {item.label}
                        </span>
                        {item.description?.trim() ? (
                          <span className="mt-0.5 block text-xs text-muted">
                            {item.description.trim()}
                          </span>
                        ) : null}
                      </span>
                      {selected ? (
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-sm text-accent-green-fg"
                        >
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              role="status"
              aria-live="polite"
              className="px-3 py-8 text-center text-sm text-muted"
            >
              {hasItems ? noResultsMessage : emptyMessage}
            </p>
          )}
        </div>
      </div>
    </ModalDialog>
  );
}
