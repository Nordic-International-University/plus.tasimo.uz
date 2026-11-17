import type { Metadata } from 'next';
import { pick } from './doc/normalize';
import { plainText } from './doc/rich';
import { LOCALES, type Locale, type PlusDoc } from './doc/types';

/**
 * SEO — kontentga (muharrir, «Umumiy → SEO») tegmaydi, faqat chiqishini mustahkamlaydi:
 * - sarlavhada brend bo'lishi shart (Google'da «TASIMO Plus» qidiruvi): admin yozgan sarlavhada bo'lmasa oxiriga qo'shiladi;
 * - SEO maydoni bo'sh qolsa — brend dekriptori (Brand Book) bilan zaxira matn;
 * - JSON-LD bitta bog'langan graf: Organization (TASIMO) ← WebSite (TASIMO Plus — Google'dagi sayt nomi) ← WebPage.
 */
export const BRAND = 'TASIMO Plus';
const BRAND_RE = /tasimo\s*plus|тасимо\s*плюс/i;

/** Brand Book dekriptori va qidiruvdagi boshqa yozilishlar (matnda emas, faqat sayt nomini tanish uchun) */
const DESCRIPTOR: Record<Locale, string> = {
  en: 'Mathematics Olympiad for Primary School Students',
  ru: 'математическая олимпиада для учащихся начальных классов',
};
const FALLBACK_DESCRIPTION: Record<Locale, string> = {
  en: 'TASIMO Plus — mathematics olympiad for primary school students: winter and summer seasons, an online qualifying round from home and the final in Tashkent.',
  ru: 'TASIMO Plus — математическая олимпиада для учащихся начальных классов: зимний и летний сезоны, онлайн-отбор из дома и финал в Ташкенте.',
};
const ALTERNATE_NAMES = ['Tasimo Plus', 'TASIMO PLUS', 'ТАСИМО Плюс', 'Тасимо Плюс'];

const ORGANIZATION_ID = 'https://tasimo.uz/#organization';

const text = (value: PlusDoc['seo']['title'], locale: Locale) => plainText(pick(value, locale)).replace(/\s+/g, ' ').trim();

export function seoTitle(doc: PlusDoc, locale: Locale): string {
  const title = text(doc.seo.title, locale);
  if (!title) return `${BRAND} — ${DESCRIPTOR[locale]}`;
  return BRAND_RE.test(title) ? title : `${title} — ${BRAND}`;
}

export function seoDescription(doc: PlusDoc, locale: Locale): string {
  return text(doc.seo.description, locale) || FALLBACK_DESCRIPTION[locale];
}

export function buildMetadata(doc: PlusDoc, locale: Locale, siteUrl: string): Metadata {
  const title = seoTitle(doc, locale);
  const description = seoDescription(doc, locale);
  const url = `${siteUrl}/${locale}`;
  // Admin rasm bermasa — opengraph-image.tsx (Next o'zi to'g'ri, xeshli havolani qo'yadi; qo'lda yozilgan yo'l 404 bo'ladi)
  const image = doc.seo.ogImage || null;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: pick(doc.seo.keywords, locale)
      .split(',')
      .map((word) => word.trim())
      .filter(Boolean),
    alternates: {
      canonical: url,
      languages: { ...Object.fromEntries(LOCALES.map((code) => [code, `${siteUrl}/${code}`])), 'x-default': `${siteUrl}/en` },
    },
    openGraph: {
      type: 'website',
      url,
      siteName: BRAND,
      title,
      description,
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    category: 'education',
  };
}

/**
 * JSON-LD — bitta `@graph`: Organization (TASIMO, tasimo.uz) ← WebSite (TASIMO Plus: Google qidiruvida sayt nomi,
 * bosh sahifa — subdomen ildizi) ← WebPage (shu til sahifasi). FAQ ko'rinib turgan bo'lsa sahifa — WebPage + FAQPage.
 */
export function buildJsonLd(doc: PlusDoc, locale: Locale, siteUrl: string, publishedAt: string | null = null): Record<string, unknown> {
  const url = `${siteUrl}/${locale}`;
  const websiteId = `${siteUrl}/#website`;
  const faq = doc.sections.find((section) => section.type === 'faq' && !section.hidden);
  const questions = (faq?.items ?? [])
    .map((item) => ({ q: plainText(pick(item.title, locale)).trim(), a: plainText(pick(item.text, locale)).trim() }))
    .filter((entry) => entry.q && entry.a)
    .map((entry) => ({ '@type': 'Question', name: entry.q, acceptedAnswer: { '@type': 'Answer', text: entry.a } }));
  const socials = doc.footer.socials.map((social) => social.href).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'TASIMO',
        alternateName: 'Tashkent International Mathematics Olympiad',
        url: 'https://tasimo.uz',
        logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-512.png`, width: 512, height: 512 },
        ...(socials.length ? { sameAs: socials } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteUrl}/`,
        name: BRAND,
        alternateName: ALTERNATE_NAMES,
        description: FALLBACK_DESCRIPTION[locale],
        inLanguage: [...LOCALES],
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': questions.length ? ['WebPage', 'FAQPage'] : 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: seoTitle(doc, locale),
        description: seoDescription(doc, locale),
        inLanguage: locale,
        isPartOf: { '@id': websiteId },
        about: { '@id': ORGANIZATION_ID },
        ...(publishedAt ? { dateModified: publishedAt } : {}),
        ...(questions.length ? { mainEntity: questions } : {}),
      },
    ],
  };
}

/** <script type="application/ld+json"> ichida </script> va HTML izohlari yopilib qolmasin */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
