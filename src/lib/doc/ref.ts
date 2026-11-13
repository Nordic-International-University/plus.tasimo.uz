/**
 * Account'ga olib boradigan tugmalarga manba belgisi: utm_source=tasimo_plus, utm_medium=landing, utm_content=<tugma>.
 * Muharrirdan o'chirib bo'lmaydi (havola render paytida to'ldiriladi). Admin o'zi utm_source qo'ygan bo'lsa — tegilmaydi.
 * Asosiy bog'lanish baribir `.tasimo.uz` dagi umumiy tashrifchi cookie'si orqali; bu belgi account statistikasida
 * «TASIMO Plus'dan kelgan» sessiyani ko'rsatadi va cookie bloklangan brauzerlarda ham manbani saqlaydi.
 */
export const PLUS_REF_SOURCE = 'tasimo_plus';

/** Birinchi kontakt cookie'si (`.tasimo.uz`): middleware yozadi, account o'qiydi. JS uchun ochiq (httpOnly emas) */
export const ATTRIBUTION_COOKIE = 'tasimo_attr';

const TASIMO_HOST = /(^|\.)tasimo\.uz$/i;
const TOUCH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const UTM_FIELDS = [
  ['utm_source', 'source', 's'],
  ['utm_medium', 'medium', 'm'],
  ['utm_campaign', 'campaign', 'c'],
  ['utm_content', 'content', 'ct'],
  ['utm_term', 'term', 't'],
] as const;

/** Account havolasiga o'tkaziladigan manba: tashrifchining o'z reklama belgisi */
export type VisitorTouch = Partial<Record<(typeof UTM_FIELDS)[number][1], string>>;

/** Account (tasimo.uz) havolasimi — plus'ning o'zi va tashqi saytlar emas */
function accountUrl(href: string): URL | null {
  try {
    const url = new URL(href);
    const host = url.hostname.toLowerCase();
    const internal = TASIMO_HOST.test(host) || host === 'localhost' || host === '127.0.0.1';
    return internal && !host.startsWith('plus.') ? url : null;
  } catch {
    return null; // nisbiy havola (#faq, /ru) — o'z saytimiz
  }
}

export function withPlusRef(href: string, button: string): string {
  const url = accountUrl(href);
  if (!url || url.searchParams.has('utm_source')) return href;
  url.searchParams.set('utm_source', PLUS_REF_SOURCE);
  url.searchParams.set('utm_medium', 'landing');
  url.searchParams.set('utm_content', button);
  return url.toString();
}

const clean = (value: unknown) => (typeof value === 'string' ? value.trim().slice(0, 100) : '');

function touchOf(read: (field: (typeof UTM_FIELDS)[number]) => unknown): VisitorTouch | null {
  const touch: VisitorTouch = {};
  for (const field of UTM_FIELDS) {
    const value = clean(read(field));
    if (value) touch[field[1]] = value;
  }
  return touch.source || touch.campaign ? touch : null;
}

/**
 * Tashrifchining reklama belgisi (brauzerda): avval `tasimo_attr` cookie — 30 kun, reklamali kontakt ustun; backend
 * ro'yxatdan o'tishni shu kontaktga bog'laydi. Cookie yo'q, buzuq yoki eskirgan bo'lsa — joriy sahifa URL'idagi utm_*.
 * Faqat utm_source yoki utm_campaign bor kontakt: oddiy referrer/click ID'ni account cookie'dan o'zi oladi.
 */
export function visitorTouch(cookieValue: string | null | undefined, search: string, now = Date.now()): VisitorTouch | null {
  if (cookieValue) {
    try {
      const stored = JSON.parse(cookieValue) as Record<string, unknown>;
      const age = now - Date.parse(String(stored.ts ?? ''));
      if (Number.isFinite(age) && age >= -60_000 && age <= TOUCH_MAX_AGE_MS) {
        const touch = touchOf((field) => stored[field[2]]);
        if (touch) return touch;
      }
    } catch {
      // buzuq cookie — URL'ga qaraymiz
    }
  }
  const params = new URLSearchParams(search);
  return touchOf((field) => params.get(field[0]));
}

/**
 * Tugma havolasidagi utm_* o'rniga tashrifchining o'z reklama belgisi. Bir vaqtda bir nechta reklama ishlasa ham har
 * kim o'zinikini account'ga olib ketadi — cookie bo'lishmaydigan holatda ham (Instagram ichidagi brauzerdan «Brauzerda
 * ochish»). Reklamada bo'lmagan utm maydoni olib tashlanadi (tugma nomi reklama belgisi bilan aralashmasin).
 */
export function withVisitorRef(href: string, touch: VisitorTouch): string {
  const url = accountUrl(href);
  if (!url) return href;
  for (const [param, key] of UTM_FIELDS) {
    const value = touch[key];
    if (value) url.searchParams.set(param, value);
    else url.searchParams.delete(param);
  }
  return url.toString();
}
