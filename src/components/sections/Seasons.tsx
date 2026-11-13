import { cn } from '@/lib/cn';
import { Icon } from '../site/Icon';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionHead, SectionShell } from './shell';

/** Ustunlar soni qutilar soniga qarab: 2 ta mavsum — ikki keng karta */
function gridCols(count: number): string {
  if (count <= 2) return 'md:grid-cols-2';
  if (count === 3) return 'md:grid-cols-3';
  return 'sm:grid-cols-2 lg:grid-cols-4';
}

/**
 * Mavsumlar: route — katta kartalar (yorliq, ikonka, nom, bosqichlar matni), cards — rasmli kartalar.
 * Matndagi har qator — alohida bosqich (masalan «1-bosqich — onlayn saralash»).
 */
export function Seasons({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const cards = section.variant === 'cards';

  return (
    <SectionShell section={section}>
      <SectionHead section={section} index={index} ctx={ctx} />
      <ol className={cn('mt-16 grid gap-6', gridCols(section.items.length))}>
        {section.items.map((item, i) => {
          const itemPath = [...path, 'items', i];
          const media = (item.image || (cards && ctx.editing)) && (
            <div className="relative aspect-[16/9] overflow-hidden">
              {ctx.image([...itemPath, 'image'], item.image, { alt: ctx.t(item.title), fill: true, sizes: '(min-width:768px) 50vw, 100vw' })}
            </div>
          );
          return (
            <span key={item.id} className="contents">
              {ctx.box(
                itemPath,
                item,
                <>
                  {media}
                  <div className="flex flex-1 flex-col gap-6 p-8 sm:p-10">
                    <div className="flex items-center justify-between gap-4">
                      {ctx.text([...itemPath, 'label'], item.label, {
                        as: 'span',
                        className: 'text-xs font-bold tracking-[0.16em] text-muted uppercase',
                        placeholder: 'Mavsum',
                      })}
                      {!cards && (
                        <span className="icon-chip">
                          <Icon name={item.icon ?? 'calendar'} size={20} />
                        </span>
                      )}
                    </div>
                    {ctx.text([...itemPath, 'title'], item.title, { as: 'h3', className: 'font-display text-3xl font-extrabold sm:text-[2.1rem]', placeholder: 'Nomi' })}
                    {ctx.text([...itemPath, 'text'], item.text, {
                      as: 'p',
                      className: 'border-t border-[var(--line)] pt-6 leading-[1.9] whitespace-pre-line text-muted',
                      multiline: true,
                      placeholder: 'Bosqichlar',
                    })}
                  </div>
                </>,
                {
                  as: 'li',
                  className: 'card flex flex-col overflow-hidden rounded-[1.75rem]',
                  style: { '--reveal-delay': `${i * 120}ms` } as React.CSSProperties,
                },
              )}
            </span>
          );
        })}
        {ctx.add([...path, 'items'], 'Mavsum')}
      </ol>
      <SectionCtas section={section} ctx={ctx} className="mt-14 justify-center" />
    </SectionShell>
  );
}
