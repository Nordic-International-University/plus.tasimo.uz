'use client';

import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Menu, MousePointerClick, PanelBottom, Plus, Search, Shapes, Trash2 } from 'lucide-react';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { linkKind } from '@/lib/doc/links';
import { pick } from '@/lib/doc/normalize';
import { newId } from '@/lib/doc/presets';
import { withPlusRef } from '@/lib/doc/ref';
import { plainText } from '@/lib/doc/rich';
import { CTA_KEYS, SOCIAL_NETWORKS, type LogoId, type Path, type PlusDoc, type Text } from '@/lib/doc/types';
import { LogoPicker } from './LogoPicker';
import { useEditor } from './EditorContext';
import { CTA_LABEL, externalLinkError, Field, LinkField, TextInput, TextPair } from './fields';

const empty: Text = { en: '', ru: '' };

export type GlobalGroup = 'logo' | 'ctas' | 'nav' | 'footer' | 'seo';

const LOGO_SUMMARY: Record<LogoId, string> = {
  bird: 'TASIMO qushcha',
  official: 'Rasmiy (Brand Guidelines)',
  mountain: 'Tog‘ va chodir',
  compass: 'Kompas',
  compass2: 'Kompas guli',
  tent: 'Chodir harfi',
};

/** «Bo'lim» yoki «Tugma» turidagi havolada xato bo'lmaydi; tashqi havola — saytdagi qoidalar bilan */
const linkError = (href: string) => (linkKind(href) === 'url' ? externalLinkError(href) : null);

/** Yopiq guruhda ham xato ko'rinsin — sarlavhada qizil belgi */
function groupErrors(doc: PlusDoc): Record<GlobalGroup, number> {
  const footerLinks = doc.footer.columns.flatMap((column) => column.links);
  return {
    ctas: CTA_KEYS.filter((key) => !doc.ctas[key].href || externalLinkError(doc.ctas[key].href)).length,
    nav: doc.header.nav.filter((link) => linkError(link.href)).length,
    footer:
      footerLinks.filter((link) => linkError(link.href)).length +
      doc.footer.contacts.filter((contact) => externalLinkError(contact.href)).length +
      doc.footer.socials.filter((social) => externalLinkError(social.href)).length,
    seo: 0,
    logo: 0,
  };
}

/**
 * «Umumiy» paneli — sahifaning umumiy qismlari alohida guruhlarda (akkordeon): bittasi ochiq, qolganlari yopiq turadi.
 * Yopiq guruh sarlavhasida qisqacha mazmun va xatolar soni ko'rinadi — uzun ro'yxatda adashib qolinmaydi.
 */
export function GlobalSettings({ open, onOpen }: { open: GlobalGroup | null; onOpen: (group: GlobalGroup | null) => void }) {
  const editor = useEditor();
  const { doc, locale } = editor;
  const set = (path: Path, value: unknown) => editor.setValue(path, value, path.join('.'));
  const label = (text: Text) => plainText(pick(text, locale)).trim();
  const errors = groupErrors(doc);
  const toggle = (group: GlobalGroup) => onOpen(open === group ? null : group);

  return (
    <div className="flex min-h-full flex-col gap-3 bg-slate-50/80 p-3">
      <p className="px-1 text-xs leading-relaxed text-slate-400">Sahifaning hamma bo‘limlari uchun umumiy qismlar. Kerakli guruhni oching.</p>

      <Group
        id="logo"
        open={open === 'logo'}
        onToggle={() => toggle('logo')}
        icon={<Shapes size={18} />}
        title="Logotip"
        summary={LOGO_SUMMARY[doc.header.logoId ?? 'bird']}
        errors={0}
      >
        <p className="text-xs leading-relaxed text-slate-400">
          Sarlavha va footer’dagi logotip. Sahifa skroll qilinganda harflar yig‘iladi, belgi qoladi — ustiga sichqonchani olib boring.
        </p>
        <LogoPicker value={doc.header.logoId ?? 'bird'} onChange={(id) => set(['header', 'logoId'], id)} />
      </Group>

      <Group
        id="ctas"
        open={open === 'ctas'}
        onToggle={() => toggle('ctas')}
        icon={<MousePointerClick size={18} />}
        title="Tugmalar va ularning havolasi"
        summary={CTA_KEYS.map((key) => label(doc.ctas[key].label) || CTA_LABEL[key]).join(' · ')}
        errors={errors.ctas}
      >
        <p className="text-xs leading-relaxed text-slate-400">
          Saytdagi uchala tugma (va «Tugma» turidagi menyu/footer havolalari) shu manzillarga olib boradi. Havolaga manba belgisi avtomatik
          qo‘shiladi — account’da kim landingdan kelgani ko‘rinadi.
        </p>
        {CTA_KEYS.map((key) => {
          const href = doc.ctas[key].href;
          const error = externalLinkError(href) ?? (href ? null : 'Havola kiriting');
          return (
            <div key={key} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs font-bold text-slate-700">{CTA_LABEL[key]}</span>
              <TextPair value={doc.ctas[key].label} onChange={(v) => set(['ctas', key, 'label'], v)} />
              <Field label="Manzil" error={error} hint={<span className="break-all">Bosilganda: {withPlusRef(href, key)}</span>}>
                <TextInput type="url" value={href} invalid={Boolean(error)} onChange={(v) => set(['ctas', key, 'href'], v.trim())} placeholder="https://account.tasimo.uz/…" />
              </Field>
            </div>
          );
        })}

        <SubHeading title="Sarlavhadagi tugmalar" />
        <Field label="Asosiy tugma">
          <select className="ed-input" value={doc.header.cta} onChange={(e) => set(['header', 'cta'], e.target.value)}>
            {CTA_KEYS.map((key) => (
              <option key={key} value={key}>
                {CTA_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ikkinchi tugma">
          <select className="ed-input" value={doc.header.secondaryCta ?? ''} onChange={(e) => set(['header', 'secondaryCta'], e.target.value || null)}>
            <option value="">Yo‘q</option>
            {CTA_KEYS.map((key) => (
              <option key={key} value={key}>
                {CTA_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
      </Group>

      <Group
        id="nav"
        open={open === 'nav'}
        onToggle={() => toggle('nav')}
        icon={<Menu size={18} />}
        title="Menyu"
        summary={doc.header.nav.map((link) => label(link.label)).filter(Boolean).join(' · ') || 'Havola yo‘q'}
        errors={errors.nav}
      >
        <p className="text-xs leading-relaxed text-slate-400">Sahifa tepasidagi havolalar (telefonda — menyu tugmasi ichida).</p>
        {doc.header.nav.map((link, i) => (
          <ListItem key={link.id} path={['header', 'nav']} index={i} total={doc.header.nav.length} title={`${i + 1}-havola`}>
            <TextPair value={link.label} onChange={(v) => set(['header', 'nav', i, 'label'], v)} />
            <LinkField doc={doc} locale={locale} value={link.href} onChange={(v) => set(['header', 'nav', i, 'href'], v)} />
          </ListItem>
        ))}
        <AddButton label="Havola" onClick={() => editor.insert(['header', 'nav'], doc.header.nav.length, { id: newId('n'), label: { en: 'Link', ru: 'Ссылка' }, href: '#' })} />
      </Group>

      <Group
        id="footer"
        open={open === 'footer'}
        onToggle={() => toggle('footer')}
        icon={<PanelBottom size={18} />}
        title="Footer"
        summary={`${doc.footer.columns.length} ustun · ${doc.footer.contacts.length} kontakt · ${doc.footer.socials.length} tarmoq`}
        errors={errors.footer}
      >
        <SubHeading title="Shior" first />
        <TextPair value={doc.footer.tagline} onChange={(v) => set(['footer', 'tagline'], v)} multiline />

        <SubHeading title="Havola ustunlari" count={doc.footer.columns.length} />
        {doc.footer.columns.map((column, ci) => (
          <div key={column.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Ustun {ci + 1}</span>
              <button
                type="button"
                className="ed-tool ed-tool-light ed-tool-danger"
                title="Ustunni o‘chirish"
                onClick={() => editor.removeWithUndo(['footer', 'columns'], ci, `Ustun ${ci + 1} o‘chirildi`)}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <Field label="Ustun nomi">
              <TextPair value={column.title} onChange={(v) => set(['footer', 'columns', ci, 'title'], v)} />
            </Field>
            {column.links.map((link, li) => (
              <ListItem key={link.id} path={['footer', 'columns', ci, 'links']} index={li} total={column.links.length} title={`${li + 1}-havola`}>
                <TextPair value={link.label} onChange={(v) => set(['footer', 'columns', ci, 'links', li, 'label'], v)} />
                <LinkField doc={doc} locale={locale} value={link.href} onChange={(v) => set(['footer', 'columns', ci, 'links', li, 'href'], v)} />
              </ListItem>
            ))}
            <AddButton label="Havola" onClick={() => editor.insert(['footer', 'columns', ci, 'links'], column.links.length, { id: newId('l'), label: { en: 'Link', ru: 'Ссылка' }, href: '' })} />
          </div>
        ))}
        <AddButton label="Ustun" onClick={() => editor.insert(['footer', 'columns'], doc.footer.columns.length, { id: newId('c'), title: { en: 'Column', ru: 'Колонка' }, links: [] })} />

        <SubHeading title="Kontaktlar" count={doc.footer.contacts.length} />
        {doc.footer.contacts.map((contact, i) => {
          const error = externalLinkError(contact.href);
          return (
            <ListItem key={contact.id} path={['footer', 'contacts']} index={i} total={doc.footer.contacts.length} title={`${i + 1}-kontakt`}>
              <select className="ed-input" value={contact.icon} onChange={(e) => set(['footer', 'contacts', i, 'icon'], e.target.value)}>
                <option value="mail">Email</option>
                <option value="phone">Telefon</option>
                <option value="pin">Manzil</option>
                <option value="telegram">Telegram</option>
                <option value="globe">Sayt</option>
              </select>
              <TextPair value={contact.label} onChange={(v) => set(['footer', 'contacts', i, 'label'], v)} />
              <TextInput
                value={contact.href}
                invalid={Boolean(error)}
                onChange={(v) => set(['footer', 'contacts', i, 'href'], v.trim())}
                placeholder="mailto:… / tel:… / https://… (bo‘sh — havolasiz)"
              />
              {error && <span className="text-xs text-red-600">{error}</span>}
            </ListItem>
          );
        })}
        <AddButton label="Kontakt" onClick={() => editor.insert(['footer', 'contacts'], doc.footer.contacts.length, { id: newId('ct'), icon: 'mail', label: empty, href: '' })} />

        <SubHeading title="Ijtimoiy tarmoqlar" count={doc.footer.socials.length} />
        {doc.footer.socials.map((social, i) => {
          const error = externalLinkError(social.href);
          return (
            <ListItem key={social.id} path={['footer', 'socials']} index={i} total={doc.footer.socials.length} title={`${i + 1}-tarmoq`}>
              <select className="ed-input" value={social.network} onChange={(e) => set(['footer', 'socials', i, 'network'], e.target.value)}>
                {SOCIAL_NETWORKS.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
              <TextInput type="url" value={social.href} invalid={Boolean(error)} onChange={(v) => set(['footer', 'socials', i, 'href'], v.trim())} placeholder="https://…" />
              {error && <span className="text-xs text-red-600">{error}</span>}
            </ListItem>
          );
        })}
        <AddButton label="Tarmoq" onClick={() => editor.insert(['footer', 'socials'], doc.footer.socials.length, { id: newId('so'), network: 'instagram', href: '' })} />

        <SubHeading title="Eng pastki qator" />
        <Field label="Mualliflik huquqi">
          <TextPair value={doc.footer.copyright} onChange={(v) => set(['footer', 'copyright'], v)} />
        </Field>
        <Field label="Pastki izoh">
          <TextPair value={doc.footer.note} onChange={(v) => set(['footer', 'note'], v)} />
        </Field>
      </Group>

      <Group
        id="seo"
        open={open === 'seo'}
        onToggle={() => toggle('seo')}
        icon={<Search size={18} />}
        title="SEO (Google va ijtimoiy tarmoqlar)"
        summary={plainText(pick(doc.seo.title, locale)) || 'Sahifa sarlavhasi kiritilmagan'}
        errors={errors.seo}
      >
        <Field label="Sahifa sarlavhasi" hint="60 belgigacha — Google natijasida shu chiqadi">
          <TextPair plain value={doc.seo.title} onChange={(v) => set(['seo', 'title'], v)} />
        </Field>
        <Field label="Tavsif" hint="150–160 belgi">
          <TextPair plain value={doc.seo.description} onChange={(v) => set(['seo', 'description'], v)} multiline />
        </Field>
        <Field label="Kalit so‘zlar (vergul bilan)">
          <TextPair plain value={doc.seo.keywords} onChange={(v) => set(['seo', 'keywords'], v)} />
        </Field>
        <button type="button" className="ed-btn justify-start" onClick={() => editor.openImage(['seo', 'ogImage'])}>
          <ImagePlus size={16} /> {doc.seo.ogImage ? 'Ulashish rasmini almashtirish' : 'Ulashish rasmi (1200×630)'}
        </button>
      </Group>
    </div>
  );
}

/**
 * Guruh kartasi: sarlavha (belgi, nom, qisqacha mazmun, xatolar, strelka) bosilganda ochiladi/yopiladi.
 * Ochiq guruh sarlavhasi skrollda tepada qoladi (sticky) — qaysi guruh ichida ekaningiz doim ko'rinadi.
 * Karta overflow:hidden emas: aks holda sticky ishlamaydi.
 */
function Group({
  id,
  open,
  onToggle,
  icon,
  title,
  summary,
  errors,
  children,
}: {
  id: GlobalGroup;
  open: boolean;
  onToggle: () => void;
  icon: ReactNode;
  title: string;
  summary: string;
  errors: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  // Ochilganda guruh boshini panel tepasiga olib kelamiz (yuqoridagi guruh yopilib, joy siljiydi)
  useLayoutEffect(() => {
    const el = ref.current;
    const scroller = el?.closest<HTMLElement>('[data-ed-scroll]');
    if (!open || !el || !scroller) return;
    const offset = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
    if (offset < 0 || offset > scroller.clientHeight * 0.4) scroller.scrollTop += offset;
  }, [open]);

  return (
    <section
      ref={ref}
      data-ed-group={id}
      className={cn('rounded-xl border bg-white transition-shadow', open ? 'border-slate-300 shadow-[0_10px_30px_-18px_rgb(15_23_42/0.45)]' : 'border-slate-200 hover:border-slate-300')}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`ed-group-${id}`}
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left',
          open && 'sticky top-0 z-[3] rounded-b-none border-b border-slate-200 bg-white',
        )}
      >
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-lg transition-colors',
            open ? 'bg-[var(--ed-accent-soft)] text-[var(--ed-accent)]' : 'bg-slate-100 text-slate-500',
          )}
        >
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm leading-snug font-bold text-slate-800">{title}</span>
          <span className="truncate text-xs text-slate-400">{summary}</span>
        </span>
        {errors > 0 && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[0.7rem] font-bold text-red-600" title="Tuzatilishi kerak bo‘lgan havolalar">
            {errors} xato
          </span>
        )}
        <ChevronDown size={16} className={cn('shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div id={`ed-group-${id}`} className="flex flex-col gap-4 px-3.5 pt-4 pb-5">
          {children}
        </div>
      )}
    </section>
  );
}

/** Guruh ichidagi kichik bo'lim nomi — chiziq bilan ajratilgan */
function SubHeading({ title, count, first }: { title: string; count?: number; first?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', !first && 'mt-2 border-t border-slate-200 pt-5')}>
      <span className="text-xs font-bold text-slate-700">{title}</span>
      {count !== undefined && <span className="rounded-full bg-slate-100 px-1.5 py-px text-[0.68rem] font-bold text-slate-500">{count}</span>}
    </div>
  );
}

function AddButton({ onClick, label = 'Qo‘shish' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 self-start rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2c5fd8] hover:bg-[#2c5fd8]/[0.07]">
      <Plus size={14} /> {label}
    </button>
  );
}

/** Ro'yxat elementi: sarlavha qatori (nomi, tartib, o'chirish) va maydonlar — asboblar maydonlar ustiga tushmaydi */
function ListItem({ path, index, total, title, children }: { path: Path; index: number; total: number; title: string; children: ReactNode }) {
  const editor = useEditor();
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.7rem] font-bold tracking-wide text-slate-400 uppercase">{title}</span>
        <div className="flex gap-0.5">
          <button type="button" className="ed-tool ed-tool-light" disabled={index === 0} onClick={() => editor.move(path, index, index - 1)} title="Yuqoriga">
            <ArrowUp size={14} />
          </button>
          <button type="button" className="ed-tool ed-tool-light" disabled={index >= total - 1} onClick={() => editor.move(path, index, index + 1)} title="Pastga">
            <ArrowDown size={14} />
          </button>
          <button type="button" className="ed-tool ed-tool-light ed-tool-danger" onClick={() => editor.removeWithUndo(path, index, `${title} o‘chirildi`)} title="O‘chirish">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
