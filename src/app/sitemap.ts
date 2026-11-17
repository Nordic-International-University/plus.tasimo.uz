import type { MetadataRoute } from 'next';
import { getLanding } from '@/lib/api.server';
import { LOCALES } from '@/lib/doc/types';
import { SITE_URL } from '@/lib/env.server';

/** Landing kontenti bilan birga yangilanadi (fetch tegi plus-landing: e'londa webhook, aks holda 5 daqiqa) */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { publishedAt } = await getLanding();
  const lastModified = publishedAt ? new Date(publishedAt) : undefined;
  const languages = { ...Object.fromEntries(LOCALES.map((code) => [code, `${SITE_URL}/${code}`])), 'x-default': `${SITE_URL}/en` };
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages },
  }));
}
