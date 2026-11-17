import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { captureAttribution } from './lib/attribution';

/** Ruscha tanlaydigan tillar (MDH) — qolganlarga inglizcha */
const RU_LANGS = new Set(['ru', 'be', 'uk', 'kk', 'ky', 'tg', 'az', 'hy', 'ka', 'tk']);

function preferredLocale(request: NextRequest): 'en' | 'ru' {
  const header = request.headers.get('accept-language') ?? '';
  const first = header.split(',')[0]?.trim().slice(0, 2).toLowerCase();
  return first && RU_LANGS.has(first) ? 'ru' : 'en';
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // "/" → /en yoki /ru (UTM va boshqa parametrlar saqlanadi; tashrif yo'naltirilgan sahifada yoziladi)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}`;
    const redirect = NextResponse.redirect(url, 307);
    // Javob brauzer tiliga bog'liq — oraliq keshlar bitta tilni hammaga bermasin (Google ham shuni kutadi)
    redirect.headers.set('Vary', 'Accept-Language');
    redirect.headers.set('Cache-Control', 'private, no-store');
    return redirect;
  }

  const response = NextResponse.next();
  if (pathname === '/en' || pathname === '/ru') captureAttribution(request, response, event);
  return response;
}

export const config = {
  // Faqat landing sahifalari — muharrir, API, statik fayllar emas
  matcher: ['/', '/en', '/ru'],
};
