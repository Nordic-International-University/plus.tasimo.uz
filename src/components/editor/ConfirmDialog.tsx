'use client';

import { AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmLabel: string;
  danger?: boolean;
}

/**
 * Muharrir ichidagi tasdiqlash oynasi. window.confirm ishlatilmaydi: Chrome'da «bu sayt boshqa oyna ochmasin»
 * belgilansa confirm() jimgina false qaytaradi va tugma «ishlamay» qoladi.
 */
export function useConfirmDialog(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setRequest({ ...options, resolve });
      }),
    [],
  );

  const close = useCallback(
    (value: boolean) => {
      request?.resolve(value);
      setRequest(null);
    },
    [request],
  );

  useEffect(() => {
    if (!request) return;
    confirmButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [request, close]);

  const element = request ? (
    <div className="ed-modal-backdrop" onMouseDown={() => close(false)}>
      <div className="ed-modal max-w-md" role="alertdialog" aria-modal="true" aria-label={request.title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex gap-4 px-6 pt-6">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${request.danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
            <AlertTriangle size={18} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-bold text-slate-900">{request.title}</h2>
            {request.text && <p className="text-sm leading-relaxed text-slate-500">{request.text}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" className="ed-btn" onClick={() => close(false)}>
            Bekor qilish
          </button>
          <button ref={confirmButton} type="button" className={`ed-btn ${request.danger ? 'ed-btn-danger' : 'ed-btn-primary'}`} onClick={() => close(true)}>
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return [confirm, element];
}
