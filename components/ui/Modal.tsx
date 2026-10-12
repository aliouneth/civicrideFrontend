"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

// Confirm step for destructive actions (e.g. Cancel ride). Focus moves into
// the dialog on open and returns on close; Escape cancels.
export function Modal({ title, body, confirmLabel, onConfirm, onClose, confirming, cancelLabel = "Keep ride" }: {
  title: string; body: string; confirmLabel: string;
  onConfirm: () => void; onClose: () => void; confirming?: boolean; cancelLabel?: string;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-4 sm:items-center" role="presentation" onClick={onClose}>
      <div
        role="alertdialog" aria-modal="true" aria-labelledby="modal-title"
        className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-ink-500">{body}</p>
        <div className="mt-6 flex gap-3">
           <Button variant="ghost" className="flex-1" onClick={onClose}>{cancelLabel}</Button>
          <span className="flex-1 [&>button]:w-full">
            <Button ref={confirmRef} variant="danger" loading={confirming} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
}
