'use client';

import { Link2, Loader2, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { safeUrl } from '@/lib/doc/normalize';
import { editorApi } from './editor-api';

const LIBRARY = ['registan', 'samarkand', 'khiva', 'bukhara', 'tashkent', 'observatory', 'algebra', 'caravan', 'mountains'];
const MAX_BYTES = 8 * 1024 * 1024;

/** Rasm tanlash: kompyuterdan yuklash (WebP'ga o'giriladi), havola yoki tayyor illyustratsiyalar */
export function ImageDialog({ current, onSelect, onClose }: { current: string; onSelect: (url: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'upload' | 'url' | 'library'>('upload');
  const [url, setUrl] = useState(current.startsWith('http') ? current : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return setError('Faqat JPG, PNG, WebP yoki GIF.');
    if (file.size > MAX_BYTES) return setError('Rasm 8 MB dan oshmasin.');
    setBusy(true);
    setError(null);
    try {
      const result = await editorApi.upload(file);
      onSelect(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yuklab bo‘lmadi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ed-modal-backdrop" onMouseDown={onClose}>
      <div className="ed-modal max-w-xl" role="dialog" aria-modal="true" aria-label="Rasm" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Rasm</h2>
          <button type="button" className="ed-tool !text-slate-600" onClick={onClose} aria-label="Yopish">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-1 px-5 pt-4">
          {(
            [
              ['upload', 'Yuklash'],
              ['url', 'Havola'],
              ['library', 'Illyustratsiyalar'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn('rounded-lg px-3 py-2 text-sm font-semibold', tab === key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'upload' && (
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDrag(false);
                void upload(event.dataTransfer.files[0]);
              }}
              className={cn(
                'flex h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-slate-500 transition',
                drag ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-400',
              )}
            >
              {busy ? <Loader2 className="animate-spin" size={28} /> : <Upload size={28} />}
              <span className="text-sm font-semibold">{busy ? 'Yuklanmoqda…' : 'Rasmni shu yerga tashlang yoki bosing'}</span>
              <span className="text-xs">JPG, PNG, WebP · 8 MB gacha · WebP’ga o‘giriladi</span>
            </button>
          )}
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(event) => void upload(event.target.files?.[0])} />

          {tab === 'url' && (
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const clean = safeUrl(url, true);
                if (!clean) return setError('Havola https:// bilan boshlanishi kerak.');
                onSelect(clean);
              }}
            >
              <div className="relative">
                <Link2 size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" className="ed-input pl-9" autoFocus />
              </div>
              <button type="submit" className="ed-btn ed-btn-primary self-end">
                Qo‘yish
              </button>
            </form>
          )}

          {tab === 'library' && (
            <div className="grid grid-cols-3 gap-3">
              {LIBRARY.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSelect(`/art/${name}.svg`)}
                  className="overflow-hidden rounded-xl border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/art/${name}.svg`} alt={name} className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        {current && (
          <div className="flex justify-between border-t border-slate-100 px-5 py-3">
            <button type="button" className="ed-btn text-red-600 hover:bg-red-50" onClick={() => onSelect('')}>
              <Trash2 size={15} /> Rasmni olib tashlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
