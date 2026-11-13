'use client';

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Settings2, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SECTION_META } from '@/lib/doc/presets';
import type { Background, Section } from '@/lib/doc/types';
import { useEditor } from './EditorContext';
import { BG_INFO, variantTone } from './preset-info';
import { PresetThumb } from './PresetThumb';
import { BackgroundOptions, BgSwatch, ToolbarPicker, VariantOptions } from './SectionPickers';

/** Fon nomlari (eski import'lar uchun) — manba: preset-info.ts BG_INFO */
export const BG_LABEL: Record<Background, string> = Object.fromEntries(Object.entries(BG_INFO).map(([key, info]) => [key, info.label])) as Record<Background, string>;

/**
 * Bo'lim ramkasi: tepasida asboblar — dizayn varianti va fon (eskizli tanlagichlar), tartib, yashirish, nusxa, o'chirish.
 * Tanlagich ochiq turganda asboblar yashirinmaydi (is-open).
 */
export function SectionFrame({ index, section, children }: { index: number; section: Section; children: ReactNode }) {
  const editor = useEditor();
  const meta = SECTION_META[section.type];
  const total = editor.doc.sections.length;
  const selected = editor.selection?.kind === 'section' && editor.selection.index === index;
  const path = ['sections', index];
  const [open, setOpen] = useState<'variant' | 'bg' | null>(null);
  const currentVariant = meta.variants.find((variant) => variant.key === section.variant) ?? meta.variants[0];

  return (
    <div
      className={cn('ed-section', selected && 'ed-section-selected', section.hidden && 'ed-section-hidden')}
      data-ed-section={index}
      onClick={() => editor.select({ kind: 'section', index })}
    >
      {/* Balandligi 0 bo'lgan yopishqoq qatlam — uzun bo'limda skroll qilganda ham asboblar ko'rinib turadi */}
      <div className="ed-section-tools-anchor">
        <div className={cn('ed-section-tools', open && 'is-open')} onClick={(event) => event.stopPropagation()}>
          <span className="ed-section-name">{meta.label}</span>
          {meta.variants.length > 1 && currentVariant && (
            <ToolbarPicker
              label={currentVariant.label}
              title="Dizayn varianti"
              width={meta.variants.length > 2 ? 600 : 440}
              open={open === 'variant'}
              onOpenChange={(next) => setOpen(next ? 'variant' : null)}
              preview={
                <span className={`ed-tb-mini sk-tone-${variantTone(section.type, section.variant, section.bg)}`} aria-hidden="true">
                  <PresetThumb type={section.type} variant={section.variant} />
                </span>
              }
            >
              <VariantOptions
                section={section}
                columns={meta.variants.length > 2 ? 3 : 2}
                onPick={(variant) => {
                  editor.setValue([...path, 'variant'], variant);
                  setOpen(null);
                }}
              />
            </ToolbarPicker>
          )}
          <ToolbarPicker
            label={BG_INFO[section.bg].label}
            title="Fon — bo‘lim shu ranglarda ko‘rinadi"
            width={560}
            open={open === 'bg'}
            onOpenChange={(next) => setOpen(next ? 'bg' : null)}
            preview={<BgSwatch bg={section.bg} />}
          >
            <BackgroundOptions
              section={section}
              onPick={(bg) => {
                editor.setValue([...path, 'bg'], bg);
                setOpen(null);
              }}
            />
          </ToolbarPicker>
          <button type="button" className="ed-tool" title="Yuqoriga" disabled={index === 0} onClick={() => editor.move(['sections'], index, index - 1)}>
            <ArrowUp size={15} />
          </button>
          <button type="button" className="ed-tool" title="Pastga" disabled={index >= total - 1} onClick={() => editor.move(['sections'], index, index + 1)}>
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            className="ed-tool"
            title={section.hidden ? 'Ko‘rsatish' : 'Yashirish'}
            onClick={() => editor.setValue([...path, 'hidden'], !section.hidden)}
          >
            {section.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button type="button" className="ed-tool" title="Sozlamalar" onClick={() => editor.select({ kind: 'section', index })}>
            <Settings2 size={15} />
          </button>
          <button type="button" className="ed-tool" title="Nusxa olish" onClick={() => editor.duplicate(['sections'], index)}>
            <Copy size={15} />
          </button>
          <button
            type="button"
            className="ed-tool ed-tool-danger"
            title="Bo‘limni o‘chirish (pastda «Qaytarish» chiqadi)"
            onClick={() => editor.removeWithUndo(['sections'], index, `«${meta.label}» bo‘limi o‘chirildi`)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {section.hidden && <div className="ed-hidden-badge">Yashirilgan — saytda ko‘rinmaydi</div>}
      {children}
    </div>
  );
}
