import { useEffect, useRef } from 'react';
import type { Copy } from '../i18n/ru';

export function ConfirmDialog({ open, copy, onCancel, onConfirm }: {
  open: boolean; copy: Copy; onCancel: () => void; onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    cancel.current?.focus();
    return () => {
      element?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open]);

  return <dialog ref={dialog} className="confirm-dialog" aria-labelledby="clear-title" aria-describedby="clear-description" onCancel={onCancel}>
    <h2 id="clear-title">{copy.pages.clearTitle}</h2><p id="clear-description">{copy.pages.clearDescription}</p>
    <div className="actions">
      <button ref={cancel} className="button button-secondary" type="button" onClick={onCancel}>{copy.pages.keep}</button>
      <button className="button button-primary" type="button" onClick={onConfirm}>{copy.pages.clear}</button>
    </div>
  </dialog>;
}
