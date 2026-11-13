import { cn } from '@/lib/cn';
import { Icon } from '../site/Icon';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionHead, SectionShell } from './shell';

const COLS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' } as const;

/** Afzalliklar: cards (oq kartalar), icons (kartasiz, yupqa chiziq bilan), bento (har xil o'lcham) */
export function Features({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const variant = section.variant || 'cards';
  const cols = COLS[section.columns ?? 3];
  const open = variant === 'icons';

  return (
    <SectionShell section={section}>
      <SectionHead section={section} index={index} ctx={ctx} />
      <div className={cn('mt-16 grid grid-cols-1', open ? 'gap-x-10 gap-y-12' : 'gap-5', variant === 'bento' ? 'md:grid-cols-4 md:auto-rows-[minmax(220px,auto)]' : cols)}>
        {section.items.map((item, i) => {
          const itemPath = [...path, 'items', i];
          const bentoSpan = variant === 'bento' ? (item.span === 2 ? 'md:col-span-2' : 'md:col-span-1') : item.span === 2 ? 'md:col-span-2' : '';
          return (
            <span key={item.id} className="contents">
              {ctx.box(
                itemPath,
                item,
                <>
                  {variant === 'bento' && (item.image || ctx.editing) && (
                    <div className="absolute inset-0 -z-10 opacity-20">
                      {ctx.image([...itemPath, 'image'], item.image, { alt: '', fill: true, sizes: '50vw' })}
                    </div>
                  )}
                  <span className="icon-chip">
                    <Icon name={item.icon ?? 'sparkles'} size={20} />
                  </span>
                  {ctx.text([...itemPath, 'title'], item.title, {
                    as: 'h3',
                    className: cn('font-display font-bold', variant === 'bento' && item.span === 2 ? 'text-2xl' : 'text-xl'),
                    placeholder: 'Sarlavha',
                  })}
                  {ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'text-[0.97rem] leading-relaxed text-muted', multiline: true, placeholder: 'Matn' })}
                </>,
                {
                  as: 'article',
                  className: cn(
                    'relative isolate flex flex-col gap-4',
                    open ? '!rounded-none border-t border-[var(--line)] pt-7' : 'card overflow-hidden p-8',
                    bentoSpan,
                  ),
                  style: { '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties,
                },
              )}
            </span>
          );
        })}
        {ctx.add([...path, 'items'], 'Karta')}
      </div>
      <SectionCtas section={section} ctx={ctx} className="mt-14 justify-center" />
    </SectionShell>
  );
}
