import { Finlandica_Text } from 'next/font/google';

/**
 * Brend shrifti — Finlandica Text (Helsinki Type Studio, SIL OFL 1.1; Brand Guidelines 12/24): sarlavha 800/700,
 * matn 400, texnik ma'lumot 500. Variable fayl — hamma qalinlik bitta faylda. Shrift build paytida yuklab olinadi va
 * saytning o'zidan beriladi (Google'ga so'rov yo'q). Kirill va o'zbek lotin harflari (ʻ ʼ ‘ ’) bor.
 */
export const brand = Finlandica_Text({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-brand',
  display: 'swap',
  // next/font bu shrift uchun zaxira o'lchamlarini bilmaydi — o'rniga oddiy tizim shrifti
  adjustFontFallback: false,
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
});
