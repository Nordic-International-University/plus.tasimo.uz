'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Box, Path } from '@/lib/doc/types';
import type { BoxOpts } from '../sections/ctx';
import { boxKey, useEditor } from './EditorContext';

export const DRAG_MIME = 'application/x-plus-box';

/**
 * Quti ramkasi: chegarasi va sudrab tashlashni qabul qilish. Asboblar (sudrash, chapga/o'ngga, sozlash, nusxa,
 * o'chirish) quti ichida emas — BoxToolbar kanvas ustida qutining tepasida chiqadi va matnni yopmaydi.
 * Sudrab ko'chirish faqat o'sha ro'yxat ichida (bir bo'limning qutilari).
 */
export function BoxFrame({ path, box, children, opts }: { path: Path; box: Box; children: ReactNode; opts: BoxOpts }) {
  const editor = useEditor();
  const [over, setOver] = useState<'before' | 'after' | null>(null);

  const arrayPath = path.slice(0, -1);
  const index = path[path.length - 1] as number;
  const sectionIndex = path[1] as number;
  const list = (editor.doc.sections[sectionIndex]?.items ?? []) as Box[];
  const selected = editor.selection?.kind === 'box' && editor.selection.index === sectionIndex && editor.selection.box === index;
  const arrayKey = arrayPath.join('.');
  const key = boxKey(path);
  const { registerBox } = editor;
  const ref = useCallback((el: HTMLElement | null) => registerBox(key, el), [registerBox, key]);

  const Tag = (opts.as ?? 'div') as 'div';
  return (
    <Tag
      ref={ref}
      className={cn(
        'box ed-box',
        box.shape && `shape-${box.shape}`,
        box.accent && `accent-${box.accent}`,
        opts.className,
        selected && 'ed-selected',
        over === 'before' && 'ed-drop-before',
        over === 'after' && 'ed-drop-after',
      )}
      style={opts.style}
      onMouseEnter={() => editor.hoverBox(path)}
      onMouseLeave={() => editor.hoverBox(null)}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes(DRAG_MIME)) return;
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const horizontal = rect.width > rect.height * 0.9;
        const before = horizontal ? event.clientX < rect.left + rect.width / 2 : event.clientY < rect.top + rect.height / 2;
        setOver(before ? 'before' : 'after');
      }}
      onDragLeave={() => setOver(null)}
      onDrop={(event) => {
        event.preventDefault();
        const position = over;
        setOver(null);
        try {
          const data = JSON.parse(event.dataTransfer.getData(DRAG_MIME)) as { arrayKey: string; index: number };
          if (data.arrayKey !== arrayKey || data.index === index) return;
          let to = position === 'after' ? index + 1 : index;
          if (data.index < to) to -= 1;
          editor.move(arrayPath, data.index, Math.max(0, Math.min(to, list.length - 1)));
        } catch {
          // boshqa narsa tashlandi
        }
      }}
      onClick={(event) => {
        event.stopPropagation();
        editor.select({ kind: 'box', index: sectionIndex, box: index });
      }}
    >
      {children}
    </Tag>
  );
}
