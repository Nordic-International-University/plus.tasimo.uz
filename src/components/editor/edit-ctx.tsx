'use client';

import { ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { pick } from '@/lib/doc/normalize';
import { SECTION_META } from '@/lib/doc/presets';
import { plainText } from '@/lib/doc/rich';
import type { Locale, Path, PlusDoc, Text } from '@/lib/doc/types';
import type { RenderCtx } from '../sections/ctx';
import { BUTTON_CLASS } from '../sections/view-ctx';
import { BoxFrame } from './BoxFrame';
import { EditableImage } from './EditableImage';
import type { EditorApi } from './EditorContext';
import { InlineText } from './InlineText';
import { SectionFrame } from './SectionFrame';

/**
 * Muharrirdagi kontekst — bo'lim komponentlari o'zgarmaydi, faqat matn/rasm/quti tahrirlanadigan bo'ladi.
 * Bo'sh matnlar ham joy belgisi bilan ko'rinadi (to'ldirish uchun).
 */
export function createEditCtx(doc: PlusDoc, locale: Locale, api: Pick<EditorApi, 'insert'>): RenderCtx {
  const t = (value: Text | undefined) => plainText(pick(value, locale));
  return {
    locale,
    editing: true,
    doc,
    t,
    text(path, value, opts = {}) {
      return (
        <InlineText
          key={`${path.join('.')}:${locale}`}
          path={path}
          value={value?.[locale] ?? ''}
          as={opts.as}
          className={opts.className}
          multiline={opts.multiline}
          placeholder={opts.placeholder ?? 'Matn'}
        />
      );
    },
    plain(path, value, opts = {}) {
      return <InlineText key={path.join('.')} path={path} value={value ?? ''} as={opts.as} className={opts.className} placeholder={opts.placeholder} plain />;
    },
    image(path, src, opts) {
      return <EditableImage path={path} src={src} opts={opts} />;
    },
    box(path, box, children, opts = {}) {
      return (
        <BoxFrame path={path} box={box} opts={opts}>
          {children}
        </BoxFrame>
      );
    },
    add(path: Path, label) {
      const sectionIndex = path[1] as number;
      const section = doc.sections[sectionIndex];
      if (!section) return null;
      const meta = SECTION_META[section.type];
      return (
        <button
          type="button"
          className="ed-add"
          onClick={(event) => {
            event.stopPropagation();
            api.insert(path, section.items.length, meta.newBox());
          }}
        >
          <Plus size={16} /> {label ?? meta.boxLabel ?? 'Qo‘shish'}
        </button>
      );
    },
    cta(key, { variant, className, arrow }) {
      const link = doc.ctas[key];
      return (
        <span className={cn(BUTTON_CLASS[variant], className, 'cursor-text')} title={`Havola: ${link?.href ?? ''} (Umumiy → Tugmalar)`}>
          <InlineText key={`cta:${key}:${locale}`} path={['ctas', key, 'label']} value={link?.label?.[locale] ?? ''} placeholder="Tugma" />
          {arrow && <ArrowRight size={18} aria-hidden="true" />}
        </span>
      );
    },
    link(href, children, opts = {}) {
      // Muharrirda havola bosilganda sahifadan chiqib ketmasin — manzil «Umumiy» panelida o'zgaradi
      return (
        <span className={opts.className} title={href ? `Havola: ${href}` : 'Havola yo‘q'}>
          {children}
        </span>
      );
    },
    frame(index, section, node) {
      return (
        <SectionFrame index={index} section={section}>
          {node}
        </SectionFrame>
      );
    },
  };
}
