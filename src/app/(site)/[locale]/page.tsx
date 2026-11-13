import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClientEnhancer } from '@/components/site/ClientEnhancer';
import { LandingView } from '@/components/site/LandingView';
import { Pixels } from '@/components/site/Pixels';
import { createViewCtx } from '@/components/sections/view-ctx';
import { getLanding } from '@/lib/api.server';
import { isLocale } from '@/lib/doc/types';
import { SITE_URL } from '@/lib/env.server';
import { buildJsonLd, buildMetadata, serializeJsonLd } from '@/lib/seo';

// ISR: kontent backend webhook (e'lon qilinganda) yoki 5 daqiqalik zaxira muddat bilan yangilanadi
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { doc } = await getLanding();
  return buildMetadata(doc, locale, SITE_URL);
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { doc, pixels } = await getLanding();
  const ctx = createViewCtx(doc, locale);

  return (
    <>
      {buildJsonLd(doc, locale, SITE_URL).map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
      ))}
      <LandingView ctx={ctx} />
      <ClientEnhancer locale={locale} pixels={pixels} />
      <Pixels pixels={pixels} />
    </>
  );
}
