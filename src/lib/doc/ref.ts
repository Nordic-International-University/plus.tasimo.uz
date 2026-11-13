/**
 * Account'ga olib boradigan tugmalarga manba belgisi: utm_source=tasimo_plus, utm_medium=landing, utm_content=<tugma>.
 * Muharrirdan o'chirib bo'lmaydi (havola render paytida to'ldiriladi). Admin o'zi utm_source qo'ygan bo'lsa — tegilmaydi.
 * Asosiy bog'lanish baribir `.tasimo.uz` dagi umumiy tashrifchi cookie'si orqali; bu belgi account statistikasida
 * «TASIMO Plus'dan kelgan» sessiyani ko'rsatadi va cookie bloklangan brauzerlarda ham manbani saqlaydi.
 */
export const PLUS_REF_SOURCE = 'tasimo_plus';

const TASIMO_HOST = /(^|\.)tasimo\.uz$/i;

export function withPlusRef(href: string, button: string): string {
  try {
    const url = new URL(href);
    const host = url.hostname.toLowerCase();
    const internal = TASIMO_HOST.test(host) || host === 'localhost' || host === '127.0.0.1';
    if (!internal || host.startsWith('plus.') || url.searchParams.has('utm_source')) return href;
    url.searchParams.set('utm_source', PLUS_REF_SOURCE);
    url.searchParams.set('utm_medium', 'landing');
    url.searchParams.set('utm_content', button);
    return url.toString();
  } catch {
    // nisbiy havola (#faq, /ru) — o'z saytimiz
    return href;
  }
}
