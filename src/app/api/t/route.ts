import { NextResponse, type NextRequest } from 'next/server';
import { ATTRIBUTION_COOKIE, VISITOR_COOKIE } from '@/lib/attribution';
import { API_URL } from '@/lib/env.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUTTONS = new Set(['register', 'participate', 'login', 'other']);
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit/i;

/**
 * Tugma bosildi (brauzer → shu yo'l → backend). Tashrifchi ID va reklama — `.tasimo.uz` cookie'laridan,
 * haqiqiy IP — x-visitor-ip. Javob har doim 204 (kuzatuv foydalanuvchini kuttirmaydi).
 */
export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  if (BOT_UA.test(request.headers.get('user-agent') ?? '')) return done;

  const visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !/^[A-Za-z0-9_-]{8,64}$/.test(visitorId)) return done;

  const body = (await request.json().catch(() => null)) as { button?: unknown; sectionId?: unknown; locale?: unknown } | null;
  const button = typeof body?.button === 'string' && BUTTONS.has(body.button) ? body.button : 'other';
  const sectionId = typeof body?.sectionId === 'string' && /^[A-Za-z0-9_-]{1,48}$/.test(body.sectionId) ? body.sectionId : undefined;
  const locale = body?.locale === 'en' || body?.locale === 'ru' ? body.locale : undefined;

  let utmCampaign: string | undefined;
  try {
    const attr = JSON.parse(request.cookies.get(ATTRIBUTION_COOKIE)?.value ?? 'null') as { c?: string } | null;
    utmCampaign = typeof attr?.c === 'string' && attr.c ? attr.c.slice(0, 100) : undefined;
  } catch {
    utmCampaign = undefined;
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '';
  const country = request.headers.get('cf-ipcountry') ?? '';
  const userAgent = request.headers.get('user-agent') ?? '';
  try {
    await fetch(`${API_URL}/plus/track/cta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(ip ? { 'x-visitor-ip': ip } : {}) },
      body: JSON.stringify({
        visitorId,
        button,
        ...(sectionId ? { sectionId } : {}),
        ...(locale ? { locale } : {}),
        ...(utmCampaign ? { utmCampaign } : {}),
        ...(/^[A-Za-z]{2}$/.test(country) ? { countryCode: country } : {}),
        device: /Mobi|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : 'desktop',
      }),
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    });
  } catch {
    // backend javob bermasa ham foydalanuvchi o'tib ketadi
  }
  return done;
}
