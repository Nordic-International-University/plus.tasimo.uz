'use client';

import { Copy, ImagePlus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { youtubeId } from '@/lib/doc/normalize';
import { SECTION_META } from '@/lib/doc/presets';
import { ACCENTS, CTA_KEYS, ICONS, SHAPES, type Box, type Section, type Shape } from '@/lib/doc/types';
import { GALLERY_LAYOUTS } from '../sections/Gallery';
import { Icon } from '../site/Icon';
import { useEditor } from './EditorContext';
import type { GlobalGroup } from './GlobalSettings';
import { CTA_LABEL, Field, LinkField, PanelSection, RichHint, Segmented, TextInput, TextPair, Toggle } from './fields';
import { BackgroundOptions, ColumnsGlyph, LayoutOptions, SpanGlyph, VariantOptions } from './SectionPickers';

const SHAPE_LABEL: Record<Shape, string> = {
  plate: 'Plashka (brend)',
  rounded: 'Yumaloq',
  square: 'To‘rtburchak',
  pill: 'Kapsula',
  circle: 'Doira',
  blob: 'Tomchi',
  arch: 'Ravoq',
  hex: 'Olti burchak',
  tilt: 'Qiya',
  ticket: 'Chipta',
};
/** Aksentlar (globals.css .accent-* bilan bir xil): birinchi uchtasi — brend palitrasi */
const ACCENT_HEX: Record<(typeof ACCENTS)[number], string> = {
  teal: '#0a62b3',
  violet: '#122c46',
  amber: '#a8792b',
  coral: '#b4505a',
  sky: '#3a86d0',
  lime: '#4f7a3a',
};
const ACCENT_LABEL: Record<(typeof ACCENTS)[number], string> = {
  teal: 'PLUS ko‘k',
  violet: 'To‘q ko‘k',
  amber: 'Oltin',
  coral: 'Gilos',
  sky: 'Moviy',
  lime: 'Yashil',
};
const LAYOUT_LABEL = { bento: 'Bento', masonry: 'Masonry', grid: 'To‘r', carousel: 'Karusel' } as const;

/** O'ng panel: tanlangan bo'lim yoki quti sozlamalari */
export function Inspector({ onClose, onOpenGlobal }: { onClose: () => void; onOpenGlobal: (group: GlobalGroup) => void }) {
  const editor = useEditor();
  const selection = editor.selection;
  if (!selection) return null;
  const section = editor.doc.sections[selection.index];
  if (!section) return null;

  return (
    <aside className="ed-panel ed-panel-right" aria-label="Sozlamalar">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <div className="text-[0.7rem] font-bold tracking-wider text-slate-400 uppercase">{selection.kind === 'box' ? 'Quti' : 'Bo‘lim'}</div>
          <div className="truncate text-sm font-bold text-slate-900">{SECTION_META[section.type].label}</div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {selection.kind === 'section' && (
            <>
              <button type="button" className="ed-tool ed-tool-light" title="Bo‘limdan nusxa olish" onClick={() => editor.duplicate(['sections'], selection.index)}>
                <Copy size={15} />
              </button>
              <button
                type="button"
                className="ed-tool ed-tool-light ed-tool-danger"
                title="Bo‘limni o‘chirish (pastda «Qaytarish» chiqadi)"
                onClick={() => editor.removeWithUndo(['sections'], selection.index, `«${SECTION_META[section.type].label}» bo‘limi o‘chirildi`)}
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
          <button type="button" className="ed-tool ed-tool-light" onClick={onClose} aria-label="Yopish">
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {selection.kind === 'section' ? <SectionSettings section={section} index={selection.index} onOpenGlobal={onOpenGlobal} /> : <BoxSettings section={section} index={selection.index} boxIndex={selection.box} />}
      </div>
    </aside>
  );
}

function SectionSettings({ section, index, onOpenGlobal }: { section: Section; index: number; onOpenGlobal: (group: GlobalGroup) => void }) {
  const editor = useEditor();
  const meta = SECTION_META[section.type];
  const path = ['sections', index];
  const set = (key: string, value: unknown) => editor.setValue([...path, key], value, `${path.join('.')}.${key}`);
  const fields = meta.sectionFields;
  const videoOk = !section.video || youtubeId(section.video);

  return (
    <>
      <PanelSection title="Ko‘rinish">
        {meta.variants.length > 1 && (
          <Field label="Dizayn varianti">
            <VariantOptions section={section} onPick={(v) => set('variant', v)} />
          </Field>
        )}
        <Field label="Fon" hint="Eskizda shu bo‘lim tanlangan fonda qanday ko‘rinishi">
          <BackgroundOptions section={section} columns={2} onPick={(bg) => set('bg', bg)} />
        </Field>
        {fields.includes('layout') && (
          <Field label="Joylashuv">
            <LayoutOptions value={section.layout ?? 'bento'} options={GALLERY_LAYOUTS.map((l) => ({ key: l, label: LAYOUT_LABEL[l] }))} onPick={(v) => set('layout', v)} />
          </Field>
        )}
        {fields.includes('columns') && (
          <Field label="Ustunlar">
            <Segmented
              value={section.columns ?? 3}
              options={[2, 3, 4].map((n) => ({ value: n as 2 | 3 | 4, label: <><ColumnsGlyph count={n} /> {n}</>, title: `${n} ustun` }))}
              onChange={(v) => set('columns', v)}
            />
          </Field>
        )}
        <Toggle checked={section.hidden} onChange={(v) => set('hidden', v)} label="Saytda yashirish" />
        <Field label="Menyu uchun nom (anchor)" hint="Masalan about → menyuda #about havolasi shu bo‘limga olib keladi">
          <TextInput value={section.anchor} onChange={(v) => set('anchor', v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40))} placeholder="about" />
        </Field>
      </PanelSection>

      {(fields.includes('image') || fields.includes('video') || fields.includes('countdownTo')) && (
        <PanelSection title="Media">
          {fields.includes('video') && (
            <Field label="YouTube havolasi" hint={videoOk ? 'youtube.com/watch?v=…, youtu.be/…, shorts' : 'Havola tanilmadi — YouTube video havolasini qo‘ying'}>
              <TextInput type="url" value={section.video ?? ''} onChange={(v) => set('video', v.trim())} placeholder="https://www.youtube.com/watch?v=…" />
            </Field>
          )}
          {fields.includes('image') && (
            <button type="button" className="ed-btn justify-start" onClick={() => editor.openImage([...path, 'image'])}>
              <ImagePlus size={16} /> {section.image ? 'Rasmni almashtirish' : 'Rasm qo‘shish'}
            </button>
          )}
          {fields.includes('countdownTo') && (
            <Field label="Taymer (keyingi mavsum boshlanishi)" hint="Bo‘sh — taymer ko‘rinmaydi. Vaqt — kompyuteringiz vaqt zonasida">
              <TextInput
                type="datetime-local"
                value={section.countdownTo ? toLocalInput(section.countdownTo) : ''}
                onChange={(v) => set('countdownTo', v ? new Date(v).toISOString() : undefined)}
              />
            </Field>
          )}
        </PanelSection>
      )}

      {fields.includes('ctas') && (
        <PanelSection title="Tugmalar">
          {CTA_KEYS.map((key) => {
            const on = section.ctas?.includes(key) ?? false;
            return (
              <Toggle
                key={key}
                checked={on}
                label={CTA_LABEL[key]}
                onChange={(next) => set('ctas', next ? [...(section.ctas ?? []), key] : (section.ctas ?? []).filter((k) => k !== key))}
              />
            );
          })}
          <p className="text-xs leading-relaxed text-slate-400">
            Tugma matni va havolasi —{' '}
            <button type="button" className="font-semibold text-[#2c5fd8] hover:underline" onClick={() => onOpenGlobal('ctas')}>
              Umumiy → Tugmalar
            </button>
            . Birinchi yoqilgani asosiy tugma.
          </p>
        </PanelSection>
      )}

      <PanelSection title="Matnlar (ikki tilda)">
        <RichHint />
        {(['eyebrow', 'title', 'subtitle', 'body'] as const)
          .filter((key) => key !== 'body' || section.body !== undefined || ['about', 'richtext'].includes(section.type))
          .map((key) => (
            <Field key={key} label={{ eyebrow: 'Yorliq', title: 'Sarlavha', subtitle: 'Izoh', body: 'Matn' }[key]}>
              <TextPair value={section[key]} onChange={(v) => set(key, v)} multiline={key !== 'eyebrow'} />
            </Field>
          ))}
      </PanelSection>
    </>
  );
}

function BoxSettings({ section, index, boxIndex }: { section: Section; index: number; boxIndex: number }) {
  const editor = useEditor();
  const box = section.items[boxIndex] as Box | undefined;
  if (!box) return <p className="p-5 text-sm text-slate-500">Quti topilmadi.</p>;
  const meta = SECTION_META[section.type];
  const path = ['sections', index, 'items', boxIndex];
  const set = (key: string, value: unknown) => editor.setValue([...path, key], value, `${path.join('.')}.${key}`);
  const fields = meta.boxFields;

  return (
    <>
      <PanelSection
        title="Ko‘rinish"
        actions={
          <div className="flex gap-1">
            <button type="button" className="ed-tool ed-tool-light" title="Nusxa" onClick={() => editor.duplicate(['sections', index, 'items'], boxIndex)}>
              <Copy size={15} />
            </button>
            <button
              type="button"
              className="ed-tool ed-tool-light ed-tool-danger"
              title="O‘chirish (pastda «Qaytarish» chiqadi)"
              onClick={() => editor.removeWithUndo(['sections', index, 'items'], boxIndex, `${meta.boxLabel || 'Quti'} o‘chirildi`)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        }
      >
        {fields.includes('value') && (
          <Field label="Qiymat (raqam)">
            <TextInput value={box.value ?? ''} onChange={(v) => set('value', v.slice(0, 80))} placeholder="100%" />
          </Field>
        )}
        {fields.includes('image') && (
          <button type="button" className="ed-btn justify-start" onClick={() => editor.openImage([...path, 'image'])}>
            <ImagePlus size={16} /> {box.image ? 'Rasmni almashtirish' : 'Rasm qo‘shish'}
          </button>
        )}
        {fields.includes('shape') && (
          <Field label="Shakl">
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => set('shape', shape)}
                  className={cn('flex flex-col items-center gap-1 rounded-xl p-2 text-[0.68rem] font-semibold text-slate-600 hover:bg-slate-50', (box.shape ?? 'rounded') === shape && 'bg-[#2c5fd8]/[0.07] text-[#1d3f99] ring-1 ring-[#2c5fd8]/50')}
                >
                  <span className={cn('h-8 w-11 bg-[#cee4f8]', `shape-${shape}`, shape === 'circle' && 'w-8')} />
                  {SHAPE_LABEL[shape]}
                </button>
              ))}
            </div>
          </Field>
        )}
        {fields.includes('span') && (
          <Field label="Kenglik">
            <Segmented
              value={box.span ?? 1}
              options={[
                { value: 1 as const, label: <><SpanGlyph wide={false} /> Oddiy</> },
                { value: 2 as const, label: <><SpanGlyph wide /> Keng (2 ustun)</> },
              ]}
              onChange={(v) => set('span', v)}
            />
          </Field>
        )}
        {fields.includes('tall') && <Toggle checked={box.tall ?? false} onChange={(v) => set('tall', v)} label="Baland (2 qator)" />}
        {fields.includes('accent') && (
          <Field label="Rang">
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((accent) => (
                <button
                  key={accent}
                  type="button"
                  title={ACCENT_LABEL[accent]}
                  onClick={() => set('accent', accent)}
                  className={cn('h-8 w-8 rounded-full border-2 border-white shadow', box.accent === accent && 'ring-2 ring-slate-900 ring-offset-1')}
                  style={{ background: ACCENT_HEX[accent] }}
                />
              ))}
            </div>
          </Field>
        )}
        {fields.includes('icon') && (
          <Field label="Ikonka">
            <div className="grid grid-cols-6 gap-1.5">
              {ICONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => set('icon', name)}
                  className={cn('grid h-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100', box.icon === name && 'bg-slate-900 text-white hover:bg-slate-900')}
                >
                  <Icon name={name} size={18} />
                </button>
              ))}
            </div>
          </Field>
        )}
        {fields.includes('href') && (
          <Field label="Havola">
            <LinkField doc={editor.doc} locale={editor.locale} value={box.href ?? ''} onChange={(v) => set('href', v)} />
          </Field>
        )}
      </PanelSection>

      <PanelSection title="Matnlar (ikki tilda)">
        <RichHint />
        {(['title', 'text', 'label'] as const)
          .filter((key) => box[key] !== undefined)
          .map((key) => (
            <Field key={key} label={{ title: 'Sarlavha', text: 'Matn', label: 'Yorliq' }[key]}>
              <TextPair value={box[key]} onChange={(v) => set(key, v)} multiline={key === 'text'} />
            </Field>
          ))}
      </PanelSection>
    </>
  );
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
