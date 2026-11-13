'use client';

import { createContext, useContext } from 'react';
import type { Locale, Path, PlusDoc } from '@/lib/doc/types';

export type Selection = { kind: 'section'; index: number } | { kind: 'box'; index: number; box: number } | null;

export interface EditorApi {
  doc: PlusDoc;
  locale: Locale;
  /** Joriy tildagi matn */
  setText(path: Path, value: string): void;
  /** Har qanday qiymat */
  setValue(path: Path, value: unknown, coalesceKey?: string): void;
  move(arrayPath: Path, from: number, to: number): void;
  insert(arrayPath: Path, index: number, item: unknown): void;
  remove(arrayPath: Path, index: number): void;
  duplicate(arrayPath: Path, index: number): void;
  /** O'chirish + pastda «Qaytarish» tugmali xabar (brauzer confirm oynasi ishlatilmaydi) */
  removeWithUndo(arrayPath: Path, index: number, message: string): void;
  selection: Selection;
  select(selection: Selection): void;
  openImage(path: Path): void;
  /** Kanvasdagi quti elementi (asboblar paneli joylashuvi uchun) */
  registerBox(key: string, el: HTMLElement | null): void;
  /**
   * Sichqoncha ostidagi quti — asboblar paneli shunga chiqadi (null — biroz kutib yashiriladi).
   * Holat kontekstda emas: hover har o'zgarganda butun sahifa qayta chizilmasin.
   */
  hoverBox(path: Path | null): void;
}

export const boxKey = (path: Path) => path.join('.');

export const EditorContext = createContext<EditorApi | null>(null);

export function useEditor(): EditorApi {
  const api = useContext(EditorContext);
  if (!api) throw new Error('EditorContext topilmadi');
  return api;
}
