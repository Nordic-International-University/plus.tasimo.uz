import { cn } from '@/lib/cn';
import { Icon } from '../site/Icon';
import type { SectionProps } from './ctx';
import { SectionHead, SectionShell } from './shell';

/** Raqamlar: band (yupqa chiziqlar bilan bir qator) yoki cards. Butun son bo'lsa — ko'rinishga kelganda sanab chiqadi */
export function Stats({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const cards = section.variant === 'cards';

  return (
    <SectionShell section={section}>
      <SectionHead section={section} index={index} ctx={ctx} />
      <dl className={cn('mt-16 grid grid-cols-2 gap-x-8 gap-y-12', section.items.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3', cards && 'gap-5')}>
        {section.items.map((item, i) => {
          const itemPath = [...path, 'items', i];
          const numeric = item.value?.match(/^(\d{1,7})(.*)$/);
          return (
            <span key={item.id} className="contents">
              {ctx.box(
                itemPath,
                item,
                <>
                  {cards && (
                    <span className="icon-chip mb-2">
                      <Icon name={item.icon ?? 'chart'} size={20} />
                    </span>
                  )}
                  <dt className="order-2 text-[0.95rem] leading-snug text-muted">
                    {ctx.text([...itemPath, 'label'], item.label, { as: 'span', placeholder: 'Izoh' })}
                  </dt>
                  <dd className="order-1 font-display text-5xl font-extrabold tracking-tight text-[var(--color-navy)] sm:text-6xl [.sec-dark_&]:text-white">
                    {ctx.editing || !numeric ? (
                      ctx.plain([...itemPath, 'value'], item.value, { as: 'span', placeholder: '100' })
                    ) : (
                      <span data-count={numeric[1]} data-suffix={numeric[2]}>
                        {item.value}
                      </span>
                    )}
                  </dd>
                </>,
                {
                  className: cn('flex flex-col gap-3', cards ? 'card p-8' : '!rounded-none border-t border-[var(--line)] pt-7'),
                  style: { '--reveal-delay': `${i * 90}ms` } as React.CSSProperties,
                },
              )}
            </span>
          );
        })}
        {ctx.add([...path, 'items'], 'Raqam')}
      </dl>
    </SectionShell>
  );
}
