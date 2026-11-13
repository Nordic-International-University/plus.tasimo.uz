import { createDefaultDoc } from './default-doc';
import { CTA_LINK_RE } from './links';
import {
  ACCENTS,
  BACKGROUNDS,
  CTA_KEYS,
  ICONS,
  LOGO_IDS,
  SECTION_TYPES,
  SHAPES,
  SOCIAL_NETWORKS,
  type Box,
  type CtaKey,
  type Locale,
  type PlusDoc,
  type Section,
  type Text,
} from './types';

/**
 * Backend'dan kelgan (yoki muharrirdagi) hujjatni xavfsiz, to'liq PlusDoc'ga keltirish: yo'q maydonlar standartdan,
 * noma'lum bo'lim turlari tashlanadi, havolalar qayta tekshiriladi. Sayt hech qachon xom JSON'ga ishonmaydi.
 */

const isObj = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const str = (value: unknown, max = 8000): string => (typeof value === 'string' ? value.slice(0, max) : '');
const oneOf = <T extends string>(value: unknown, list: readonly T[], fallback: T): T =>
  typeof value === 'string' && (list as readonly string[]).includes(value) ? (value as T) : fallback;
const optOneOf = <T extends string>(value: unknown, list: readonly T[]): T | undefined =>
  typeof value === 'string' && (list as readonly string[]).includes(value) ? (value as T) : undefined;

export function text(value: unknown): Text {
  if (isObj(value)) return { en: str(value.en), ru: str(value.ru) };
  if (typeof value === 'string') return { en: value, ru: value };
  return { en: '', ru: '' };
}

const optText = (value: unknown): Text | undefined => (value === undefined ? undefined : text(value));

/** Matn tanlash: tanlangan til bo'sh bo'lsa — inglizchasi */
export function pick(value: Text | undefined, locale: Locale): string {
  if (!value) return '';
  if (value[locale]?.trim()) return value[locale];
  if (value.en?.trim()) return value.en;
  return value.ru?.trim() ? value.ru : '';
}

/** Rasm: https/http yoki nisbiy yo'l. Havola: + #anchor, mailto, tel */
export function safeUrl(value: unknown, image = false): string {
  const url = str(value, 1000).trim();
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url;
  if (!image && (/^#[A-Za-z0-9_-]{0,60}$/.test(url) || /^mailto:[^\s<>"']{3,200}$/i.test(url) || /^tel:\+?[0-9 ()-]{3,30}$/i.test(url))) {
    return url;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

/** Sayt ichidagi havola: safeUrl + «cta:register» (Umumiy → Tugmalar manziliga olib boradi, bosish kuzatiladi) */
export function safeLink(value: unknown): string {
  const raw = str(value, 1000).trim();
  return CTA_LINK_RE.test(raw) ? raw : safeUrl(raw);
}

const ID_RE = /^[A-Za-z0-9_-]{1,48}$/;
const safeId = (value: unknown, fallback: string) => (typeof value === 'string' && ID_RE.test(value) ? value : fallback);

function box(raw: unknown, index: number): Box {
  const value = isObj(raw) ? raw : {};
  const span = value.span === 2 ? 2 : 1;
  return {
    id: safeId(value.id, `b${index}`),
    title: optText(value.title),
    text: optText(value.text),
    label: optText(value.label),
    value: value.value === undefined ? undefined : str(value.value, 80),
    image: value.image === undefined ? undefined : safeUrl(value.image, true),
    icon: optOneOf(value.icon, ICONS),
    shape: optOneOf(value.shape, SHAPES),
    span,
    tall: value.tall === true,
    accent: optOneOf(value.accent, ACCENTS),
    href: value.href === undefined ? undefined : safeLink(value.href),
  };
}

function section(raw: unknown, index: number): Section | null {
  if (!isObj(raw)) return null;
  const type = optOneOf(raw.type, SECTION_TYPES);
  if (!type) return null;
  const items = Array.isArray(raw.items) ? raw.items.slice(0, 60).map(box) : [];
  const columns = raw.columns === 2 || raw.columns === 3 || raw.columns === 4 ? raw.columns : undefined;
  const ctas = Array.isArray(raw.ctas) ? raw.ctas.filter((key): key is CtaKey => (CTA_KEYS as readonly string[]).includes(key as string)) : undefined;
  const anchor = typeof raw.anchor === 'string' && /^[a-z0-9-]{0,40}$/.test(raw.anchor) ? raw.anchor : '';
  return {
    id: safeId(raw.id, `s${index}`),
    type,
    variant: str(raw.variant, 30),
    hidden: raw.hidden === true,
    anchor,
    bg: oneOf(raw.bg, BACKGROUNDS, 'plain'),
    eyebrow: optText(raw.eyebrow),
    title: optText(raw.title),
    subtitle: optText(raw.subtitle),
    body: optText(raw.body),
    image: raw.image === undefined ? undefined : safeUrl(raw.image, true),
    video: raw.video === undefined ? undefined : safeUrl(raw.video),
    ctas,
    items,
    layout: raw.layout === undefined ? undefined : str(raw.layout, 20),
    columns,
    countdownTo: typeof raw.countdownTo === 'string' && !Number.isNaN(Date.parse(raw.countdownTo)) ? raw.countdownTo : undefined,
  };
}

export function normalizeDoc(raw: unknown, accountUrl?: string): PlusDoc {
  const base = createDefaultDoc(accountUrl);
  if (!isObj(raw)) return base;

  const header = isObj(raw.header) ? raw.header : {};
  const ctasRaw = isObj(raw.ctas) ? raw.ctas : {};
  const footer = isObj(raw.footer) ? raw.footer : {};
  const seo = isObj(raw.seo) ? raw.seo : {};

  const nav = (list: unknown) =>
    Array.isArray(list)
      ? list.slice(0, 20).map((item, index) => {
          const value = isObj(item) ? item : {};
          return { id: safeId(value.id, `l${index}`), label: text(value.label), href: safeLink(value.href) };
        })
      : [];

  const ids = new Set<string>();
  const sections = (Array.isArray(raw.sections) ? raw.sections : [])
    .slice(0, 40)
    .map(section)
    .filter((item): item is Section => {
      if (!item || ids.has(item.id)) return false;
      ids.add(item.id);
      return true;
    });

  return {
    v: 1,
    header: {
      nav: Array.isArray(header.nav) ? nav(header.nav) : base.header.nav,
      cta: oneOf(header.cta, CTA_KEYS, base.header.cta),
      secondaryCta: header.secondaryCta === null ? null : optOneOf(header.secondaryCta, CTA_KEYS) ?? base.header.secondaryCta,
      // Eski hujjatda (sarlavha bor, logoId yo'q) — oldingi qushcha logotip qoladi; butunlay yangi hujjat — standartdagi
      logoId: oneOf(header.logoId, LOGO_IDS, isObj(raw.header) ? 'bird' : base.header.logoId ?? 'official'),
    },
    ctas: Object.fromEntries(
      CTA_KEYS.map((key) => {
        const item = isObj(ctasRaw[key]) ? (ctasRaw[key] as Record<string, unknown>) : null;
        return [key, item ? { label: text(item.label), href: safeUrl(item.href) || base.ctas[key].href } : base.ctas[key]];
      }),
    ) as PlusDoc['ctas'],
    sections: Array.isArray(raw.sections) ? sections : base.sections,
    footer: {
      tagline: footer.tagline === undefined ? base.footer.tagline : text(footer.tagline),
      columns: Array.isArray(footer.columns)
        ? footer.columns.slice(0, 6).map((column, index) => {
            const value = isObj(column) ? column : {};
            return { id: safeId(value.id, `c${index}`), title: text(value.title), links: nav(value.links) };
          })
        : base.footer.columns,
      contacts: Array.isArray(footer.contacts)
        ? footer.contacts.slice(0, 10).map((contact, index) => {
            const value = isObj(contact) ? contact : {};
            return {
              id: safeId(value.id, `ct${index}`),
              icon: oneOf(value.icon, ['mail', 'phone', 'pin', 'telegram', 'globe'] as const, 'globe'),
              label: text(value.label),
              href: safeUrl(value.href),
            };
          })
        : base.footer.contacts,
      socials: Array.isArray(footer.socials)
        ? footer.socials.slice(0, 10).flatMap((social, index) => {
            const value = isObj(social) ? social : {};
            const network = optOneOf(value.network, SOCIAL_NETWORKS);
            return network ? [{ id: safeId(value.id, `so${index}`), network, href: safeUrl(value.href) }] : [];
          })
        : base.footer.socials,
      copyright: footer.copyright === undefined ? base.footer.copyright : text(footer.copyright),
      note: footer.note === undefined ? base.footer.note : text(footer.note),
    },
    seo: {
      title: seo.title === undefined ? base.seo.title : text(seo.title),
      description: seo.description === undefined ? base.seo.description : text(seo.description),
      keywords: seo.keywords === undefined ? base.seo.keywords : text(seo.keywords),
      ogImage: safeUrl(seo.ogImage, true),
    },
  };
}

/** YouTube havolasidan video ID (watch, youtu.be, shorts, embed, live) — boshqa hostlar rad etiladi */
export function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = parsed.pathname.slice(1);
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
