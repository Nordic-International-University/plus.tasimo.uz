import type { ReactNode } from 'react';
import type { Box, CtaKey, Locale, Path, PlusDoc, Text } from '@/lib/doc/types';

export type TextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'strong' | 'figcaption' | 'dt' | 'dd' | 'small';

export interface TextOpts {
  as?: TextTag;
  className?: string;
  /** Muharrirda Enter — yangi qator */
  multiline?: boolean;
  /** Muharrirda bo'sh maydon ko'rinishi */
  placeholder?: string;
}

export interface ImageOpts {
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Ota element o'lchamini to'liq egallaydi (ota — relative) */
  fill?: boolean;
  width?: number;
  height?: number;
}

export interface BoxOpts {
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'li' | 'article' | 'figure';
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light';

/**
 * Bo'lim komponentlari hook ishlatmaydi va client kod import qilmaydi — bir xil kod serverda (sayt, JS'siz) va
 * muharrirda (inline tahrirlash) render bo'ladi. Farq faqat shu kontekstda.
 */
export interface RenderCtx {
  locale: Locale;
  editing: boolean;
  doc: PlusDoc;
  t(value: Text | undefined): string;
  text(path: Path, value: Text | undefined, opts?: TextOpts): ReactNode;
  /** Tilga bog'liq bo'lmagan qisqa qiymat (raqam, kod): "4", "100%", "Q1–Q4" */
  plain(path: Path, value: string | undefined, opts?: TextOpts): ReactNode;
  image(path: Path, src: string | undefined, opts: ImageOpts): ReactNode;
  box(path: Path, box: Box, children: ReactNode, opts?: BoxOpts): ReactNode;
  /** Muharrirda «+ qo'shish» tugmasi, saytda — hech narsa */
  add(path: Path, label?: string): ReactNode;
  cta(key: CtaKey, opts: { sectionId: string; variant: ButtonVariant; className?: string; arrow?: boolean }): ReactNode;
  /**
   * Hujjatdagi havola (cta:register, #bo'lim, https://, mailto:): saytda <a> — «cta:» bo'lsa tugma manziliga olib boradi
   * va bosish kuzatiladi; muharrirda <span> (bosilganda sahifadan chiqib ketmasin).
   */
  link(href: string | undefined, children: ReactNode, opts?: { className?: string; sectionId?: string }): ReactNode;
  /** Bo'lim atrofidagi ramka: muharrirda — asboblar paneli, saytda — o'zi */
  frame(index: number, section: import('@/lib/doc/types').Section, node: ReactNode): ReactNode;
}

export interface SectionProps<S = import('@/lib/doc/types').Section> {
  section: S;
  /** hujjatdagi indeksi — yo'llar uchun ['sections', index, ...] */
  index: number;
  ctx: RenderCtx;
}
