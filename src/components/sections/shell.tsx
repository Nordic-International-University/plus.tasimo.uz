import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Background, Section } from '@/lib/doc/types';
import type { RenderCtx } from './ctx';

/** To'q fonlar (matn oq): night — #122C46, aurora — PLUS BLUE. «sunset» — PLUS LIGHT (och fon) */
const DARK: ReadonlySet<Background> = new Set(['night', 'aurora']);
export const isDarkBg = (bg: Background) => DARK.has(bg);

export function SectionShell({
  section,
  children,
  className,
  containerClassName,
  bare,
}: {
  section: Section;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Konteynersiz (to'liq kenglik) */
  bare?: boolean;
}) {
  return (
    <section
      id={section.anchor || undefined}
      data-section={section.id}
      className={cn('sec', `sec-${section.bg}`, isDarkBg(section.bg) && 'sec-dark', className)}
    >
      {bare ? children : <div className={cn('container-x', containerClassName)}>{children}</div>}
    </section>
  );
}

/** Bo'lim sarlavhasi: yorliq, sarlavha, izoh — hammasi tahrirlanadi */
export function SectionHead({
  section,
  index,
  ctx,
  align = 'center',
  className,
  titleClassName,
}: {
  section: Section;
  index: number;
  ctx: RenderCtx;
  align?: 'center' | 'left';
  className?: string;
  titleClassName?: string;
}) {
  const path = ['sections', index];
  const eyebrow = ctx.text([...path, 'eyebrow'], section.eyebrow, { as: 'span', className: 'eyebrow', placeholder: 'Yorliq' });
  const title = ctx.text([...path, 'title'], section.title, { as: 'h2', className: cn('title-lg', titleClassName), multiline: true, placeholder: 'Sarlavha' });
  const subtitle = ctx.text([...path, 'subtitle'], section.subtitle, { as: 'p', className: 'lead', multiline: true, placeholder: 'Izoh' });
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <header
      className={cn('flex flex-col gap-5', align === 'center' ? 'mx-auto max-w-[44rem] items-center text-center' : 'max-w-2xl items-start', className)}
      data-reveal=""
    >
      {eyebrow}
      {title}
      {subtitle}
    </header>
  );
}

/** Bo'limdagi tugmalar (section.ctas) — birinchisi asosiy */
export function SectionCtas({
  section,
  ctx,
  className,
  primaryVariant = 'primary',
}: {
  section: Section;
  ctx: RenderCtx;
  className?: string;
  primaryVariant?: 'primary' | 'light';
}) {
  const keys = section.ctas ?? [];
  if (!keys.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)} data-reveal="">
      {keys.map((key, i) => (
        <span key={key} className="contents">
          {ctx.cta(key, { sectionId: section.id, variant: i === 0 ? primaryVariant : 'secondary', arrow: i === 0 })}
        </span>
      ))}
    </div>
  );
}
