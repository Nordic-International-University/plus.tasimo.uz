'use client';

import { Bold, Check, ChevronDown, Italic, Plus, Underline } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { isSafeGradient, marksInRange, parseRich, RICH_COLORS, RICH_GRADIENTS, type RichOp } from '@/lib/doc/rich';
import { applyRichToElement, domToRich, getSelectionOffsets, rangeFromOffsets, setSelectionOffsets } from './rich-dom';

/**
 * Belgilangan matn ustidagi panel: qalin / kursiv / tagiga chizilgan / oddiy, rang va gradient.
 * Sahifadagi istalgan formatli matnda (InlineText, data-rich) ishlaydi. Tugmalar mousedown'da fokusni olmaydi —
 * belgilash joyida qoladi; rang tanlagichi (input type=color) fokusni oladi, shuning uchun nishon (element + o'rin)
 * oldindan saqlanadi va oyna ochiq turganda panel joyidan qo'zg'almaydi.
 */

interface Target {
  el: HTMLElement;
  start: number;
  end: number;
}

type ActiveMarks = ReturnType<typeof marksInRange>;
type Pop = 'color' | 'gradient';

const GAP = 10;
const BAR_H = 42;
/** Muharrirning yuqori paneli — undan tepaga chiqmasin */
const TOP_LIMIT = 70;

const gradientCss = (value: string) => {
  const [a, b] = value.split(',');
  return `linear-gradient(90deg, ${a}, ${b})`;
};

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/** Gradient namunasi och bo'lsa (oqqa boradigan) — to'q fonda ko'rsatamiz */
const isLightGradient = (value: string) => value.split(',').every((color) => luminance(color) > 0.62);

function GradientText({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const [g1, g2] = value.split(',');
  return (
    <span className={cn('rt-grad', className)} style={{ '--g1': g1, '--g2': g2 } as CSSProperties}>
      {children}
    </span>
  );
}

export function TextFormatBar() {
  const [target, setTarget] = useState<Target | null>(null);
  const [marks, setMarks] = useState<ActiveMarks | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);
  const [popover, setPopover] = useState<Pop | null>(null);
  const [popUp, setPopUp] = useState(false);
  const [shift, setShift] = useState(0);
  const [custom, setCustom] = useState<[string, string]>(['#2c5fd8', '#7c5cff']);
  const barRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Target | null>(null);
  const popoverRef = useRef<Pop | null>(null);
  const pointerDown = useRef(false);

  useLayoutEffect(() => {
    targetRef.current = target;
    popoverRef.current = popover;
  }, [target, popover]);

  const measure = useCallback((t: Target) => {
    const rect = rangeFromOffsets(t.el, t.start, t.end).getBoundingClientRect();
    if (rect.bottom < TOP_LIMIT - 20 || rect.top > window.innerHeight) return null;
    const below = rect.top - BAR_H - GAP < TOP_LIMIT;
    return { x: rect.left + rect.width / 2, y: below ? rect.bottom + GAP : rect.top - GAP, below };
  }, []);

  const show = useCallback(
    (t: Target | null) => {
      if (!t || !t.el.isConnected) {
        targetRef.current = null;
        setTarget(null);
        setPos(null);
        setMarks(null);
        return;
      }
      targetRef.current = t;
      setTarget(t);
      setMarks(marksInRange(parseRich(domToRich(t.el)), t.start, t.end));
      setPos(measure(t));
    },
    [measure],
  );

  const evaluate = useCallback(() => {
    if (popoverRef.current) return; // rang tanlanayotganda panel joyida turadi
    const selection = document.getSelection();
    const node = selection?.anchorNode ?? null;
    const element = node ? (node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement) : null;
    const host = element?.closest<HTMLElement>('.ed-text[data-rich]') ?? null;
    if (!host || !selection || selection.isCollapsed || document.activeElement !== host) return show(null);
    const offsets = getSelectionOffsets(host);
    if (!offsets || offsets.end <= offsets.start) return show(null);
    show({ el: host, ...offsets });
  }, [show]);

  useEffect(() => {
    const onSelection = () => {
      // Sichqoncha bilan belgilash davom etayotganda panel sakramasin — qo'yib yuborilganda chiqadi
      if (!pointerDown.current) evaluate();
    };
    const onDown = (event: MouseEvent) => {
      if (barRef.current?.contains(event.target as Node)) return;
      pointerDown.current = true;
      if (popoverRef.current) {
        popoverRef.current = null;
        setPopover(null);
      }
    };
    const onUp = () => {
      if (!pointerDown.current) return;
      pointerDown.current = false;
      requestAnimationFrame(evaluate);
    };
    const onFocus = (event: FocusEvent) => {
      if (!barRef.current?.contains(event.target as Node)) evaluate();
    };
    const onMove = () => {
      const t = targetRef.current;
      if (t) setPos(t.el.isConnected ? measure(t) : null);
    };
    document.addEventListener('selectionchange', onSelection);
    document.addEventListener('mousedown', onDown, true);
    document.addEventListener('mouseup', onUp, true);
    document.addEventListener('focusin', onFocus);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('selectionchange', onSelection);
      document.removeEventListener('mousedown', onDown, true);
      document.removeEventListener('mouseup', onUp, true);
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [evaluate, measure]);

  // Esc — oynani yopib, belgilashni qaytarish
  useEffect(() => {
    if (!popover) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setPopover(null);
      const t = targetRef.current;
      if (t?.el.isConnected) {
        t.el.focus({ preventScroll: true });
        setSelectionOffsets(t.el, t.start, t.end);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [popover]);

  // Gorizontal: ekran chetidan chiqmasin. Oyna: matnni yopmaslik uchun matndan uzoq tomonga, joy bo'lmasa — teskari
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar || !pos) return;
    const width = bar.offsetWidth;
    const left = pos.x - width / 2;
    setShift(left < 8 ? 8 - left : left + width > window.innerWidth - 8 ? window.innerWidth - 8 - (left + width) : 0);
    const pop = popRef.current;
    if (pop) setPopUp(!pos.below && pos.y - BAR_H - pop.offsetHeight - 10 > 8);
  }, [pos, popover, marks]);

  const apply = (op: RichOp, opts: { focus?: boolean; key?: string; close?: boolean } = {}) => {
    const t = targetRef.current;
    if (!t || !t.el.isConnected) {
      setPopover(null);
      show(null);
      return;
    }
    applyRichToElement(t.el, t.start, t.end, op, { focus: opts.focus ?? true, key: opts.key });
    if (opts.close) {
      popoverRef.current = null;
      setPopover(null);
    }
    show(t);
  };

  const toggle = (next: Pop) => {
    const value = popover === next ? null : next;
    popoverRef.current = value;
    setPopover(value);
  };

  if (!target || !pos || !marks) return null;
  const host = typeof document !== 'undefined' ? (document.querySelector('.ed-root') ?? document.body) : null;
  if (!host) return null;

  const colorBar = marks.c ?? (marks.g ? undefined : 'currentColor');

  return createPortal(
    <div
      ref={barRef}
      className="ed-format-bar"
      role="toolbar"
      aria-label="Matnni formatlash"
      style={{ left: pos.x, top: pos.y, transform: `translate(calc(-50% + ${shift}px), ${pos.below ? '0' : '-100%'})` }}
      onMouseDown={(event) => {
        // Tugma bosilganda matndagi belgilash yo'qolmasin (rang tanlagichi bundan mustasno — u fokus oladi)
        if (!(event.target as HTMLElement).closest('input')) event.preventDefault();
      }}
    >
      <button type="button" className="ed-fmt-btn" aria-pressed={marks.b} title="Qalin (Ctrl+B)" onClick={() => apply({ type: 'toggle', mark: 'b' })}>
        <Bold size={16} strokeWidth={2.8} />
      </button>
      <button type="button" className="ed-fmt-btn" aria-pressed={marks.i} title="Kursiv (Ctrl+I)" onClick={() => apply({ type: 'toggle', mark: 'i' })}>
        <Italic size={16} strokeWidth={2.4} />
      </button>
      <button type="button" className="ed-fmt-btn" aria-pressed={marks.u} title="Tagiga chizilgan (Ctrl+U)" onClick={() => apply({ type: 'toggle', mark: 'u' })}>
        <Underline size={16} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        className="ed-fmt-btn ed-fmt-word"
        aria-pressed={marks.regular}
        title="Oddiy — qalin, kursiv va tagiga chizish olib tashlanadi (rang qoladi)"
        onClick={() => apply({ type: 'regular' })}
      >
        Oddiy
      </button>
      <span className="ed-fmt-sep" aria-hidden="true" />
      <button type="button" className={cn('ed-fmt-btn', popover === 'color' && 'is-open')} aria-expanded={popover === 'color'} title="Matn rangi" onClick={() => toggle('color')}>
        <span className="ed-fmt-a" aria-hidden="true">
          A
          <span className="ed-fmt-a-bar" style={colorBar ? { background: colorBar } : { backgroundImage: gradientCss(marks.g as string) }} />
        </span>
        Rang
        <ChevronDown size={13} className={cn('transition', popover === 'color' && 'rotate-180')} />
      </button>
      <button type="button" className={cn('ed-fmt-btn', popover === 'gradient' && 'is-open')} aria-expanded={popover === 'gradient'} title="Gradient rang" onClick={() => toggle('gradient')}>
        <span className="ed-fmt-grad-icon" aria-hidden="true" style={{ backgroundImage: gradientCss(marks.g ?? RICH_GRADIENTS[1].value) }} />
        Gradient
        <ChevronDown size={13} className={cn('transition', popover === 'gradient' && 'rotate-180')} />
      </button>

      {popover === 'color' && (
        <div ref={popRef} className={cn('ed-fmt-pop', popUp && 'ed-fmt-pop-up')} role="dialog" aria-label="Matn rangi">
          <div className="ed-fmt-pop-title">Matn rangi</div>
          <div className="ed-fmt-swatches">
            {RICH_COLORS.map((color) => {
              const active = marks.c === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  className={cn('ed-fmt-swatch', active && 'is-active')}
                  title={color.label}
                  aria-pressed={active}
                  onClick={() => apply({ type: 'color', value: color.value }, { close: true })}
                >
                  <span className={cn('ed-fmt-dot', luminance(color.value) > 0.8 && 'ed-fmt-dot-light')} style={{ background: color.value }}>
                    {active && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="ed-fmt-swatch-label">{color.label.replace(/\s*\(.*\)$/, '')}</span>
                </button>
              );
            })}
            <label className="ed-fmt-swatch" title="Istalgan rang">
              <span className="ed-fmt-dot ed-fmt-dot-any">
                <Plus size={14} strokeWidth={3} />
              </span>
              <span className="ed-fmt-swatch-label">Boshqa</span>
              <input
                type="color"
                className="ed-fmt-color-input"
                value={marks.c ?? '#2c5fd8'}
                aria-label="Istalgan rang"
                onChange={(event) => apply({ type: 'color', value: event.target.value.toLowerCase() }, { focus: false, key: 'color-custom' })}
              />
            </label>
          </div>
          <button type="button" className="ed-fmt-reset" disabled={!marks.c} onClick={() => apply({ type: 'color', value: null }, { close: true })}>
            <span className="ed-fmt-dot ed-fmt-dot-none" aria-hidden="true" />
            Asl rang (bo‘limdagi kabi)
          </button>
        </div>
      )}

      {popover === 'gradient' && (
        <div ref={popRef} className={cn('ed-fmt-pop', popUp && 'ed-fmt-pop-up')} role="dialog" aria-label="Gradient rang">
          <div className="ed-fmt-pop-title">Gradient rang</div>
          <div className="ed-fmt-grads">
            {RICH_GRADIENTS.map((gradient) => {
              const active = marks.g === gradient.value;
              return (
                <button
                  key={gradient.value}
                  type="button"
                  className={cn('ed-fmt-grad', active && 'is-active')}
                  aria-pressed={active}
                  title={gradient.label}
                  onClick={() => apply({ type: 'gradient', value: gradient.value }, { close: true })}
                >
                  <span className={cn('ed-fmt-grad-sample', isLightGradient(gradient.value) && 'ed-fmt-grad-dark')}>
                    <GradientText value={gradient.value}>Aa</GradientText>
                  </span>
                  <span className="ed-fmt-swatch-label">{gradient.label.replace(/\s*\(.*\)$/, '')}</span>
                </button>
              );
            })}
          </div>
          <div className="ed-fmt-pop-sub">O‘zingiz tanlang</div>
          <div className="ed-fmt-custom-grad">
            <label className="ed-fmt-well" style={{ background: custom[0] }} title="Boshlanish rangi">
              <input type="color" className="ed-fmt-color-input" value={custom[0]} aria-label="Boshlanish rangi" onChange={(event) => setCustom([event.target.value.toLowerCase(), custom[1]])} />
            </label>
            <span className="ed-fmt-grad-preview">
              <GradientText value={`${custom[0]},${custom[1]}`}>Matn</GradientText>
            </span>
            <label className="ed-fmt-well" style={{ background: custom[1] }} title="Oxirgi rang">
              <input type="color" className="ed-fmt-color-input" value={custom[1]} aria-label="Oxirgi rang" onChange={(event) => setCustom([custom[0], event.target.value.toLowerCase()])} />
            </label>
            <button
              type="button"
              className="ed-fmt-apply"
              onClick={() => {
                const value = `${custom[0]},${custom[1]}`;
                if (isSafeGradient(value)) apply({ type: 'gradient', value }, { close: true });
              }}
            >
              Qo‘llash
            </button>
          </div>
          <button type="button" className="ed-fmt-reset" disabled={!marks.g} onClick={() => apply({ type: 'gradient', value: null }, { close: true })}>
            <span className="ed-fmt-dot ed-fmt-dot-none" aria-hidden="true" />
            Gradientni olib tashlash
          </button>
        </div>
      )}
    </div>,
    host,
  );
}
