import { cn } from '@/lib/cn';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionShell } from './shell';

/** Erkin matn: article (markazda) yoki aside (sarlavha chapda, matn o'ngda). Matnda bo'sh qator — yangi xatboshi */
export function RichText({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const aside = section.variant === 'aside';
  return (
    <SectionShell section={section}>
      <div className={cn(aside ? 'grid gap-10 lg:grid-cols-[0.8fr_1.2fr]' : 'mx-auto flex max-w-3xl flex-col gap-6')} data-reveal="">
        <div className="flex flex-col gap-5">
          {ctx.text([...path, 'eyebrow'], section.eyebrow, { as: 'span', className: 'eyebrow self-start', placeholder: 'Yorliq' })}
          {ctx.text([...path, 'title'], section.title, { as: 'h2', className: 'title-lg', multiline: true, placeholder: 'Sarlavha' })}
        </div>
        <div className="flex flex-col gap-6">
          {ctx.text([...path, 'body'], section.body, { as: 'div', className: 'lead whitespace-pre-line', multiline: true, placeholder: 'Matn' })}
          <SectionCtas section={section} ctx={ctx} />
        </div>
      </div>
    </SectionShell>
  );
}
