import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.SITE_URL?.trim() || 'https://plus.tasimo.uz').replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/edit', '/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
