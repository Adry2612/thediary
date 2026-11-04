"use client";

import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  noResultsMessage: string;
  closeLabel: string;
  /** Cabecera de las entradas del catálogo cuando hay nombres propios. */
  catalogGroupLabel?: string;
  /** Cabecera de los nombres creados por el usuario. */
  customGroupLabel?: string;
  /** Acción extra al pie, como buscar la misma consulta en el catálogo. */
  footerAction?: { label: string; onClick: (query: string) => void };
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
  title,
  description,
  searchLabel,
  searchPlaceholder,
  emptyMessage,
  noResultsMessage,
  closeLabel,
  catalogGroupLabel,
  customGroupLabel,
  footerAction,
  items,
  selectedId,
  onSelect,
  onClose,
}: SearchPickerDialogProps) {
  const titleId = useId();
  const { dialogRef, handleCancel, isClosing } = useDialogModal(open, onClose);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const hasItems = items.length > 0;
  const visibleItems = useMemo(
    () => filterSearchPickerItems(items, query),
    [items, query],
  );

  // Solo se separan cuando de verdad hay nombres propios que mostrar.
  const groups = useMemo(() => {
    const custom = visibleItems.filter((item) => item.group === "custom");
    const catalog = visibleItems.filter((item) => item.group !== "custom");
    if (custom.length === 0 || catalog.length === 0) {
      return [{ key: "all", label: undefined, items: visibleItems }];
    }
    return [
      { key: "catalog", label: catalogGroupLabel, items: catalog },
      { key: "custom", label: customGroupLabel, items: custom },
    ];
  }, [catalogGroupLabel, customGroupLabel, visibleItems]);

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

  function renderItem(item: SearchPickerItem) {
    const selected = item.id === selectedId;
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => pick(item.id)}
          aria-current={selected ? "true" : undefined}
          className={`flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink/60 ${
            selected ? "bg-accent-green-bg/20" : "hover:bg-white/[0.04]"
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
  }

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      onCancel={handleCancel}
      onClose={onClose}
      isClosing={isClosing}
      variant="lg"
      className="max-w-xl"
    >
      <div className="p-5 sm:p-6">
        <DialogHeader
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
              {groups.map((group) => (
                <Fragment key={group.key}>
                  {group.label ? (
                    <li className="bg-white/[0.02] px-3 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                      {group.label}
                    </li>
                  ) : null}
                  {group.items.map((item) => renderItem(item))}
                </Fragment>
              ))}
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

        {footerAction ? (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => footerAction.onClick(query)}
              className="text-sm text-muted underline underline-offset-4 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
            >
              {footerAction.label}
            </button>
          </div>
        ) : null}
      </div>
    </ModalDialog>
  );
}
