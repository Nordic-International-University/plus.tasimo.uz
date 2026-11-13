'use client';

import {
  AlignLeft,
  BarChart3,
  CalendarRange,
  Footprints,
  Handshake,
  HelpCircle,
  Images,
  Info,
  LayoutGrid,
  LayoutTemplate,
  PlayCircle,
  Quote,
  Ticket,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { SECTION_META } from '@/lib/doc/presets';
import { SECTION_TYPES, type SectionType } from '@/lib/doc/types';
import { VARIANT_INFO, variantTone } from './preset-info';
import { PresetThumb } from './PresetThumb';

const TYPE_ICON: Record<SectionType, LucideIcon> = {
  hero: LayoutTemplate,
  about: Info,
  features: LayoutGrid,
  seasons: CalendarRange,
  steps: Footprints,
  stats: BarChart3,
  gallery: Images,
  video: PlayCircle,
  testimonials: Quote,
  faq: HelpCircle,
  cta: Ticket,
  richtext: AlignLeft,
  logos: Handshake,
};

type Filter = 'all' | SectionType;

/**
 * «Bo'lim qo'shish»: har bo'lim turi va har variant — eskiz (skeleton) ko'rinishida, ustiga borganda jonlanadi.
 * Chapda turlar ro'yxati (filtr), o'ngda variant kartalari; bosilgan variant namuna matn bilan qo'shiladi.
 */
export function PresetPicker({
  onPick,
  onClose,
  afterTitle,
}: {
  onPick: (type: SectionType, variant: string) => void;
  onClose: () => void;
  /** Qaysi bo'limdan keyin qo'shiladi (sarlavhada ko'rsatiladi) */
  afterTitle?: string;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const types = filter === 'all' ? SECTION_TYPES : SECTION_TYPES.filter((type) => type === filter);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const navItem = (key: Filter, label: string, Icon?: LucideIcon, count?: number) => (
    <button
      key={key}
      type="button"
      onClick={() => setFilter(key)}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition',
        filter === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
      )}
    >
      {Icon && <Icon size={16} className="shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className={cn('text-xs', filter === key ? 'text-white/60' : 'text-slate-400')}>{count}</span>}
    </button>
  );

  return (
    <div className="ed-modal-backdrop" onMouseDown={onClose}>
      <div
        className="ed-modal flex h-[min(88vh,860px)] max-w-[1140px] flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Bo‘lim qo‘shish"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">Bo‘lim qo‘shish</h2>
            <p className="text-xs text-slate-500">
              Ko‘rinishni tanlang — namuna matn bilan qo‘shiladi, keyin sahifaning o‘zida tahrirlaysiz.
              {afterTitle && <> «{afterTitle}» bo‘limidan keyin joylashadi.</>}
            </p>
          </div>
          <button type="button" className="ed-tool ed-tool-light" onClick={onClose} aria-label="Yopish">
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[230px_minmax(0,1fr)]">
          <nav className="hidden flex-col gap-1 overflow-y-auto border-r border-slate-100 p-3 md:flex" aria-label="Bo‘lim turlari">
            {navItem('all', 'Hammasi', undefined, SECTION_TYPES.reduce((sum, type) => sum + SECTION_META[type].variants.length, 0))}
            <div className="my-1 border-t border-slate-100" />
            {SECTION_TYPES.map((type) => navItem(type, SECTION_META[type].label, TYPE_ICON[type], SECTION_META[type].variants.length))}
          </nav>

          <div className="min-h-0 overflow-y-auto">
            <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-3 md:hidden">
              {(['all', ...SECTION_TYPES] as Filter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold', filter === key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600')}
                >
                  {key === 'all' ? 'Hammasi' : SECTION_META[key].label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-9 p-6">
              {types.map((type) => {
                const meta = SECTION_META[type];
                const Icon = TYPE_ICON[type];
                return (
                  <section key={type} aria-label={meta.label}>
                    <div className="mb-3.5 flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2c5fd8]/[0.08] text-[#1d3f99]">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">{meta.label}</h3>
                        <p className="text-xs leading-relaxed text-slate-500">{meta.hint}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {meta.variants.map((variant) => (
                        <button key={variant.key} type="button" className="ed-preset-card" onClick={() => onPick(type, variant.key)}>
                          <div className={`sk-wrap sk-tone-${variantTone(type, variant.key, meta.bg)}`}>
                            <PresetThumb type={type} variant={variant.key} />
                          </div>
                          <div className="flex items-start justify-between gap-3 px-1 pb-0.5">
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900">{variant.label}</div>
                              <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{VARIANT_INFO[`${type}:${variant.key}`] ?? meta.hint}</div>
                            </div>
                            <span className="ed-preset-add">+ Qo‘shish</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
