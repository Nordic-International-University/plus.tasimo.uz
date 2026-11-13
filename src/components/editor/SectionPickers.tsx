'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SECTION_META } from '@/lib/doc/presets';
import type { Background, Section } from '@/lib/doc/types';
import { BG_INFO, BG_ORDER, VARIANT_INFO, variantTone } from './preset-info';
import { PresetThumb } from './PresetThumb';

/**
 * Bo'lim ko'rinishini tanlash — quruq matnli select o'rniga eskizlar: har variant qanday joylashishi va
 * shu bo'lim har bir fonda qanday ko'rinishi. Bo'lim panelida (ochiluvchi oyna) va o'ng panelda ishlatiladi.
 */

/** Dizayn variantlari: eskiz + nomi + «ichida nima bor» */
export function VariantOptions({ section, onPick, columns = 2 }: { section: Section; onPick: (variant: string) => void; columns?: 2 | 3 }) {
  const meta = SECTION_META[section.type];
  return (
    <div className={cn('grid gap-2.5', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {meta.variants.map((variant) => {
        const active = section.variant === variant.key;
        return (
          <button
            key={variant.key}
            type="button"
            className={cn('ed-pick', active && 'ed-pick-active')}
            aria-pressed={active}
            title={VARIANT_INFO[`${section.type}:${variant.key}`]}
            onClick={() => onPick(variant.key)}
          >
            <span className={`sk-wrap sk-tone-${variantTone(section.type, variant.key, section.bg)}`}>
              <PresetThumb type={section.type} variant={variant.key} />
              {active && (
                <span className="ed-pick-check">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="ed-pick-label">{variant.label}</span>
            <span className="ed-pick-note">{VARIANT_INFO[`${section.type}:${variant.key}`]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Fonlar: shu bo'limning o'zi har bir fonda (eskiz) — tanlashdan oldin natija ko'rinadi */
export function BackgroundOptions({ section, onPick, columns = 3 }: { section: Section; onPick: (bg: Background) => void; columns?: 2 | 3 }) {
  return (
    <div className={cn('grid gap-2.5', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {BG_ORDER.map((bg) => {
        const active = section.bg === bg;
        return (
          <button key={bg} type="button" className={cn('ed-pick', active && 'ed-pick-active')} aria-pressed={active} title={BG_INFO[bg].note} onClick={() => onPick(bg)}>
            <span className={`sk-wrap sk-tone-${bg}`}>
              <PresetThumb type={section.type} variant={section.variant} />
              {active && (
                <span className="ed-pick-check">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="ed-pick-label">{BG_INFO[bg].label}</span>
            <span className="ed-pick-note">{BG_INFO[bg].note}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Bo'lim panelidagi tugma + ochiluvchi oyna (tashqariga bosish yoki Esc — yopiladi). Pastda joy yetmasa — tepaga ochiladi.
 * `onOpenChange` — panel ochiq turganda bo'lim asboblari yashirinib qolmasin.
 */
export function ToolbarPicker({
  label,
  preview,
  title,
  width,
  open,
  onOpenChange,
  children,
}: {
  label: string;
  preview: ReactNode;
  title: string;
  width: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<'down' | 'up'>('down');
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  // Joylashuv: pastda joy yetmasa — tepaga; kanvas chetidan chiqsa — gorizontal suriladi
  useLayoutEffect(() => {
    if (!open || !ref.current || !popRef.current) return;
    const trigger = ref.current.getBoundingClientRect();
    const height = popRef.current.offsetHeight;
    const below = window.innerHeight - trigger.bottom;
    setPlacement(below < height + 16 && trigger.top > below ? 'up' : 'down');
    const bounds = ref.current.closest('.ed-canvas-wrap')?.getBoundingClientRect();
    if (bounds) {
      const center = trigger.left + trigger.width / 2;
      const left = center - width / 2;
      const right = center + width / 2;
      if (left < bounds.left + 8) setShift(bounds.left + 8 - left);
      else if (right > bounds.right - 8) setShift(bounds.right - 8 - right);
      else setShift(0);
    }
  }, [open, width]);

  return (
    <div ref={ref} className="relative">
      <button type="button" className={cn('ed-tb-btn', open && 'ed-tb-btn-open')} onClick={() => onOpenChange(!open)} aria-expanded={open} title={title}>
        {preview}
        <span className="max-w-[150px] truncate">{label}</span>
        <ChevronDown size={14} className={cn('shrink-0 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          ref={popRef}
          className={cn('ed-pop', placement === 'up' && 'ed-pop-up')}
          style={{ width, transform: `translateX(calc(-50% + ${shift}px))` }}
          role="dialog"
          aria-label={title}
        >
          <div className="mb-2.5 text-[0.72rem] font-bold tracking-wide text-slate-500 uppercase">{title}</div>
          {children}
        </div>
      )}
    </div>
  );
}

/** Tugmadagi kichik fon namunasi */
export function BgSwatch({ bg }: { bg: Background }) {
  return <span className={`ed-tb-swatch sk-tone-${bg}`} aria-hidden="true" />;
}

/** Galereya joylashuvi: bento, masonry, to'r, karusel — kichik sxemalar bilan */
const LAYOUT_SKETCH: Record<string, ReactNode> = {
  bento: (
    <>
      <rect x="4" y="4" width="34" height="22" rx="2" />
      <rect x="40" y="4" width="16" height="22" rx="2" />
      <rect x="58" y="4" width="18" height="10" rx="2" />
      <rect x="58" y="16" width="18" height="10" rx="2" />
      <rect x="4" y="28" width="16" height="14" rx="2" />
      <rect x="22" y="28" width="34" height="14" rx="2" />
      <rect x="58" y="28" width="18" height="14" rx="2" />
    </>
  ),
  masonry: (
    <>
      <rect x="4" y="4" width="22" height="16" rx="2" />
      <rect x="4" y="22" width="22" height="20" rx="2" />
      <rect x="29" y="4" width="22" height="24" rx="2" />
      <rect x="29" y="30" width="22" height="12" rx="2" />
      <rect x="54" y="4" width="22" height="12" rx="2" />
      <rect x="54" y="18" width="22" height="24" rx="2" />
    </>
  ),
  grid: (
    <>
      {[0, 1, 2, 3].map((k) => (
        <rect key={`a${k}`} x={4 + k * 18.5} y="6" width="16" height="15" rx="2" />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <rect key={`b${k}`} x={4 + k * 18.5} y="25" width="16" height="15" rx="2" />
      ))}
    </>
  ),
  carousel: (
    <>
      <rect x="4" y="9" width="24" height="26" rx="2" />
      <rect x="31" y="9" width="24" height="26" rx="2" />
      <rect x="58" y="9" width="24" height="26" rx="2" opacity="0.45" />
      <path d="M33 40 h3 M39 40 h3 M45 40 h3" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};

const LAYOUT_NOTE: Record<string, string> = {
  bento: 'Har xil o‘lcham — keng va baland rasmlar aralash',
  masonry: 'Ustunlar, rasmlar o‘z balandligida',
  grid: 'Teng to‘r, hamma rasm bir xil',
  carousel: 'Bir qator, yon tomonga suriladi',
};

export function LayoutOptions({ value, options, onPick }: { value: string; options: { key: string; label: string }[]; onPick: (key: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((option) => {
        const active = value === option.key;
        return (
          <button key={option.key} type="button" className={cn('ed-pick', active && 'ed-pick-active')} aria-pressed={active} onClick={() => onPick(option.key)}>
            <span className="ed-pick-sketch">
              <svg viewBox="0 0 80 46" aria-hidden="true">
                {LAYOUT_SKETCH[option.key]}
              </svg>
            </span>
            <span className="ed-pick-label">{option.label}</span>
            <span className="ed-pick-note">{LAYOUT_NOTE[option.key]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Segmented tugmalar uchun kichik belgilar: ustunlar soni va quti kengligi */
export function ColumnsGlyph({ count }: { count: number }) {
  const w = (22 - (count - 1) * 2) / count;
  return (
    <svg viewBox="0 0 24 14" width="24" height="14" aria-hidden="true" className="ed-glyph">
      {Array.from({ length: count }, (_, k) => (
        <rect key={k} x={1 + k * (w + 2)} y="1" width={w} height="12" rx="1.5" />
      ))}
    </svg>
  );
}

export function SpanGlyph({ wide }: { wide: boolean }) {
  return (
    <svg viewBox="0 0 24 14" width="24" height="14" aria-hidden="true" className="ed-glyph">
      {wide ? (
        <>
          <rect x="1" y="1" width="14.5" height="12" rx="1.5" className="ed-glyph-on" />
          <rect x="17" y="1" width="6" height="12" rx="1.5" />
        </>
      ) : (
        <>
          <rect x="1" y="1" width="6.5" height="12" rx="1.5" className="ed-glyph-on" />
          <rect x="9" y="1" width="6.5" height="12" rx="1.5" />
          <rect x="17" y="1" width="6" height="12" rx="1.5" />
        </>
      )}
    </svg>
  );
}
