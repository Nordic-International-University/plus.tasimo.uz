import 'server-only';

/**
 * Server muhiti. API_URL majburiy: yo'q bo'lsa build bo'sh sahifa yig'ib, keshga yozib qo'ymasin.
 * Serverda `.env` (gitignore'da) ichida bo'ladi — ecosystem.config.js ga yozilmaydi.
 */
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} environment o'zgaruvchisi topilmadi (.env ga qo'shing, so'ng qayta build qiling).`);
  return value.replace(/\/+$/, '');
}

export const API_URL = required('API_URL');
export const SITE_URL = (process.env.SITE_URL?.trim() || 'https://plus.tasimo.uz').replace(/\/+$/, '');
export const ACCOUNT_URL = (process.env.ACCOUNT_URL?.trim() || 'https://account.tasimo.uz').replace(/\/+$/, '');

/** Google Search Console / Yandex Webmaster «HTML teg» usuli: faqat content qiymati (ixtiyoriy; .env + qayta build) */
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION?.trim() || '';
export const YANDEX_VERIFICATION = process.env.YANDEX_VERIFICATION?.trim() || '';
