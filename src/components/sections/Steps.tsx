import { cn } from '@/lib/cn';
import { Icon } from '../site/Icon';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionHead, SectionShell } from './shell';

/** Qanday ishtirok etiladi: path (qadamlar bitta chiziq ustida) yoki numbered (katta raqamli ro'yxat) */
export function Steps({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const numbered = section.variant === 'numbered';

  return (
    <SectionShell section={section}>
      <SectionHead section={section} index={index} ctx={ctx} />
      <ol className={cn('relative mt-16 grid', numbered ? 'gap-x-12 gap-y-10 md:grid-cols-2' : 'gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8')}>
        {!numbered && <span aria-hidden="true" className="pointer-events-none absolute top-6 right-0 left-0 hidden border-t border-[var(--line)] lg:block" />}
        {section.items.map((item, i) => {
          const itemPath = [...path, 'items', i];
          const step = String(i + 1).padStart(2, '0');
          return (
            <span key={item.id} className="contents">
              {ctx.box(
                itemPath,
                item,
                numbered ? (
                  <>
                    <span className="font-display text-5xl leading-none font-extrabold text-[var(--color-accent)]">{step}</span>
                    <span className="flex flex-col gap-2 pt-1">
                      {ctx.text([...itemPath, 'title'], item.title, { as: 'h3', className: 'font-display text-xl font-bold', placeholder: 'Qadam' })}
                      {ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'leading-relaxed text-muted', multiline: true, placeholder: 'Matn' })}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-4">
                      <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--color-navy)]">
                        <Icon name={item.icon ?? 'target'} size={20} />
                      </span>
                      <span className="text-xs font-bold tracking-[0.16em] text-muted">{step}</span>
                    </span>
                    {ctx.text([...itemPath, 'title'], item.title, { as: 'h3', className: 'font-display text-xl font-bold', placeholder: 'Qadam' })}
                    {ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'text-[0.97rem] leading-relaxed text-muted', multiline: true, placeholder: 'Matn' })}
                  </>
                ),
                {
                  as: 'li',
                  className: cn('!rounded-none flex', numbered ? 'flex-row items-start gap-6 border-t border-[var(--line)] pt-8' : 'flex-col gap-4'),
                  style: { '--reveal-delay': `${i * 110}ms` } as React.CSSProperties,
                },
              )}
            </span>
          );
        })}
        {ctx.add([...path, 'items'], 'Qadam')}
      </ol>
      <SectionCtas section={section} ctx={ctx} className="mt-16 justify-center" />
    </SectionShell>
  );
}
