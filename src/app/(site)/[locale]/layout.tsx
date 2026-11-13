import type { Metadata, Viewport } from 'next';
import '../../globals.css';
import { isLocale, LOCALES } from '@/lib/doc/types';
import { SITE_URL } from '@/lib/env.server';
import { brand } from '@/lib/fonts';
import { ui } from '@/lib/ui-strings';

/** Sahifa metadata'si page.tsx da; bu yerda — OG rasm va 404 havolalari to'g'ri domenga bog'lansin */
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

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
