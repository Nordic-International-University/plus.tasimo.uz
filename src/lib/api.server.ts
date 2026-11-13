import 'server-only';
import { ACCOUNT_URL, API_URL } from './env.server';
import { PLUS_CACHE_TAG, PLUS_REVALIDATE_SECONDS } from './cache';
import { normalizeDoc } from './doc/normalize';
import type { PixelSettings, PlusDoc } from './doc/types';

/**
 * Backend qatlami — faqat server tomonida. Brauzer api.tasimo.uz ga to'g'ridan-to'g'ri murojaat qilmaydi:
 * landing serverda render bo'ladi, muharrir esa shu saytning /api/editor/* yo'llari orqali ishlaydi.
 */

const EMPTY_PIXELS: PixelSettings = { metaPixelId: null, tiktokPixelId: null, ga4Id: null, googleAdsId: null, googleAdsLeadLabel: null };

export interface LandingData {
  doc: PlusDoc;
  pixels: PixelSettings;
  publishedAt: string | null;
}

export async function getLanding(): Promise<LandingData> {
  try {
    const response = await fetch(`${API_URL}/plus/landing`, {
      next: { tags: [PLUS_CACHE_TAG], revalidate: PLUS_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { content: unknown; publishedAt: string | null; settings?: Partial<PixelSettings> };
    return {
      doc: normalizeDoc(data.content, ACCOUNT_URL),
      pixels: { ...EMPTY_PIXELS, ...(data.settings ?? {}) },
      publishedAt: data.publishedAt,
    };
  } catch (error) {
    // Backend ishlamasa — standart kontent (keyingi so'rovda yana urinadi)
    console.error('[plus] landing kontentini olib bo\'lmadi:', error instanceof Error ? error.message : error);
    return { doc: normalizeDoc(null, ACCOUNT_URL), pixels: EMPTY_PIXELS, publishedAt: null };
  }
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | { message?: string | string[] } | null;
}

/** Muharrir so'rovlari — keshsiz, muharrir tokeni bilan */
export async function editorApi<T>(path: string, token: string | null, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  try {
    const response = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store', signal: AbortSignal.timeout(20_000) });
    const raw = await response.text();
    let data: unknown = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }
    return { ok: response.ok, status: response.status, data: data as T };
  } catch {
    return { ok: false, status: 503, data: { message: 'Server bilan aloqa yo\'q. Birozdan keyin qayta urinib ko\'ring.' } };
  }
}
