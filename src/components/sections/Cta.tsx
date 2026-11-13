import { Plane } from 'lucide-react';
import { ui } from '@/lib/ui-strings';
import { PlusMark } from '../logo/PlusLogo';
import { Countdown } from '../site/Countdown';
import type { SectionProps } from './ctx';
import { SectionCtas, SectionShell } from './shell';

/**
 * Yakuniy chaqiriq: boarding (bort-talon — sayohat uslubi) yoki banner (sodda).
 * Bort-talondagi yo'nalish (ONLINE → TAS) — birinchi ikki qutining qiymati, maydonlar — hamma qutilar (hammasi tahrirlanadi).
 */
export function Cta({ section, index, ctx }: SectionProps) {
  const path = ['sections', index];
  const boarding = section.variant !== 'banner';
  const countdown = section.countdownTo ? (
    <Countdown
      to={section.countdownTo}
      labels={{ days: ui(ctx.locale, 'days'), hours: ui(ctx.locale, 'hours'), minutes: ui(ctx.locale, 'minutes'), seconds: ui(ctx.locale, 'seconds') }}
    />
  ) : null;

  const copy = (
    <div className="flex flex-col gap-6">
      {ctx.text([...path, 'eyebrow'], section.eyebrow, { as: 'span', className: 'eyebrow self-start', placeholder: 'Yorliq' })}
      {ctx.text([...path, 'title'], section.title, { as: 'h2', className: 'title-lg', multiline: true, placeholder: 'Sarlavha' })}
      {ctx.text([...path, 'subtitle'], section.subtitle, { as: 'p', className: 'lead max-w-xl', multiline: true, placeholder: 'Izoh' })}
      {countdown}
      <SectionCtas section={section} ctx={ctx} className="pt-2" />
    </div>
  );

  if (!boarding) {
    return (
      <SectionShell section={section}>
        <div className="mx-auto max-w-3xl text-center [&_.eyebrow]:self-center [&>div]:items-center">{copy}</div>
      </SectionShell>
    );
  }

  const [from, to] = section.items;
  return (
    <SectionShell section={section}>
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        {copy}
        {/* Bort-talon */}
        <div className="relative" data-reveal="">
          <div className="shape-ticket relative grid grid-cols-[1fr_auto] overflow-hidden bg-white text-[var(--color-ink)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)]">
            <div className="flex min-w-0 flex-col gap-7 p-7 sm:p-9">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2.5 text-sm font-bold tracking-[0.08em] text-[var(--color-navy)]">
                  <PlusMark size={26} /> TASIMO PLUS
                </span>
                <span className="text-[0.68rem] font-bold tracking-[0.18em] text-black/40 uppercase">{ui(ctx.locale, 'boardingPass')}</span>
              </div>
              <div className="flex items-center gap-4 font-display text-[var(--color-navy)]">
                <span className="text-3xl font-medium sm:text-4xl">{from?.value || '—'}</span>
                <span className="relative h-px flex-1 border-t border-dashed border-[var(--color-navy)]/30">
                  <Plane size={18} className="absolute -top-[10px] left-1/2 -translate-x-1/2 rotate-45 bg-white text-[var(--color-navy)]" aria-hidden="true" />
                </span>
                <span className="text-3xl font-medium sm:text-4xl">{to?.value || '—'}</span>
              </div>
              <dl className="grid grid-cols-1 gap-5 border-t border-dashed border-black/12 pt-6 sm:grid-cols-3">
                {section.items.map((item, i) => {
                  const itemPath = [...path, 'items', i];
                  return (
                    <span key={item.id} className="contents">
                      {ctx.box(
                        itemPath,
                        item,
                        <>
                          <dt className="text-[0.66rem] font-bold tracking-[0.16em] text-black/40 uppercase">
                            {ctx.text([...itemPath, 'label'], item.label, { as: 'span', placeholder: 'Yorliq' })}
                          </dt>
                          <dd className="text-base font-semibold break-words text-[var(--color-navy)]">
                            {ctx.plain([...itemPath, 'value'], item.value, { as: 'span', placeholder: 'Qiymat' })}
                          </dd>
                          {ctx.text([...itemPath, 'title'], item.title, { as: 'dd', className: 'text-xs text-black/55', placeholder: 'Izoh' })}
                        </>,
                        { className: 'flex flex-col gap-1 rounded-lg', style: { '--reveal-delay': `${i * 80}ms` } as React.CSSProperties },
                      )}
                    </span>
                  );
                })}
                {ctx.add([...path, 'items'], 'Maydon')}
              </dl>
            </div>
            <div className="relative flex w-20 flex-col items-center justify-center border-l border-dashed border-black/12 bg-[var(--color-paper)] sm:w-24">
              <Barcode />
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function Barcode() {
  const bars = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3];
  return (
    <svg viewBox="0 0 24 80" className="h-24 w-6 opacity-80" aria-hidden="true" focusable="false">
      {bars.map((width, i) => {
        const y = bars.slice(0, i).reduce((sum, w) => sum + w + 1.2, 0);
        return <rect key={i} x="0" y={y} width="24" height={width} fill="#122c46" />;
      })}
    </svg>
  );
}
