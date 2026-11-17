import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env.server';

export default function robots(): MetadataRoute.Robots {
  return {
    // Muharrir va ichki API indekslanmaydi; qolgani (landing, OG rasm, /_next statiklari) ochiq
    rules: [{ userAgent: '*', allow: '/', disallow: ['/edit', '/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
