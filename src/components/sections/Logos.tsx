import { cn } from '@/lib/cn';
import type { SectionProps } from './ctx';
import { SectionHead, SectionShell } from './shell';

/** Hamkorlar logotiplari: marquee (oqib turadigan qator) yoki grid */
export function Logos({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const marquee = section.variant !== 'grid' && !ctx.editing && section.items.length > 3;

  const tiles = (copy = 0) =>
    section.items.map((item, i) => {
      const itemPath = [...path, 'items', i];
      const content = (
        <>
          <div className="relative h-14 w-36">
            {ctx.image([...itemPath, 'image'], item.image, { alt: ctx.t(item.title), fill: true, sizes: '144px', className: 'object-contain' })}
          </div>
          {!item.image && ctx.text([...itemPath, 'title'], item.title, { as: 'span', className: 'text-sm font-semibold text-muted', placeholder: 'Nomi' })}
        </>
      );
      return (
        <span key={`${item.id}-${copy}`} className="contents">
          {copy === 0 ? (
            ctx.box(itemPath, item, content, { className: 'card flex items-center justify-center gap-3 px-6 py-4 grayscale transition hover:grayscale-0' })
          ) : (
            <div aria-hidden="true" className="card flex items-center justify-center gap-3 px-6 py-4 grayscale">
              {content}
            </div>
          )}
        </span>
      );
    });

  return (
    <SectionShell section={section} className="!py-16">
      <SectionHead section={section} index={index} ctx={ctx} />
      {marquee ? (
        <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="marquee-track gap-5 [&>span]:contents">
            {tiles(0)}
            {tiles(1)}
          </div>
        </div>
      ) : (
        <div className={cn('mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5')}>
          {tiles(0)}
          {ctx.add([...path, 'items'], 'Logotip')}
        </div>
      )}
    </SectionShell>
  );
}
