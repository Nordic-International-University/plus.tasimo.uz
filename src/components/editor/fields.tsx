'use client';

import { ArrowUpRight, Link2, MousePointerClick, PanelTop } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ctaLink, ctaOfLink, linkKind, type LinkKind } from '@/lib/doc/links';
import { pick } from '@/lib/doc/normalize';
import { editPlain, hasMarks, plainText } from '@/lib/doc/rich';
import { SECTION_META } from '@/lib/doc/presets';
import { CTA_KEYS, type PlusDoc, type Text } from '@/lib/doc/types';

/** Panel ichidagi kichik forma elementlari (muharrir interfeysi o'zbekcha) */

export const CTA_LABEL = { register: 'Ro‘yxatdan o‘tish', participate: 'Olimpiadada qatnashish', login: 'Kirish' } as const;

export function Field({ label, hint, children, error }: { label: string; hint?: ReactNode; children: ReactNode; error?: string | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.72rem] font-bold tracking-wide text-slate-500 uppercase">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : hint ? <span className="text-xs leading-relaxed text-slate-400">{hint}</span> : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'datetime-local';
  className?: string;
  invalid?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      onChange={(event) => onChange(event.target.value)}
      className={cn('ed-input', className)}
    />
  );
}

/** Ikki tildagi matn — EN va RU ustma-ust; til belgisi chapda alohida ustun (matn ostiga tushmaydi) */
/**
 * Ikki tilli matn maydoni. Sahifadagi matnlar formatli (qalin, rang, gradient — sahifada belgilab qo'yiladi):
 * bu yerda toza matn ko'rinadi, tahrir esa formatni saqlaydi (editPlain). `plain` — SEO kabi oddiy matnlar.
 */
export function TextPair({
  value,
  onChange,
  multiline,
  plain,
}: {
  value: Text | undefined;
  onChange: (value: Text) => void;
  multiline?: boolean;
  plain?: boolean;
}) {
  const current: Text = { en: value?.en ?? '', ru: value?.ru ?? '' };
  const shown = (code: 'en' | 'ru') => (plain ? current[code] : plainText(current[code]));
  const change = (code: 'en' | 'ru', next: string) => onChange({ ...current, [code]: plain ? next : editPlain(current[code], next) });
  const formatted = !plain && (hasMarks(current.en) || hasMarks(current.ru));
  return (
    <div className="flex flex-col gap-2">
      {(['en', 'ru'] as const).map((code) => (
        <label key={code} className="ed-lang">
          <span className="ed-lang-tag" aria-hidden="true">
            {code.toUpperCase()}
          </span>
          {multiline ? (
            <textarea
              value={shown(code)}
              rows={3}
              aria-label={code === 'en' ? 'Inglizcha' : 'Ruscha'}
              onChange={(event) => change(code, event.target.value)}
              className="ed-lang-input"
            />
          ) : (
            <input
              value={shown(code)}
              aria-label={code === 'en' ? 'Inglizcha' : 'Ruscha'}
              onChange={(event) => change(code, event.target.value)}
              className="ed-lang-input"
            />
          )}
        </label>
      ))}
      {formatted && (
        <p className="ed-rich-note">Matnda formatlash bor (qalin, rang…) — bu yerda tahrirlasangiz ham saqlanadi. Formatni sahifada matnni belgilab o‘zgartirasiz.</p>
      )}
    </div>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          title={option.title}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap transition',
            value === option.value ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-left text-sm font-medium text-slate-700">
      {label}
      <span className={cn('relative h-6 w-10 shrink-0 rounded-full transition', checked ? 'bg-[#2c5fd8]' : 'bg-slate-300')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', checked ? 'left-[18px]' : 'left-0.5')} />
      </span>
    </button>
  );
}

/** Formatlash qayerda: sahifadagi matnni belgilash (o'ng panelda — faqat toza matn) */
export function RichHint() {
  return (
    <div className="ed-rich-hint">
      <span className="ed-rich-hint-chips" aria-hidden="true">
        <b>B</b>
        <i>I</i>
        <u>U</u>
        <span className="rt-grad" style={{ '--g1': '#2c5fd8', '--g2': '#7c5cff' } as CSSProperties}>
          A
        </span>
      </span>
      <span>Qalin, kursiv, tagiga chizish, rang va gradient — sahifadagi matnni sichqoncha bilan belgilang, panel chiqadi.</span>
    </div>
  );
}

export function PanelSection({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-slate-100 px-5 py-6 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Tashqi havola tekshiruvi (saytdagi safeUrl bilan bir xil qoidalar) */
export function externalLinkError(href: string): string | null {
  const value = href.trim();
  if (!value) return null;
  if (/^mailto:[^\s<>"']{3,200}$/i.test(value) || /^tel:\+?[0-9 ()-]{3,30}$/i.test(value)) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? null : 'Faqat https://, mailto: yoki tel:';
  } catch {
    return 'To‘liq havola kiriting: https://…';
  }
}

/** Tor joyda (footer ustuni ichidagi havola, ~233px) ikonkalar yashirinadi — uchala tugma bir qatorda qoladi (ikonka bilan 245px kerak) */
const KIND_ICON = 'shrink-0 @max-[15.5rem]:hidden';

const KIND_OPTIONS: { value: LinkKind; label: ReactNode; title: string }[] = [
  { value: 'cta', label: <><MousePointerClick size={13} className={KIND_ICON} /> Tugma</>, title: 'Ro‘yxatdan o‘tish / qatnashish / kirish — account’ga, bosish kuzatiladi' },
  { value: 'section', label: <><PanelTop size={13} className={KIND_ICON} /> Bo‘lim</>, title: 'Shu sahifadagi bo‘limga o‘tadi' },
  { value: 'url', label: <><Link2 size={13} className={KIND_ICON} /> Havola</>, title: 'Boshqa sayt, email yoki telefon' },
];

/**
 * Havola maydoni: avval turi tanlanadi — tugma manzili (Umumiy → Tugmalar dagi account havolasi, bosish voronkada
 * sanaladi), sahifadagi bo'lim (#anchor — ro'yxatdan) yoki tashqi havola. Qo'lda yozilgan account manzili o'rniga
 * «Tugma» turini tanlash kerak — shunda havola bitta joyda o'zgaradi va kuzatuv buzilmaydi.
 */
export function LinkField({ doc, value, onChange, locale }: { doc: PlusDoc; value: string; onChange: (value: string) => void; locale: 'en' | 'ru' }) {
  const kind = linkKind(value);
  const cta = ctaOfLink(value);
  const anchors = doc.sections.filter((section) => section.anchor);
  const error = kind === 'url' ? externalLinkError(value) : null;

  const switchKind = (next: LinkKind) => {
    if (next === kind) return;
    if (next === 'cta') onChange(ctaLink('register'));
    else if (next === 'section') onChange(anchors[0] ? `#${anchors[0].anchor}` : '#');
    else onChange('');
  };

  return (
    <div className="@container flex flex-col gap-2">
      <Segmented value={kind} options={KIND_OPTIONS} onChange={switchKind} />
      {kind === 'cta' && (
        <>
          <select className="ed-input" value={cta ?? 'register'} onChange={(event) => onChange(ctaLink(event.target.value as (typeof CTA_KEYS)[number]))}>
            {CTA_KEYS.map((key) => (
              <option key={key} value={key}>
                {CTA_LABEL[key]}
              </option>
            ))}
          </select>
          <span className="flex items-start gap-1 text-xs leading-relaxed text-slate-400">
            <ArrowUpRight size={13} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-all">{doc.ctas[cta ?? 'register'].href} — manzil «Tugmalar» bo‘limida, bosish voronkada sanaladi</span>
          </span>
        </>
      )}
      {kind === 'section' && (
        <select className="ed-input" value={value} onChange={(event) => onChange(event.target.value)}>
          {!anchors.some((section) => `#${section.anchor}` === value) && <option value={value}>{value || '#'} (topilmadi)</option>}
          {anchors.map((section) => (
            <option key={section.id} value={`#${section.anchor}`}>
              {plainText(pick(section.title, locale)) || SECTION_META[section.type].label} — #{section.anchor}
            </option>
          ))}
        </select>
      )}
      {kind === 'url' && (
        <>
          <TextInput value={value} onChange={(next) => onChange(next.trim())} placeholder="https://… / mailto:… / tel:…" invalid={Boolean(error)} />
          {error && <span className="text-xs text-red-600">{error}</span>}
        </>
      )}
    </div>
  );
}
