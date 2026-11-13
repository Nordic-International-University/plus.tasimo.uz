import type { Metadata, Viewport } from 'next';
import '../../globals.css';
import '@/components/editor/editor.css';
import { SITE_URL } from '@/lib/env.server';
import { brand } from '@/lib/fonts';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'TASIMO Plus — muharrir',
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1 };

/** Muharrir — alohida root layout (o'zbekcha interfeys, animatsiya skripti yo'q: hamma narsa darhol ko'rinadi) */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={brand.variable}>
      <body>{children}</body>
    </html>
  );
}
