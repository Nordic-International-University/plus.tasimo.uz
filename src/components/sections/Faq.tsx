import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionHead, SectionShell } from './shell';

/** Savol-javob: <details> (JS'siz, qidiruv botlari ham o'qiydi). accordion yoki two-column. Kartasiz — yupqa chiziqlar */
export function Faq({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const twoColumn = section.variant === 'two-column';

  return (
    <SectionShell section={section}>
      <div className={cn(twoColumn ? 'grid gap-14 lg:grid-cols-[0.8fr_1.2fr]' : 'mx-auto max-w-3xl')}>
        <div className={cn(twoColumn && 'lg:sticky lg:top-28 lg:self-start')}>
          <SectionHead section={section} index={index} ctx={ctx} align={twoColumn ? 'left' : 'center'} />
          {twoColumn && <SectionCtas section={section} ctx={ctx} className="mt-8" />}
        </div>
        <div className={cn('flex flex-col border-b border-[var(--line)]', !twoColumn && 'mt-14')}>
          {section.items.map((item, i) => {
            const itemPath = [...path, 'items', i];
            const question = ctx.text([...itemPath, 'title'], item.title, { as: 'span', className: 'font-display text-lg font-bold sm:text-xl', placeholder: 'Savol' });
            const answer = ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'max-w-[40rem] pb-7 leading-relaxed text-muted', multiline: true, placeholder: 'Javob' });
            return (
              <span key={item.id} className="contents">
                {ctx.box(
                  itemPath,
                  item,
                  ctx.editing ? (
                    // Muharrirda savol ham, javob ham doim ochiq (bosilganda yopilib qolmasin)
                    <div className="flex flex-col gap-3 pt-6">
                      {question}
                      {answer}
                    </div>
                  ) : (
                    <details className="faq-item group" open={i === 0}>
                      <summary className="flex items-center justify-between gap-6 py-6">
                        {question}
                        <span className="faq-icon grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--color-navy)] transition-transform duration-300 [.sec-dark_&]:text-white">
                          <Plus size={16} />
                        </span>
                      </summary>
                      <div className="faq-answer">
                        <div className="overflow-hidden">{answer}</div>
                      </div>
                    </details>
                  ),
                  { className: '!rounded-none border-t border-[var(--line)]', style: { '--reveal-delay': `${i * 50}ms` } as React.CSSProperties },
                )}
              </span>
            );
          })}
          {ctx.add([...path, 'items'], 'Savol')}
        </div>
      </div>
      {!twoColumn && <SectionCtas section={section} ctx={ctx} className="mt-12 justify-center" />}
    </SectionShell>
  );
}
