import type { Metadata, Viewport } from 'next';
import '../../globals.css';
import { isLocale, LOCALES } from '@/lib/doc/types';
import { GOOGLE_SITE_VERIFICATION, SITE_URL, YANDEX_VERIFICATION } from '@/lib/env.server';
import { brand } from '@/lib/fonts';
import { BRAND } from '@/lib/seo';
import { ui } from '@/lib/ui-strings';

/**
 * Sahifa metadata'si page.tsx da; bu yerda — butun sayt uchun: OG rasm va 404 havolalari to'g'ri domenga bog'lansin,
 * ilova nomi, Search Console / Yandex Webmaster tasdiqlash meta-tegi (env bo'lsa).
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: BRAND,
  publisher: 'TASIMO',
  formatDetection: { telephone: false, email: false, address: false },
  ...(GOOGLE_SITE_VERIFICATION || YANDEX_VERIFICATION
    ? {
        verification: {
          ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
          ...(YANDEX_VERIFICATION ? { yandex: YANDEX_VERIFICATION } : {}),
        },
      }
    : {}),
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : 'en';
  return (
    <html lang={locale} className={brand.variable} suppressHydrationWarning>
      <head>
        {/* JS bor bo'lsa — paydo bo'lish animatsiyasi yoqiladi (JS'siz kontent darhol ko'rinadi) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[var(--color-ink)]">
          {ui(locale, 'skip')}
        </a>
        {children}
      </body>
    </html>
  );
}
