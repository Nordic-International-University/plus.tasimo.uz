'use client';

import { History, Loader2, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ConfirmOptions } from './ConfirmDialog';
import { editorApi } from './editor-api';

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Tashkent' }).format(new Date(iso));

/** E'lon qilingan nusxalar — tanlangani qoralamaga qaytadi (saytga chiqishi uchun keyin e'lon qilinadi) */
export function HistoryDialog({
  confirm,
  onRestored,
  onClose,
}: {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  onRestored: () => Promise<void>;
  onClose: () => void;
}) {
  const [items, setItems] = useState<{ id: number; note: string | null; createdAt: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    editorApi
      .revisions()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Tarixni olib bo‘lmadi.'));
  }, []);

  const restore = async (id: number) => {
    const ok = await confirm({
      title: 'Shu nusxaga qaytilsinmi?',
      text: 'Nusxa qoralamaga qaytariladi (hozirgi qoralama almashadi). Saytga chiqishi uchun keyin «E’lon qilish»ni bosing.',
      confirmLabel: 'Qaytarish',
    });
    if (!ok) return;
    setBusy(id);
    try {
      await editorApi.restore(id);
      await onRestored();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Qaytarib bo‘lmadi.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="ed-modal-backdrop" onMouseDown={onClose}>
      <div className="ed-modal max-w-lg" role="dialog" aria-modal="true" aria-label="Tarix" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <History size={18} /> E’lon qilingan nusxalar
          </h2>
          <button type="button" className="ed-tool !text-slate-600" onClick={onClose} aria-label="Yopish">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!items && !error && (
            <div className="grid place-items-center p-8 text-slate-400">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {items?.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Hali e’lon qilinmagan.</p>}
          {items?.map((item, i) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {fmt(item.createdAt)} {i === 0 && <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-emerald-700">saytda</span>}
                </div>
                {item.note && <div className="text-xs text-slate-500">{item.note}</div>}
              </div>
              <button type="button" className="ed-btn" disabled={busy !== null} onClick={() => void restore(item.id)}>
                {busy === item.id ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />} Qaytarish
              </button>
            </div>
          ))}
          {error && <p className="m-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
