import { cn } from '@/lib/cn';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionShell } from './shell';

/**
 * Hero: orbit — matn + bosqichlar marshruti kartasi (qutilar: raqam, sarlavha, izoh), split — matn + rasm,
 * poster — to'liq fon rasmi. Kalit nomlari eski hujjatlar uchun saqlangan.
 */
export function Hero({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const variant = section.variant || 'orbit';
  const poster = variant === 'poster';

  const copy = (
    <div className={cn('relative z-10 flex flex-col gap-7', poster ? 'mx-auto max-w-3xl items-center text-center' : 'items-start')}>
      {ctx.text([...path, 'eyebrow'], section.eyebrow, { as: 'span', className: 'eyebrow', placeholder: 'Yorliq' })}
      {ctx.text([...path, 'title'], section.title, {
        as: 'h1',
        className: 'title-xl hero-title',
        multiline: true,
        placeholder: 'Asosiy sarlavha',
      })}
      {ctx.text([...path, 'subtitle'], section.subtitle, { as: 'p', className: 'lead max-w-[36rem]', multiline: true, placeholder: 'Izoh' })}
      <SectionCtas section={section} ctx={ctx} className={cn('pt-1', poster && 'justify-center')} />
    </div>
  );

  if (poster) {
    return (
      <SectionShell section={section} className="flex min-h-[88svh] items-center pt-[calc(var(--header-h)+48px)]">
        <div aria-hidden={!ctx.editing} className="absolute inset-0 -z-10">
          {ctx.image([...path, 'image'], section.image, { alt: '', fill: true, priority: true, sizes: '100vw' })}
          <div className="absolute inset-0 bg-[var(--color-night)]/70" />
        </div>
        <div className="flex flex-col gap-14">
          {copy}
          <Facts section={section} index={index} ctx={ctx} centered />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section} className="pt-[calc(var(--header-h)+48px)] lg:pt-[calc(var(--header-h)+72px)]">
      <div className="grid items-center gap-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-20">
        {copy}
        {variant === 'split' ? (
          <div className="relative" data-reveal="">
            <div className="shape-plate relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-paper-2)]">
              {ctx.image([...path, 'image'], section.image, { alt: ctx.t(section.title), fill: true, priority: true, sizes: '(min-width: 1024px) 480px, 90vw' })}
            </div>
          </div>
        ) : (
          <Itinerary section={section} index={index} ctx={ctx} />
        )}
      </div>
      {variant === 'split' && <Facts section={section} index={index} ctx={ctx} className="mt-16" />}
    </SectionShell>
  );
}

/** Marshrut kartasi: qutilar ketma-ket bekatlar (01 — onlayn saralash, 02 — Toshkentdagi final …) */
function Itinerary({ section, index, ctx }: SectionProps) {
  if (!section.items.length && !ctx.editing) return null;
  return (
    <div className="card shape-plate relative overflow-hidden p-7 sm:p-10" data-reveal="">
      <DotGrid className="pointer-events-none absolute top-6 right-6 text-[var(--color-plus)] opacity-[0.28]" />
      <ol className="relative flex flex-col gap-9">
        <span aria-hidden="true" className="absolute top-6 bottom-6 left-[1.375rem] border-l border-dashed border-[var(--line)]" />
        {section.items.map((item, i) => {
          const itemPath = ['sections', index, 'items', i];
          return (
            <span key={item.id} className="contents">
              {ctx.box(
                itemPath,
                item,
                <>
                  <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-[14px_4px_14px_4px] border border-[var(--line)] bg-[var(--card)] font-display text-[0.95rem] font-extrabold text-[var(--color-plus)]">
                    {ctx.plain([...itemPath, 'value'], item.value, { as: 'span', placeholder: '01' })}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1.5 pt-1.5">
                    {ctx.text([...itemPath, 'title'], item.title ?? item.label, { as: 'h3', className: 'font-display text-xl font-bold', placeholder: 'Bekat' })}
                    {ctx.text([...itemPath, 'text'], item.text, { as: 'p', className: 'text-[0.95rem] leading-relaxed text-muted', multiline: true, placeholder: 'Izoh' })}
                  </span>
                </>,
                { as: 'li', className: '!rounded-none flex gap-5', style: { '--reveal-delay': `${120 + i * 110}ms` } as React.CSSProperties },
              )}
            </span>
          );
        })}
        {ctx.add(['sections', index, 'items'], 'Bekat')}
      </ol>
    </div>
  );
}

/** Qisqa faktlar qatori (split va poster variantlari) */
function Facts({ section, index, ctx, centered, className }: SectionProps & { centered?: boolean; className?: string }) {
  if (!section.items.length && !ctx.editing) return null;
  return (
    <dl className={cn('grid w-full grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-3', centered && 'mx-auto max-w-4xl text-left', className)}>
      {section.items.map((item, i) => {
        const itemPath = ['sections', index, 'items', i];
        return (
          <span key={item.id} className="contents">
            {ctx.box(
              itemPath,
              item,
              <>
                {ctx.plain([...itemPath, 'value'], item.value, { as: 'dt', className: 'font-display text-3xl font-extrabold', placeholder: '01' })}
                {ctx.text([...itemPath, 'title'], item.title ?? item.label, { as: 'dd', className: 'font-semibold', placeholder: 'Sarlavha' })}
                {ctx.text([...itemPath, 'text'], item.text, { as: 'dd', className: 'text-sm leading-relaxed text-muted', multiline: true, placeholder: 'Izoh' })}
              </>,
              { className: '!rounded-none flex flex-col gap-1.5 border-t border-[var(--line)] pt-5', style: { '--reveal-delay': `${i * 90}ms` } as React.CSSProperties },
            )}
          </span>
        );
      })}
      {ctx.add(['sections', index, 'items'], 'Fakt')}
    </dl>
  );
}

/** Brend grafik tili: nuqtali to'r (raqam, nuqta, oddiy geometriya) — bitta yengil bezak */
function DotGrid({ className }: { className?: string }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="currentColor" aria-hidden="true" className={className}>
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => <circle key={`${row}-${col}`} cx={6 + col * 20} cy={6 + row * 20} r={2.6} />),
      )}
    </svg>
  );
}
