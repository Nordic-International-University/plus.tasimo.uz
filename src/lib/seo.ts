import type { Metadata } from 'next';
import { pick } from './doc/normalize';
import { plainText } from './doc/rich';
import { LOCALES, type Locale, type PlusDoc } from './doc/types';

export function buildMetadata(doc: PlusDoc, locale: Locale, siteUrl: string): Metadata {
  const title = pick(doc.seo.title, locale);
  const description = pick(doc.seo.description, locale);
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
      siteName: 'TASIMO Plus',
      title,
      description,
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    category: 'education',
  };
}

/** JSON-LD: tashkilot, sayt va FAQ (Google'da savol-javob ko'rinishi) */
export function buildJsonLd(doc: PlusDoc, locale: Locale, siteUrl: string): Record<string, unknown>[] {
  const url = `${siteUrl}/${locale}`;
  const out: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TASIMO — Tashkent International Mathematics Olympiad',
      alternateName: 'TASIMO Plus',
      url: 'https://tasimo.uz',
      logo: `${siteUrl}/icon.svg`,
      sameAs: doc.footer.socials.map((social) => social.href).filter(Boolean),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TASIMO Plus',
      url,
      inLanguage: locale,
      description: pick(doc.seo.description, locale),
    },
  ];
  const faq = doc.sections.find((section) => section.type === 'faq' && !section.hidden);
  const entries = faq?.items
    .map((item) => ({ q: plainText(pick(item.title, locale)).trim(), a: plainText(pick(item.text, locale)).trim() }))
    .filter((entry) => entry.q && entry.a);
  if (entries?.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: entries.map((entry) => ({ '@type': 'Question', name: entry.q, acceptedAnswer: { '@type': 'Answer', text: entry.a } })),
    });
  }
  return out;
}

/** <script type="application/ld+json"> ichida </script> va HTML izohlari yopilib qolmasin */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
