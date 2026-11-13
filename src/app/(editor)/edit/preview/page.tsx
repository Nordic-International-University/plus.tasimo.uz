import { notFound } from 'next/navigation';
import { ClientEnhancer } from '@/components/site/ClientEnhancer';
import { LandingView } from '@/components/site/LandingView';
import { createViewCtx } from '@/components/sections/view-ctx';
import { editorApi } from '@/lib/api.server';
import { normalizeDoc } from '@/lib/doc/normalize';
import { isLocale } from '@/lib/doc/types';
import { getEditorToken } from '@/lib/editor-session';
import { ACCOUNT_URL } from '@/lib/env.server';

export const dynamic = 'force-dynamic';

/** Qoralamaning haqiqiy ko'rinishi (muharrirdagi «Ko'rish» — telefon/planshet/kompyuter kengligida) */
export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const token = await getEditorToken();
  if (!token) notFound();
  const result = await editorApi<{ draft: unknown }>('/plus/editor/content', token);
  if (!result.ok || !result.data || !('draft' in result.data)) notFound();
  const { lang } = await searchParams;
  const locale = isLocale(lang) ? lang : 'en';
  const ctx = createViewCtx(normalizeDoc(result.data.draft, ACCOUNT_URL), locale);
  return (
    <div lang={locale} className="min-h-svh bg-[var(--color-night)]">
      <LandingView ctx={ctx} />
      <ClientEnhancer locale={locale} pixels={{ metaPixelId: null, tiktokPixelId: null, ga4Id: null, googleAdsId: null, googleAdsLeadLabel: null }} />
    </div>
  );
}
