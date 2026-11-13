import { Facebook, Globe, Instagram, Linkedin, Mail, MapPin, Phone, Send, Twitter, Youtube, type LucideIcon } from 'lucide-react';
import type { SocialNetwork } from '@/lib/doc/types';
import { ui } from '@/lib/ui-strings';
import { SiteLogo } from '../logo/SiteLogo';
import type { RenderCtx } from '../sections/ctx';

const SOCIAL: Record<SocialNetwork, { icon: LucideIcon; label: string }> = {
  instagram: { icon: Instagram, label: 'Instagram' },
  facebook: { icon: Facebook, label: 'Facebook' },
  tiktok: { icon: Globe, label: 'TikTok' },
  youtube: { icon: Youtube, label: 'YouTube' },
  telegram: { icon: Send, label: 'Telegram' },
  x: { icon: Twitter, label: 'X' },
  linkedin: { icon: Linkedin, label: 'LinkedIn' },
};

const CONTACT_ICON = { mail: Mail, phone: Phone, pin: MapPin, telegram: Send, globe: Globe } as const;

/** Footer — hamma matn va havola muharrirda (statik matn yo'q). Havolalar ctx.link orqali (cta: — kuzatiladi) */
export function Footer({ ctx }: { ctx: RenderCtx }) {
  const { doc, locale } = ctx;
  const f = doc.footer;

  return (
    <footer className="sec-dark relative bg-[var(--color-night)] pt-20 pb-10 text-[var(--fg)]">
      <div className="container-x relative grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10">
        <div className="flex flex-col gap-6">
          <div className="h-11">
            <SiteLogo id={doc.header.logoId ?? 'bird'} uid="ftr" tone="light" />
          </div>
          {ctx.text(['footer', 'tagline'], f.tagline, { as: 'p', className: 'max-w-sm text-sm leading-relaxed text-muted', multiline: true, placeholder: 'Shior' })}
          {f.socials.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-[0.7rem] font-bold tracking-[0.16em] text-white/45 uppercase">{ui(locale, 'follow')}</span>
              <div className="flex flex-wrap gap-2">
                {f.socials.map((social) => {
                  const meta = SOCIAL[social.network];
                  const IconCmp = meta.icon;
                  return (
                    <span key={social.id} className="contents">
                      {ctx.link(
                        social.href,
                        <>
                          <IconCmp size={17} aria-hidden="true" />
                          <span className="sr-only">{meta.label}</span>
                        </>,
                        { className: 'grid h-10 w-10 place-items-center rounded-full border border-white/12 text-white/70 transition hover:border-white/30 hover:text-white' },
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {f.columns.map((column, ci) => (
          <div key={column.id} className="flex flex-col gap-4">
            {ctx.text(['footer', 'columns', ci, 'title'], column.title, { as: 'h3', className: 'text-sm font-semibold text-white', placeholder: 'Ustun' })}
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link, li) => (
                <li key={link.id}>
                  {ctx.link(link.href, ctx.text(['footer', 'columns', ci, 'links', li, 'label'], link.label, { as: 'span', placeholder: 'Havola' }), {
                    className: 'text-sm text-white/60 transition hover:text-white',
                    sectionId: 'footer',
                  })}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {f.contacts.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">{ui(locale, 'contacts')}</h3>
            <ul className="flex flex-col gap-3">
              {f.contacts.map((contact, i) => {
                const IconCmp = CONTACT_ICON[contact.icon];
                return (
                  <li key={contact.id}>
                    {ctx.link(
                      contact.href,
                      <>
                        <IconCmp size={15} className="mt-0.5 shrink-0 text-white/45" aria-hidden="true" />
                        {ctx.text(['footer', 'contacts', i, 'label'], contact.label, { as: 'span', placeholder: 'Kontakt' })}
                      </>,
                      { className: 'flex items-start gap-2.5 text-sm text-white/65 transition hover:text-white' },
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="container-x relative mt-16 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center">
        {ctx.text(['footer', 'copyright'], f.copyright, { as: 'span', placeholder: '© TASIMO' })}
        {ctx.text(['footer', 'note'], f.note, { as: 'span', placeholder: 'Izoh' })}
      </div>
    </footer>
  );
}
