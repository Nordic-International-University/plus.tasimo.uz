import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LOCALES, type Locale } from '@/lib/doc/types';
import { ui } from '@/lib/ui-strings';
import { SiteLogo } from '../logo/SiteLogo';
import type { RenderCtx } from '../sections/ctx';
import { isDarkBg } from '../sections/shell';

const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', ru: 'RU' };

/**
 * Sarlavha: sahifa tepasida shaffof, skroll boshlanganda suzuvchi oq panelga aylanadi va logotip qushchaga yig'iladi
 * (data-scrolled / data-moved — ClientEnhancer). Birinchi bo'lim to'q bo'lsa tepada matn oq (data-tone="light").
 * Mobil menyu — <details> (JS'siz).
 */
export function Header({ ctx }: { ctx: RenderCtx }) {
  const { doc, locale } = ctx;
  const nav = doc.header.nav;
  const secondary = doc.header.secondaryCta;
  const first = doc.sections.find((section) => !section.hidden || ctx.editing);
  const tone = first && isDarkBg(first.bg) ? 'light' : 'dark';
  const logoId = doc.header.logoId ?? 'bird';

  const links = (mobile: boolean) =>
    nav.map((link, i) => (
      <span key={link.id} className="contents">
        {ctx.link(link.href, ctx.text(['header', 'nav', i, 'label'], link.label, { as: 'span', placeholder: 'Menyu' }), {
          className: mobile ? 'rounded-xl px-3 py-3 text-base font-semibold text-[var(--color-ink)] hover:bg-black/[0.04]' : 'hdr-link',
          sectionId: 'header',
        })}
      </span>
    ));

  const langs = (mobile: boolean) => (
    <div className={cn('flex items-center gap-1 text-xs font-bold', mobile ? 'text-[var(--color-ink)]' : '')} aria-label={ui(locale, 'language')}>
      {LOCALES.map((code) => {
        const active = code === locale;
        const className = cn('rounded-full px-2.5 py-1.5 transition', active ? 'bg-current/10 opacity-100' : 'opacity-55 hover:opacity-100');
        return ctx.editing ? (
          <span key={code} className={className}>
            {LOCALE_LABEL[code]}
          </span>
        ) : (
          <a key={code} href={`/${code}`} hrefLang={code} lang={code} aria-current={active ? 'true' : undefined} className={className}>
            {LOCALE_LABEL[code]}
          </a>
        );
      })}
    </div>
  );

  return (
    <header className={cn('site-header', ctx.editing && 'site-header-static')} data-scrolled="false" data-tone={tone}>
      <div className="hdr-bar">
        <a href={ctx.editing ? undefined : `/${locale}`} className="hdr-logo" data-logo={logoId} aria-label="TASIMO Plus">
          <SiteLogo id={logoId} uid="hdr" />
        </a>

        <nav className="hidden items-center lg:flex" aria-label="Main">
          {links(false)}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">{langs(false)}</div>
          {secondary && <div className="hidden md:block">{ctx.cta(secondary, { sectionId: 'header', variant: 'ghost', className: '!min-h-[42px] text-sm' })}</div>}
          <div className={cn(!ctx.editing && 'hidden sm:block')}>
            {ctx.cta(doc.header.cta, { sectionId: 'header', variant: 'primary', className: '!min-h-[42px] !px-5 text-sm' })}
          </div>

          {!ctx.editing && (
            <details className="group relative lg:hidden">
              <summary
                className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full text-[var(--hdr-fg)] hover:bg-current/5 [&::-webkit-details-marker]:hidden"
                aria-label={ui(locale, 'menu')}
              >
                <Menu size={22} className="group-open:hidden" />
                <X size={22} className="hidden group-open:block" />
              </summary>
              <div className="absolute top-14 right-0 flex w-[min(88vw,340px)] flex-col gap-1 rounded-2xl border border-black/[0.06] bg-white p-3 text-[var(--color-ink)] shadow-[0_24px_60px_-24px_rgba(12,26,58,0.35)]">
                {links(true)}
                <div className="mt-2 sm:hidden">{ctx.cta(doc.header.cta, { sectionId: 'header', variant: 'primary', className: 'w-full' })}</div>
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
                  {langs(true)}
                  {secondary && ctx.cta(secondary, { sectionId: 'header', variant: 'ghost', className: '!text-[var(--color-ink)]' })}
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
