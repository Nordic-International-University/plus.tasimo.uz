'use client';

import { ArrowLeft, ArrowRight, Copy, GripVertical, Settings2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { SECTION_META } from '@/lib/doc/presets';
import type { Path } from '@/lib/doc/types';
import { DRAG_MIME } from './BoxFrame';
import { useEditor } from './EditorContext';

const GAP = 8;
const TOOLBAR_H = 34;

/**
 * Quti asboblari — kanvas ustidagi alohida qatlamda, qutining tepasida (joy bo'lmasa — ostida, o'ng chetga tekis).
 * Quti ichida bo'lmagani uchun kichik kartalarda matnni yopmaydi va overflow:hidden ota elementlar uni kesmaydi.
 */
export function BoxToolbar({
  target,
  wrapRef,
  getElement,
  onPointer,
}: {
  /** Sichqoncha ostidagi yoki tanlangan quti */
  target: Path | null;
  wrapRef: RefObject<HTMLDivElement | null>;
  getElement: (path: Path) => HTMLElement | null;
  /** Sichqoncha paneldami — quti «tark etilgan» deb yashirilmasin */
  onPointer: (inside: boolean) => void;
}) {
  const editor = useEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const place = useCallback(() => {
    const wrap = wrapRef.current;
    const el = target ? getElement(target) : null;
    const bar = toolbarRef.current;
    if (!wrap || !el || !el.isConnected) {
      setPos(null);
      return;
    }
    const wrapRect = wrap.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const width = bar?.offsetWidth ?? 220;
    const top = rect.top - wrapRect.top + wrap.scrollTop;
    const roomAbove = rect.top - wrapRect.top > TOOLBAR_H + GAP + 4;
    const y = roomAbove ? top - TOOLBAR_H - GAP : top + rect.height + GAP;
    const x = Math.min(Math.max(8, rect.right - wrapRect.left - width), wrap.clientWidth - width - 8);
    setPos({ top: y, left: x });
  }, [getElement, target, wrapRef]);

  useLayoutEffect(() => {
    place();
  }, [place, editor.doc]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !target) return;
    const el = getElement(target);
    const observer = el ? new ResizeObserver(place) : null;
    if (el) observer?.observe(el);
    wrap.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      observer?.disconnect();
      wrap.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
    };
  }, [getElement, place, target, wrapRef]);

  if (!target) return null;
  const sectionIndex = target[1] as number;
  const index = target[target.length - 1] as number;
  const arrayPath = target.slice(0, -1);
  const section = editor.doc.sections[sectionIndex];
  if (!section || !section.items[index]) return null;
  const total = section.items.length;
  const label = `${SECTION_META[section.type].boxLabel || 'Quti'} ${index + 1}`;

  return (
    <div
      ref={toolbarRef}
      className="ed-box-toolbar"
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, visibility: pos ? 'visible' : 'hidden' }}
      onMouseEnter={() => onPointer(true)}
      onMouseLeave={() => onPointer(false)}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="ed-box-toolbar-label">{label}</span>
      <button
        type="button"
        className="ed-tool cursor-grab"
        title="Sudrab boshqa joyga qo‘ying"
        draggable
        onDragStart={(event) => {
          const el = getElement(target);
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData(DRAG_MIME, JSON.stringify({ arrayKey: arrayPath.join('.'), index }));
          if (el) event.dataTransfer.setDragImage(el, 24, 24);
        }}
      >
        <GripVertical size={15} />
      </button>
      <button type="button" className="ed-tool" title="Oldinga" disabled={index === 0} onClick={() => editor.move(arrayPath, index, index - 1)}>
        <ArrowLeft size={15} />
      </button>
      <button type="button" className="ed-tool" title="Keyinga" disabled={index >= total - 1} onClick={() => editor.move(arrayPath, index, index + 1)}>
        <ArrowRight size={15} />
      </button>
      <button type="button" className="ed-tool" title="Sozlash (shakl, ikonka, havola…)" onClick={() => editor.select({ kind: 'box', index: sectionIndex, box: index })}>
        <Settings2 size={15} />
      </button>
      <button type="button" className="ed-tool" title="Nusxa olish" onClick={() => editor.duplicate(arrayPath, index)}>
        <Copy size={15} />
      </button>
      <button type="button" className="ed-tool ed-tool-danger" title="O‘chirish" onClick={() => editor.removeWithUndo(arrayPath, index, `${label} o‘chirildi`)}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}
