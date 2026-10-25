'use client';

import { useEffect, useId } from 'react';
import { DialogHeader } from '@/components/ui/DialogHeader';
import { ModalDialog } from '@/components/ui/ModalDialog';
import { RepertoireSongForm } from '@/components/repertoire/RepertoireSongForm';
import { useDialogModal } from '@/hooks/useDialogModal';
import { useI18nSection } from '@/i18n/I18nProvider';

interface RepertoireItemDialogProps {
  onClose: () => void;
  onCreated: (itemId: string) => void;
}

/**
 * Creación de un elemento del repertorio sobre la biblioteca. Se monta solo
 * mientras está abierto: cada apertura parte de un borrador vacío y el foco
 * inicial cae en el título.
 */
export function RepertoireItemDialog({
  onClose,
  onCreated,
}: RepertoireItemDialogProps) {
  const text = useI18nSection('repertoire');
  const titleId = useId();
  const { dialogRef, handleCancel } = useDialogModal(true, onClose);

  useEffect(() => {
    // `showModal` enfoca el primer control del diálogo; el título es el punto
    // de entrada real del formulario.
    const frame = requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLInputElement>('[data-repertoire-title]')
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [dialogRef]);

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      onCancel={handleCancel}
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      variant='wide'
    >
      <div className='p-5 sm:p-6'>
        <DialogHeader
          eyebrow={text.library}
          titleId={titleId}
          title={text.newItemTitle}
          description={text.newItemDescription}
          onClose={onClose}
          closeLabel={text.close}
        />
        <RepertoireSongForm onCreated={onCreated} />
      </div>
    </ModalDialog>
  );
}
