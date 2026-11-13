import { ArrowUpRight, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { youtubeId } from '@/lib/doc/normalize';
import { ui } from '@/lib/ui-strings';
import { YouTube } from '../site/YouTube';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionHead, SectionShell } from './shell';

/**
 * Video: featured (katta pleyer) yoki split (matn + pleyer). YouTube havolasi bo'lmasa — poster va
 * kanal havolasi (birinchi quti) ko'rsatiladi, «tez orada» yozuvi emas.
 */
export function Video({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const id = youtubeId(section.video);
  const split = section.variant === 'split';
  const link = section.items[0];
  const title = ctx.t(section.title);

  const player = (
    <div className="relative aspect-video w-full overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--color-night)]" data-reveal="">
      {id && !ctx.editing ? (
        <YouTube id={id} title={title} poster={section.image || undefined} playLabel={ui(ctx.locale, 'playVideo')} />
      ) : (
        <>
          {ctx.image([...path, 'image'], section.image, { alt: '', fill: true, sizes: '(min-width:1024px) 1000px, 100vw' })}
          <span className="pointer-events-none absolute inset-0 bg-[#122c46]/35" />
          {id ? (
            <span className="pointer-events-none absolute top-1/2 left-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[var(--color-ink)]">
              <Play size={30} className="ml-1" fill="currentColor" />
            </span>
          ) : (
            link?.href && (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Play size={18} fill="currentColor" />
                <span>{ctx.t(link.title) || ui(ctx.locale, 'watchOnYoutube')}</span>
                <ArrowUpRight size={16} />
              </a>
            )
          )}
        </>
      )}
    </div>
  );

  if (split) {
    return (
      <SectionShell section={section}>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-6">
            <SectionHead section={section} index={index} ctx={ctx} align="left" />
            <SectionCtas section={section} ctx={ctx} />
          </div>
          {player}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section}>
      <SectionHead section={section} index={index} ctx={ctx} />
      <div className={cn('mx-auto mt-16 max-w-5xl')}>{player}</div>
      <SectionCtas section={section} ctx={ctx} className="mt-10 justify-center" />
    </SectionShell>
  );
}
