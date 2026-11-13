import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.SITE_URL?.trim() || 'https://plus.tasimo.uz').replace(/\/+$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${SITE_URL}/en`, ru: `${SITE_URL}/ru` };
  return (['en', 'ru'] as const).map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages },
  }));
}
