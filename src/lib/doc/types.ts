/**
 * Landing hujjati — sayt, muharrir va backend (JSON sifatida saqlaydi) uchun yagona tuzilma.
 * Hamma matn ikki tilda (en, ru). Backend faqat umumiy shaklni tekshiradi; dizayn shu yerda.
 */

export const LOCALES = ['en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export type Text = { en: string; ru: string };

/** Hujjatdagi har qanday joyga yo'l: ['sections', 3, 'items', 1, 'title'] */
export type Path = (string | number)[];

/**
 * Logotip variantlari (Umumiy → Logotip): bird — TASIMO qushcha emblemasi + PLUS (oldingi logotip);
 * official — Brand Guidelines dagi rasmiy logotip (oq TASIMO + gradientli PLUS plashkasi); qolganlari — branding/ dagi PNG'lardan
 * vektorlashtirilgan konsept logotiplar (scripts/trace-logos.py → gen-logos.mjs). Hammasi skrollda jonlanadi.
 */
export const LOGO_IDS = ['bird', 'official', 'mountain', 'compass', 'compass2', 'tent'] as const;
export type LogoId = (typeof LOGO_IDS)[number];

export const CTA_KEYS = ['register', 'participate', 'login'] as const;
export type CtaKey = (typeof CTA_KEYS)[number];

export interface CtaLink {
  label: Text;
  href: string;
}

export const SECTION_TYPES = [
  'hero',
  'about',
  'features',
  'seasons',
  'steps',
  'stats',
  'gallery',
  'video',
  'testimonials',
  'faq',
  'cta',
  'richtext',
  'logos',
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

/** plate — brend: PLUS plashkasi shakli (chap-yuqori va o'ng-past yumaloq) */
export const SHAPES = ['plate', 'rounded', 'square', 'pill', 'circle', 'blob', 'arch', 'hex', 'tilt', 'ticket'] as const;
export type Shape = (typeof SHAPES)[number];

export const BACKGROUNDS = ['night', 'paper', 'aurora', 'sunset', 'grid', 'plain'] as const;
export type Background = (typeof BACKGROUNDS)[number];

export const ACCENTS = ['teal', 'violet', 'amber', 'coral', 'sky', 'lime'] as const;
export type Accent = (typeof ACCENTS)[number];

export const ICONS = [
  'sigma',
  'pi',
  'infinity',
  'compass',
  'globe',
  'plane',
  'trophy',
  'medal',
  'certificate',
  'calendar',
  'clock',
  'users',
  'languages',
  'laptop',
  'chart',
  'star',
  'map',
  'lightbulb',
  'shield',
  'rocket',
  'book',
  'target',
  'sparkles',
  'mountain',
  'snowflake',
  'sun',
] as const;
export type IconName = (typeof ICONS)[number];

/** Bo'lim ichidagi «quti» — karta, mavsum, qadam, raqam, rasm, savol-javob, fikr … */
export interface Box {
  id: string;
  title?: Text;
  text?: Text;
  /** Kichik yorliq: mavsum oralig'i, raqam qo'shimchasi, muallif lavozimi … */
  label?: Text;
  /** Raqam (statistika) yoki qisqa qiymat: "4", "100%", "EN · RU" */
  value?: string;
  image?: string;
  icon?: IconName;
  shape?: Shape;
  /** Kenglik: 1 — oddiy, 2 — ikki ustun */
  span?: 1 | 2;
  /** Galereyada baland rasm */
  tall?: boolean;
  accent?: Accent;
  href?: string;
}

export interface Section {
  id: string;
  type: SectionType;
  variant: string;
  hidden: boolean;
  /** Menyudagi havola uchun (#about) */
  anchor: string;
  bg: Background;
  eyebrow?: Text;
  title?: Text;
  subtitle?: Text;
  body?: Text;
  image?: string;
  /** YouTube havolasi (video bo'limi) */
  video?: string;
  /** Bo'limdagi tugmalar */
  ctas?: CtaKey[];
  items: Box[];
  /** Qutilar joylashuvi (galereya: bento | masonry | grid | carousel) */
  layout?: string;
  columns?: 2 | 3 | 4;
  /** Hisoblagich (cta bo'limi): ISO sana — keyingi mavsum boshlanishi */
  countdownTo?: string;
}

export interface NavLink {
  id: string;
  label: Text;
  href: string;
}

export interface FooterColumn {
  id: string;
  title: Text;
  links: NavLink[];
}

export const SOCIAL_NETWORKS = ['instagram', 'facebook', 'tiktok', 'youtube', 'telegram', 'x', 'linkedin'] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export interface PlusDoc {
  v: 1;
  /** logoId — «logo» emas: backend «logo» nomli maydonni rasm havolasi deb tekshiradi */
  header: { nav: NavLink[]; cta: CtaKey; secondaryCta?: CtaKey | null; logoId?: LogoId };
  ctas: Record<CtaKey, CtaLink>;
  sections: Section[];
  footer: {
    tagline: Text;
    columns: FooterColumn[];
    contacts: { id: string; icon: 'mail' | 'phone' | 'pin' | 'telegram' | 'globe'; label: Text; href: string }[];
    socials: { id: string; network: SocialNetwork; href: string }[];
    copyright: Text;
    note: Text;
  };
  seo: { title: Text; description: Text; keywords: Text; ogImage: string };
}

/** Saytga backend beradigan piksel sozlamalari */
export interface PixelSettings {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  ga4Id: string | null;
  googleAdsId: string | null;
  googleAdsLeadLabel: string | null;
}

export const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'ru';
