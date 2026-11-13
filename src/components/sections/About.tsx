import { cn } from '@/lib/cn';
import { Icon } from '../site/Icon';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionShell } from './shell';

/** «Loyiha haqida»: split (rasm + matn + afzalliklar) yoki centered. Afzalliklar — kartasiz, yupqa chiziq bilan */
export function About({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const centered = section.variant === 'centered';

  const points = (
    <div className={cn('grid gap-x-10 gap-y-9 sm:grid-cols-2', centered && 'text-left lg:grid-cols-4')}>
      {section.items.map((item, i) => {
        const itemPath = [...path, 'items', i];
        return (
          <span key={item.id} className="contents">
            {ctx.box(
              itemPath,
              item,
              <>
                <span className="icon-chip">
                  <Icon name={item.icon ?? 'sparkles'} size={20} />
                </span>
                {ctx.text([...itemPath, 'title'], item.title, { as: 'h3', className: 'font-display text-lg font-bold', placeholder: 'Sarlavha' })}
                {ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'text-[0.95rem] leading-relaxed text-muted', multiline: true, placeholder: 'Matn' })}
              </>,
              {
                className: '!rounded-none flex flex-col gap-3 border-t border-[var(--line)] pt-6',
                style: { '--reveal-delay': `${i * 80}ms` } as React.CSSProperties,
              },
            )}
          </span>
        );
      })}
      {ctx.add([...path, 'items'], 'Afzallik')}
    </div>
  );

  const copy = (
    <div className={cn('flex flex-col gap-6', centered && 'mx-auto max-w-[44rem] items-center text-center')} data-reveal="">
      {ctx.text([...path, 'eyebrow'], section.eyebrow, { as: 'span', className: 'eyebrow', placeholder: 'Yorliq' })}
      {ctx.text([...path, 'title'], section.title, { as: 'h2', className: 'title-lg', multiline: true, placeholder: 'Sarlavha' })}
      {ctx.text([...path, 'body'], section.body, {
        as: 'div',
        className: 'lead whitespace-pre-line',
        multiline: true,
        placeholder: 'Matn',
      })}
      <SectionCtas section={section} ctx={ctx} />
    </div>
  );

  if (centered) {
    return (
      <SectionShell section={section}>
        {copy}
        <div className="mt-16">{points}</div>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section}>
      <div className="grid items-start gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <div className="relative order-2 lg:sticky lg:top-28 lg:order-1" data-reveal="">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-[var(--color-paper-2)]">
            {ctx.image([...path, 'image'], section.image, { alt: ctx.t(section.title), fill: true, sizes: '(min-width: 1024px) 520px, 90vw' })}
          </div>
        </div>
        <div className="order-1 flex flex-col gap-14 lg:order-2">
          {copy}
          {points}
        </div>
      </div>
    </SectionShell>
  );
}
