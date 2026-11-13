import { cn } from '@/lib/cn';
import type { SectionProps } from './ctx';
import { SectionHead, SectionShell } from './shell';

export const GALLERY_LAYOUTS = ['bento', 'masonry', 'grid', 'carousel'] as const;

/**
 * Galereya: bento (har xil o'lcham), masonry (ustunlar), grid (teng), carousel (suriladigan qator).
 * Har bir rasm — quti: shakli (shape), kengligi (span) va balandligi (tall) muharrirda o'zgaradi.
 * Variant: postcards (izoh rasm ostida, oq hoshiya) yoki clean (izoh rasm ustida).
 */
export function Gallery({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const layout = (GALLERY_LAYOUTS as readonly string[]).includes(section.layout ?? '') ? section.layout : 'bento';
  const postcards = section.variant !== 'clean';

  const container = {
    bento: 'grid grid-flow-dense grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[230px] auto-rows-[170px]',
    masonry: 'columns-2 gap-4 md:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid',
    grid: 'grid grid-cols-2 gap-4 md:grid-cols-4',
    carousel: 'snap-row',
  }[layout as (typeof GALLERY_LAYOUTS)[number]];

  return (
    <SectionShell section={section}>
      <SectionHead section={section} index={index} ctx={ctx} />
      <div className={cn('mt-16', container)}>
        {section.items.map((item, i) => {
          const itemPath = [...path, 'items', i];
          const caption = ctx.text([...itemPath, 'title'], item.title, {
            as: 'figcaption',
            className: postcards
              ? 'relative z-10 px-1 pt-3 pb-1 text-[0.9rem] font-medium text-[var(--color-ink)]'
              : 'absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#122c46]/75 to-transparent p-4 pt-12 text-sm font-medium text-white',
            placeholder: 'Izoh',
          });
          const sizeClass =
            layout === 'bento'
              ? cn(item.span === 2 && 'col-span-2', item.tall && 'row-span-2')
              : layout === 'grid'
                ? cn(item.span === 2 && 'col-span-2')
                : '';
          const aspect = layout === 'masonry' ? (item.tall ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]') : layout === 'bento' ? '' : 'aspect-[4/3]';
          return (
            <span key={item.id} className="contents">
              {ctx.box(
                itemPath,
                item,
                <>
                  <div className={cn('relative w-full flex-1 overflow-hidden', aspect, layout === 'bento' && 'min-h-0', postcards && 'rounded-[calc(1.25rem-6px)]')}>
                    {ctx.image([...itemPath, 'image'], item.image, {
                      alt: ctx.t(item.title),
                      fill: true,
                      sizes: item.span === 2 ? '(min-width:768px) 50vw, 100vw' : '(min-width:768px) 25vw, 50vw',
                      className: 'transition-transform duration-700 group-hover:scale-[1.03]',
                    })}
                  </div>
                  {caption}
                </>,
                {
                  as: 'figure',
                  className: cn(
                    'group relative isolate flex flex-col overflow-hidden',
                    postcards ? 'border border-[var(--line)] bg-[var(--card)] p-1.5' : 'bg-[var(--color-paper-2)]',
                    sizeClass,
                  ),
                  style: { '--reveal-delay': `${(i % 4) * 80}ms` } as React.CSSProperties,
                },
              )}
            </span>
          );
        })}
        {ctx.add([...path, 'items'], 'Rasm')}
      </div>
    </SectionShell>
  );
}
