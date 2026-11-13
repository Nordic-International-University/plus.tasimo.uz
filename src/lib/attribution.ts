import type { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

/**
 * Trafik manbalari kuzatuvi — tasimo.uz/src/lib/attribution.ts bilan bir xil, faqat platform = 'PLUS'.
 * (proxy'da, server tomonida — brauzer backend'ga murojaat qilmaydi).
 *
 * Har bir sessiya boshida (30 daqiqa harakatsizlikdan keyin yoki yangi manba bilan kelganda) backend'ga
 * javobni kutmasdan (waitUntil) tashrif yuboriladi. Manba (reklama, ChatGPT/Gemini, Google, Instagram, boshqa sayt,
 * to'g'ridan-to'g'ri) backend'da tasniflanadi — bu yerdan faqat xom ma'lumot: utm_*, click ID turi, referrer.
 *
 * Cookie'lar (`.tasimo.uz` — account.tasimo.uz ham o'qiydi):
 * - `tasimo_vid` — anonim tashrifchi ID (noyob tashrifchilar, ro'yxatdan o'tishda sessiyalarni topish);
 * - `tasimo_ses` — joriy sessiya (30 daqiqa, har so'rovda yangilanadi);
 * - `tasimo_attr` — manbali birinchi kontakt (30 kun). Faqat reklama belgisi bo'lgan kontakt reklamasizning ustiga yoziladi;
 * - `tasimo_plus` — landingda bo'lgan brauzer belgisi (90 kun, pastda).
 */
export const ATTRIBUTION_COOKIE = 'tasimo_attr';
export const VISITOR_COOKIE = 'tasimo_vid';
export const SESSION_COOKIE = 'tasimo_ses';
/** Landingning o'z sessiyasi (faqat shu host) — tasimo.uz sessiyasi davom etayotgan bo'lsa ham PLUS tashrifi yozilsin */
export const PLUS_SESSION_COOKIE = 'plus_ses';
/**
 * `.tasimo.uz` belgisi: shu brauzer landingda bo'lgan. Account kirishdan keyin faqat shu belgi bo'lsa tashrifchini
 * foydalanuvchiga bog'laydi (avval ro'yxatdan o'tganlarning olimpiada va to'lovlari Plus voronkasida ko'rinsin).
 */
export const PLUS_MARK_COOKIE = 'tasimo_plus';
const PLUS_MARK_MAX_AGE = 90 * 24 * 60 * 60;

const ATTRIBUTION_MAX_AGE = 30 * 24 * 60 * 60;
const VISITOR_MAX_AGE = 365 * 24 * 60 * 60;
const SESSION_MAX_AGE = 30 * 60;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
/** Reklama click ID'lari — qiymati emas, faqat turi yuboriladi */
const CLICK_IDS = ['gclid', 'fbclid', 'yclid', 'ttclid', 'msclkid'] as const;
const PAID_CLICK_IDS = new Set(['gclid', 'yclid', 'ttclid', 'msclkid']);
const PAID_MEDIUMS = new Set(['cpc', 'ppc', 'paid', 'paidsocial', 'paid_social', 'paid-social', 'cpm', 'cpv', 'cpa', 'ads', 'ad', 'display', 'banner', 'retargeting', 'sponsored']);
const SLUG_RE = /^[a-z0-9_-]{1,50}$/;
/** Havola preview'lari va qidiruv botlari tashrif emas */
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|vkshare|skypeuripreview/i;
const INTERNAL_HOST = /(^|\.)tasimo\.uz$|^localhost$|^127\.0\.0\.1$/;

interface StoredAttribution {
  s?: string;
  m?: string;
  c?: string;
  ct?: string;
  t?: string;
  k?: string;
  l?: string;
  r?: string;
  ts?: string;
}

function cookieDomain(host: string | null): string | undefined {
  const hostname = host?.split(':')[0] ?? '';
  return hostname === 'tasimo.uz' || hostname.endsWith('.tasimo.uz') ? '.tasimo.uz' : undefined;
}

function clip(value: string | null | undefined, max: number): string {
  return (value ?? '').trim().slice(0, max);
}

/**
 * Tashqi referrer'ning faqat manzili (query'siz) — shaxsiy parametrlar saqlanmasin. O'z saytimiz — bo'sh.
 * "android-app://org.telegram.messenger/" kabi ilova referrer'lari ham saqlanadi (origin'i "null" bo'ladi).
 */
function externalReferrer(referrer: string | null): string {
  if (!referrer) return '';
  try {
    const url = new URL(referrer);
    if (!url.hostname || INTERNAL_HOST.test(url.hostname.toLowerCase())) return '';
    const origin = url.origin !== 'null' ? url.origin : `${url.protocol}//${url.host}`;
    return clip(`${origin}${url.pathname}`, 500);
  } catch {
    return '';
  }
}

function isAdTouch(touch: { c?: string; m?: string; k?: string }): boolean {
  return Boolean(
    (touch.c && SLUG_RE.test(touch.c.toLowerCase())) ||
      (touch.k && PAID_CLICK_IDS.has(touch.k)) ||
      (touch.m && PAID_MEDIUMS.has(touch.m.toLowerCase())),
  );
}

function readStored(raw: string | undefined): StoredAttribution | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as StoredAttribution;
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

export function captureAttribution(request: NextRequest, response: NextResponse, event: NextFetchEvent): void {
  const userAgent = request.headers.get('user-agent') ?? '';
  const isPrefetch = request.headers.has('next-router-prefetch') || request.headers.get('purpose') === 'prefetch';
  if (BOT_UA.test(userAgent) || isPrefetch) return;
  // Locale redirect (/ → /uz): query va referrer keyingi so'rovda ham bor — hammasi o'sha yerda
  if (response.status >= 300 && response.status < 400) return;

  const params = request.nextUrl.searchParams;
  const utm = Object.fromEntries(UTM_KEYS.map((key) => [key, clip(params.get(key), 100)])) as Record<(typeof UTM_KEYS)[number], string>;
  const clickId = CLICK_IDS.find((key) => params.has(key)) ?? '';
  const referrer = externalReferrer(request.headers.get('referer'));
  const hasSource = Boolean(utm.utm_campaign || utm.utm_source || clickId || referrer);

  const domain = cookieDomain(request.headers.get('host'));
  const secure = request.nextUrl.protocol === 'https:';
  const cookieBase = { path: '/', sameSite: 'lax' as const, secure, ...(domain ? { domain } : {}) };

  // Sessiya: har so'rovda 30 daqiqaga uzaytiriladi. Davom etayotgan sessiyada yangi manba bo'lmasa — yozilmaydi
  const sessionActive = request.cookies.has(PLUS_SESSION_COOKIE);
  response.cookies.set(PLUS_SESSION_COOKIE, '1', { path: '/', sameSite: 'lax', secure, maxAge: SESSION_MAX_AGE });
  // Umumiy sessiya (.tasimo.uz) — account landingdan o'tganni yangi tashrif deb ikkinchi marta yozmasin
  response.cookies.set(SESSION_COOKIE, '1', { ...cookieBase, maxAge: SESSION_MAX_AGE });
  if (!sessionActive || !request.cookies.has(PLUS_MARK_COOKIE)) {
    response.cookies.set(PLUS_MARK_COOKIE, '1', { ...cookieBase, maxAge: PLUS_MARK_MAX_AGE });
  }
  if (sessionActive && !hasSource) return;

  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !/^[A-Za-z0-9_-]{8,64}$/.test(visitorId)) {
    visitorId = `v_${crypto.randomUUID().replace(/-/g, '')}`;
    response.cookies.set(VISITOR_COOKIE, visitorId, { ...cookieBase, maxAge: VISITOR_MAX_AGE });
  }

  const landingPath = clip(request.nextUrl.pathname, 300);

  // Birinchi kontakt (30 kun): reklama belgisi bo'lgani reklamasizning ustiga yoziladi (masalan avval ChatGPT, keyin reklama)
  if (hasSource) {
    const touch: StoredAttribution = {
      s: utm.utm_source,
      m: utm.utm_medium,
      c: utm.utm_campaign,
      ct: utm.utm_content,
      t: utm.utm_term,
      k: clickId,
      l: landingPath,
      r: referrer,
      ts: new Date().toISOString(),
    };
    const existing = readStored(request.cookies.get(ATTRIBUTION_COOKIE)?.value);
    if (!existing || (isAdTouch(touch) && !isAdTouch(existing))) {
      response.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(touch), { ...cookieBase, maxAge: ATTRIBUTION_MAX_AGE });
    }
  }

  const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, '');
  if (!apiUrl) return;

  // Mijoz IP'si uzatilmaydi (Kerio NAT — hamma bitta IP); backend spamni tashrifchi ID bo'yicha cheklaydi
  const country = request.headers.get('cf-ipcountry') ?? '';
  const optional = (key: string, value: string) => (value ? { [key]: value } : {});
  event.waitUntil(
    fetch(`${apiUrl}/marketing-campaigns/track/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'PLUS',
        visitorId,
        landingPath,
        ...optional('campaign', utm.utm_campaign),
        ...optional('utmSource', utm.utm_source),
        ...optional('utmMedium', utm.utm_medium),
        ...optional('utmContent', utm.utm_content),
        ...optional('utmTerm', utm.utm_term),
        ...optional('clickId', clickId),
        ...optional('referrer', referrer),
        ...(/^[A-Za-z]{2}$/.test(country) ? { countryCode: country } : {}),
        device: /Mobi|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : 'desktop',
      }),
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    }).catch(() => undefined),
  );
}
