'use client';

import { Copy, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { pick } from '@/lib/doc/normalize';
import { plainText } from '@/lib/doc/rich';
import { SECTION_META } from '@/lib/doc/presets';
import { useEditor } from './EditorContext';
import { GlobalSettings, type GlobalGroup } from './GlobalSettings';

export type SidebarTab = 'sections' | 'global';

/**
 * Chap panel: bo'limlar ro'yxati (sudrab tartiblash, yashirish, nusxa, o'chirish) va umumiy sozlamalar.
 * Tab va ochiq guruh Editor'da saqlanadi — panel yopilib-ochilsa ham, Inspector'dan «Umumiy → Tugmalar» bosilsa ham ishlaydi.
 */
export function Sidebar({
  onAddSection,
  tab,
  onTab,
  group,
  onGroup,
}: {
  onAddSection: (afterIndex: number) => void;
  tab: SidebarTab;
  onTab: (tab: SidebarTab) => void;
  group: GlobalGroup | null;
  onGroup: (group: GlobalGroup | null) => void;
}) {
  return (
    <aside className="ed-panel ed-panel-left" aria-label="Bo‘limlar">
      <div className="flex gap-1 border-b border-slate-100 p-3">
        {(
          [
            ['sections', 'Bo‘limlar'],
            ['global', 'Umumiy'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onTab(key)}
            className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-semibold', tab === key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100')}
          >
            {label}
          </button>
        ))}
      </div>
      <div data-ed-scroll className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {tab === 'sections' ? <SectionList onAddSection={onAddSection} /> : <GlobalSettings open={group} onOpen={onGroup} />}
      </div>
    </aside>
  );
}

function SectionList({ onAddSection }: { onAddSection: (afterIndex: number) => void }) {
  const editor = useEditor();
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const sections = editor.doc.sections;

  const scrollTo = (index: number) => {
    editor.select({ kind: 'section', index });
    document.querySelector(`[data-ed-section="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col gap-1 p-3">
      {sections.map((section, index) => {
        const meta = SECTION_META[section.type];
        const selected = editor.selection?.index === index;
        const title = plainText(pick(section.title, editor.locale)) || meta.label;
        return (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDragFrom(index)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(index);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragFrom !== null && dragFrom !== index) editor.move(['sections'], dragFrom, index);
              setDragFrom(null);
              setDragOver(null);
            }}
            className={cn(
              'group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border px-2 py-2 transition',
              selected ? 'border-[#2c5fd8]/50 bg-[#2c5fd8]/[0.06]' : 'border-transparent hover:bg-slate-50',
              dragOver === index && dragFrom !== index && 'border-dashed border-slate-400',
              section.hidden && 'opacity-55',
            )}
          >
            <GripVertical size={15} className="cursor-grab text-slate-300 group-hover:text-slate-500" />
            <button type="button" onClick={() => scrollTo(index)} className="flex min-w-0 flex-col items-start overflow-hidden text-left" title={title}>
              <span className="block w-full truncate text-sm font-semibold text-slate-800">{title.replace(/\s*\n\s*/g, ' ')}</span>
              <span className="block w-full truncate text-[0.7rem] text-slate-400">
                {meta.label}
                {section.anchor ? ` · #${section.anchor}` : ''}
              </span>
            </button>
            <span className="flex items-center">
              <button
                type="button"
                className="ed-tool ed-tool-light hidden group-hover:inline-grid"
                title="Nusxa olish"
                onClick={() => editor.duplicate(['sections'], index)}
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                className="ed-tool ed-tool-light ed-tool-danger hidden group-hover:inline-grid"
                title="O‘chirish (pastda «Qaytarish» chiqadi)"
                onClick={() => editor.removeWithUndo(['sections'], index, `«${meta.label}» bo‘limi o‘chirildi`)}
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                className="ed-tool ed-tool-light"
                title={section.hidden ? 'Saytda ko‘rsatish' : 'Saytda yashirish'}
                onClick={() => editor.setValue(['sections', index, 'hidden'], !section.hidden)}
              >
                {section.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
          </div>
        );
      })}
      <button type="button" onClick={() => onAddSection(editor.selection?.index ?? sections.length - 1)} className="ed-add mt-2 w-full text-slate-600">
        <Plus size={16} /> Bo‘lim qo‘shish
      </button>
      <p className="px-1 pt-2 text-xs leading-relaxed text-slate-400">
        Sudrab tartibini o‘zgartiring. Yashirilgan bo‘lim muharrirda xira ko‘rinadi, saytda chiqmaydi. O‘zgarishlar avtomatik saqlanadi, saytga «E’lon qilish» bilan chiqadi.
      </p>
    </div>
  );
}
