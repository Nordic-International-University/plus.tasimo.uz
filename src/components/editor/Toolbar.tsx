'use client';

import { Check, CloudOff, ExternalLink, History, Loader2, LogOut, Monitor, PanelLeft, Pencil, Redo2, RotateCcw, Send, Smartphone, Tablet, Undo2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/doc/types';
import { PlusMark } from '../logo/PlusLogo';
import type { SaveStatus } from './useEditorState';

export type ViewMode = 'edit' | 'desktop' | 'tablet' | 'mobile';

const STATUS: Record<SaveStatus, { label: string; tone: string }> = {
  saved: { label: 'Saqlandi', tone: 'text-emerald-600' },
  pending: { label: 'Saqlanmoqda…', tone: 'text-slate-500' },
  saving: { label: 'Saqlanmoqda…', tone: 'text-slate-500' },
  error: { label: 'Saqlanmadi', tone: 'text-red-600' },
  conflict: { label: 'Boshqa oynada o‘zgargan', tone: 'text-amber-600' },
  expired: { label: 'Sessiya tugagan', tone: 'text-red-600' },
};

export function Toolbar(props: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
  view: ViewMode;
  onView: (view: ViewMode) => void;
  status: SaveStatus;
  error: string | null;
  onRetry: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  unpublished: boolean;
  publishing: boolean;
  onPublish: () => void;
  onDiscard: () => void;
  onHistory: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}) {
  const status = STATUS[props.status];
  const busy = props.status === 'saving' || props.status === 'pending';
  return (
    <header className="ed-toolbar">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="ed-tool !text-slate-600 lg:hidden" onClick={props.onToggleSidebar} aria-label="Panel">
          <PanelLeft size={18} />
        </button>
        <span className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
          <PlusMark size={30} className="text-[var(--color-navy)]" />
          <span className="hidden sm:inline">Plus muharriri</span>
        </span>
        <span className={cn('hidden items-center gap-1.5 text-xs font-semibold md:inline-flex', status.tone)} title={props.error ?? undefined}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : props.status === 'saved' ? <Check size={14} /> : <CloudOff size={14} />}
          {status.label}
        </span>
        {(props.status === 'error' || props.status === 'conflict' || props.status === 'expired') && (
          <button type="button" className="ed-btn !min-h-8 !px-2.5 text-xs" onClick={props.onRetry}>
            {props.status === 'expired' ? 'Qayta kirish' : props.status === 'conflict' ? 'Yangilash' : 'Qayta saqlash'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button type="button" className="ed-tool !text-slate-600" disabled={!props.canUndo} onClick={props.onUndo} title="Orqaga (Ctrl+Z)">
          <Undo2 size={17} />
        </button>
        <button type="button" className="ed-tool !text-slate-600" disabled={!props.canRedo} onClick={props.onRedo} title="Oldinga (Ctrl+Shift+Z)">
          <Redo2 size={17} />
        </button>
        <div className="mx-1 flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label="Til">
          {(['en', 'ru'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => props.onLocale(code)}
              className={cn('rounded-md px-2.5 py-1 text-xs font-bold', props.locale === code ? 'bg-white text-slate-900 shadow' : 'text-slate-500')}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="hidden rounded-lg bg-slate-100 p-0.5 md:flex" role="group" aria-label="Ko‘rinish">
          {(
            [
              ['edit', Pencil, 'Tahrirlash'],
              ['desktop', Monitor, 'Ko‘rish: kompyuter'],
              ['tablet', Tablet, 'Ko‘rish: planshet'],
              ['mobile', Smartphone, 'Ko‘rish: telefon'],
            ] as const
          ).map(([key, IconCmp, title]) => (
            <button
              key={key}
              type="button"
              title={title}
              onClick={() => props.onView(key)}
              className={cn('grid h-7 w-8 place-items-center rounded-md', props.view === key ? 'bg-white text-slate-900 shadow' : 'text-slate-500')}
            >
              <IconCmp size={15} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button type="button" className="ed-tool !text-slate-600" onClick={props.onHistory} title="E’lon qilingan nusxalar">
          <History size={17} />
        </button>
        {props.unpublished && (
          <button type="button" className="ed-tool !text-slate-600" onClick={props.onDiscard} title="E’lon qilinmagan o‘zgarishlarni bekor qilish">
            <RotateCcw size={17} />
          </button>
        )}
        <a className="ed-tool !text-slate-600" href={`/${props.locale}`} target="_blank" rel="noopener" title="Saytni ochish">
          <ExternalLink size={17} />
        </a>
        <button
          type="button"
          onClick={props.onPublish}
          disabled={props.publishing || (!props.unpublished && props.status === 'saved')}
          className={cn('ed-btn ed-btn-primary relative', !props.unpublished && 'opacity-60')}
          title={props.unpublished ? 'Qoralamani saytga chiqarish' : 'Saytdagi bilan bir xil'}
        >
          {props.publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          <span className="hidden sm:inline">E’lon qilish</span>
          {props.unpublished && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400" />}
        </button>
        <button type="button" className="ed-tool !text-slate-500" onClick={props.onLogout} title="Chiqish">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
