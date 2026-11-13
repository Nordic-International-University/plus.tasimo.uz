import { Quote } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '../site/Icon';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionHead, SectionShell } from './shell';

/** Fikrlar (quotes) yoki mukofotlar (prizes) — rasm, ism/sarlavha, matn, yorliq */
export function Testimonials({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const prizes = section.variant === 'prizes';

  return (
    <SectionShell section={section}>
      <SectionHead section={section} index={index} ctx={ctx} />
      <div className={cn('mt-16 grid gap-6', prizes ? 'md:grid-cols-3 md:items-end' : 'md:grid-cols-2 lg:grid-cols-3')}>
        {section.items.map((item, i) => {
          const itemPath = [...path, 'items', i];
          return (
            <span key={item.id} className="contents">
              {ctx.box(
                itemPath,
                item,
                prizes ? (
                  <>
                    <span className="icon-chip mx-auto h-14 w-14 rounded-full">
                      <Icon name={item.icon ?? 'trophy'} size={24} />
                    </span>
                    {ctx.plain([...itemPath, 'value'], item.value, { as: 'span', className: 'font-display text-4xl font-extrabold text-[var(--color-navy)] [.sec-dark_&]:text-white', placeholder: '1' })}
                    {ctx.text([...itemPath, 'title'], item.title, { as: 'h3', className: 'font-display text-xl font-bold', placeholder: 'Mukofot' })}
                    {ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'text-sm leading-relaxed text-muted', multiline: true, placeholder: 'Matn' })}
                  </>
                ) : (
                  <>
                    <Quote size={26} className="text-[var(--color-accent)] opacity-70" aria-hidden="true" />
                    {ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'flex-1 text-[1.02rem] leading-relaxed', multiline: true, placeholder: 'Fikr matni' })}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--color-paper-2)]">
                        {ctx.image([...itemPath, 'image'], item.image, { alt: ctx.t(item.title), fill: true, sizes: '48px' })}
                      </div>
                      <div className="flex flex-col">
                        {ctx.text([...itemPath, 'title'], item.title, { as: 'strong', className: 'text-sm font-semibold', placeholder: 'Ism' })}
                        {ctx.text([...itemPath, 'label'], item.label, { as: 'span', className: 'text-xs text-muted', placeholder: 'Davlat, sinf' })}
                      </div>
                    </div>
                  </>
                ),
                {
                  as: 'article',
                  className: cn(
                    'card flex flex-col gap-4 p-8',
                    prizes && 'items-center text-center',
                    prizes && i === 1 && 'md:min-h-[340px] md:-translate-y-3',
                  ),
                  style: { '--reveal-delay': `${i * 100}ms` } as React.CSSProperties,
                },
              )}
            </span>
          );
        })}
        {ctx.add([...path, 'items'], prizes ? 'Mukofot' : 'Fikr')}
      </div>
      <SectionCtas section={section} ctx={ctx} className="mt-12 justify-center" />
    </SectionShell>
  );
}
