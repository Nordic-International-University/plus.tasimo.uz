import type { Background, SectionType } from '@/lib/doc/types';

/** Har variantda nima bor — admin eskiz bilan birga o'qiydi («Bo'lim qo'shish», bo'lim paneli, o'ng panel) */
export const VARIANT_INFO: Record<string, string> = {
  'hero:orbit': 'Katta sarlavha, 2 ta tugma va o‘ngda bosqichlar (marshrut) kartasi',
  'hero:split': 'Sarlavha va tugmalar chapda, o‘ngda katta rasm, pastda qisqa faktlar',
  'hero:poster': 'Butun ekranli rasm, ustida markazda sarlavha va tugmalar',
  'about:split': 'Chapda rasm, o‘ngda matn va 4 ta afzallik (ikonka bilan)',
  'about:centered': 'Markazda sarlavha va matn, ostida 4 ustunli afzalliklar',
  'features:cards': 'Ikonkali oq kartalar to‘ri — 2, 3 yoki 4 ustun',
  'features:icons': 'Kartasiz: ikonka, sarlavha va matn, orasida yupqa chiziq',
  'features:bento': 'Har xil o‘lchamli kartalar (keng va oddiy), fon rasm qo‘yish mumkin',
  'seasons:route': 'Har mavsum — katta karta: nomi, ikonkasi va bosqichlari',
  'seasons:cards': 'Mavsum kartalari, tepasida rasm bilan',
  'steps:path': 'Bitta chiziq ustida ketma-ket qadamlar va ostida tugma',
  'steps:numbered': 'Katta raqamli (01, 02 …) qadamlar ro‘yxati, ikki ustun',
  'stats:band': 'Katta raqamlar bir qatorda — saytda sanab chiqadi',
  'stats:cards': 'Raqamlar ikonkali kartalarda',
  'gallery:postcards': '8–10 ta rasm, izoh rasm ostida. Joylashuvini (bento, to‘r, karusel) keyin tanlaysiz',
  'gallery:clean': 'Rasmlar hoshiyasiz, izoh rasm ustida',
  'video:featured': 'Sarlavha va katta YouTube pleyer',
  'video:split': 'Chapda matn va tugma, o‘ngda pleyer',
  'testimonials:quotes': 'Ishtirokchilar fikri: matn, rasm, ism va davlat',
  'testimonials:prizes': 'Mukofotlar shohsupasi: 1, 2, 3-o‘rin',
  'faq:accordion': 'Ochiladigan savol-javoblar markazda (Google ham o‘qiydi)',
  'faq:two-column': 'Chapda sarlavha va tugma, o‘ngda savollar',
  'cta:boarding': 'Chaqiriq, tugmalar va bort-talon; xohlasangiz taymer',
  'cta:banner': 'Markazda sodda chaqiriq va tugmalar',
  'richtext:article': 'Sarlavha va erkin matn markazda',
  'richtext:aside': 'Sarlavha chapda, matn o‘ngda',
  'logos:marquee': 'Hamkorlar logotiplari oqib turadigan qatorda',
  'logos:grid': 'Hamkorlar logotiplari to‘rda',
};

/** Eskiz foni bo'lim standartidan farq qiladigan variantlar (to'liq rasm — qorong'i qatlam, oq matn) */
const VARIANT_TONE: Record<string, Background> = { 'hero:poster': 'night' };

export function variantTone(type: SectionType, variant: string, fallback: Background): Background {
  return VARIANT_TONE[`${type}:${variant}`] ?? fallback;
}

/** Fonlar: nomi va bir og'iz izoh (kalitlar eski hujjatlar uchun saqlangan — «sunset» endi iliq qum rangi) */
export const BG_INFO: Record<Background, { label: string; note: string }> = {
  plain: { label: 'Oq', note: 'Toza oq fon' },
  paper: { label: 'Och ko‘kish', note: 'Juda och ko‘k (PLUS LIGHT ohangi)' },
  sunset: { label: 'PLUS LIGHT', note: 'Och ko‘k #CEE4F8, matn to‘q' },
  grid: { label: 'Nuqtali to‘r', note: 'Oq fon, xira nuqtalar (matematik to‘r)' },
  night: { label: 'To‘q (#122C46)', note: 'Brend neytral to‘q fon, matn oq' },
  aurora: { label: 'PLUS BLUE', note: 'Asosiy ko‘k #0A62B3, matn oq, burchakda plashka' },
};

/** Fonlar tartibi tanlagichda: och fonlar, so'ng to'q */
export const BG_ORDER: Background[] = ['plain', 'paper', 'sunset', 'grid', 'night', 'aurora'];
