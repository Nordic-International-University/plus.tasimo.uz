import { withPlusRef } from './ref';
import type { CtaKey, PlusDoc } from './types';

/**
 * Havola turlari (muharrirda tanlanadi): tugma manzili «cta:register» (Umumiy → Tugmalar, bosish kuzatiladi),
 * bo'lim «#about» yoki tashqi havola (https://, mailto:, tel:).
 */
export const CTA_LINK_RE = /^cta:(register|participate|login)$/;

export const ctaLink = (key: CtaKey) => `cta:${key}`;

export function ctaOfLink(href: string | undefined): CtaKey | null {
  const match = href ? CTA_LINK_RE.exec(href) : null;
  return match ? (match[1] as CtaKey) : null;
}

export type LinkKind = 'cta' | 'section' | 'url';

export function linkKind(href: string | undefined): LinkKind {
  if (ctaOfLink(href)) return 'cta';
  if (href?.startsWith('#')) return 'section';
  return 'url';
}

/** Saytdagi haqiqiy manzil: cta: → tugma manzili (+ manba belgisi), qolganlari o'zgarmaydi */
export function resolveLink(doc: PlusDoc, href: string): { href: string; cta: CtaKey | null } {
  const cta = ctaOfLink(href);
  if (cta) return { href: withPlusRef(doc.ctas[cta].href, cta), cta };
  return { href, cta: null };
}
