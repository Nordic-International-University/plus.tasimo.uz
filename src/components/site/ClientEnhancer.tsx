'use client';

import { useEffect } from 'react';
import type { Locale, PixelSettings } from '@/lib/doc/types';

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: Record<string, unknown>) => void };
    gtag?: Gtag;
  }
}

const BUTTONS = new Set(['register', 'participate', 'login']);

/**
 * Saytdagi yagona client «orol» (~2 KB): ko'rinishga kelganda paydo bo'lish, raqamlarni sanash, sarlavha foni
 * va tugma bosishlarini kuzatish (plus.tasimo.uz/api/t → backend + reklama piksellari).
 */
export function ClientEnhancer({ locale, pixels }: { locale: Locale; pixels: PixelSettings }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Paydo bo'lish + sanash
    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? '';
      if (!Number.isFinite(target) || reduce) return;
      const start = performance.now();
      const duration = Math.min(1800, 600 + target * 40);
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add('is-visible');
          el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
          observer.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

    // Sarlavha: skrollda suzuvchi panel + logotip qushchaga yig'iladi. data-moved — faqat foydalanuvchi skrollidan keyin
    // (sahifa o'rtadan ochilsa qanotlar o'z-o'zidan qoqmasin)
    const header = document.querySelector<HTMLElement>('.site-header');
    let lastScrolled: boolean | null = null;
    const updateHeader = (fromUser: boolean) => {
      const scrolled = window.scrollY > 24;
      if (scrolled === lastScrolled) return;
      if (fromUser && lastScrolled !== null) header?.setAttribute('data-moved', '');
      lastScrolled = scrolled;
      header?.setAttribute('data-scrolled', String(scrolled));
    };
    updateHeader(false);
    const onScroll = () => updateHeader(true);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Tugma bosishlari
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-cta]');
      if (!link) return;
      const button = BUTTONS.has(link.dataset.cta ?? '') ? link.dataset.cta! : 'other';
      const payload = JSON.stringify({ button, sectionId: link.dataset.section, locale });
      try {
        if (!navigator.sendBeacon?.('/api/t', new Blob([payload], { type: 'application/json' }))) {
          void fetch('/api/t', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } });
        }
      } catch {
        // kuzatuv o'tishni to'xtatmaydi
      }
      try {
        window.fbq?.('track', 'Lead', { content_name: button });
        window.ttq?.track('ClickButton', { content_name: button });
        window.gtag?.('event', 'generate_lead', { button });
        if (pixels.googleAdsId && pixels.googleAdsLeadLabel) {
          window.gtag?.('event', 'conversion', { send_to: `${pixels.googleAdsId}/${pixels.googleAdsLeadLabel}` });
        }
      } catch {
        // piksel xatosi sahifani buzmasin
      }
    };
    document.addEventListener('click', onClick, { capture: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, [locale, pixels]);

  return null;
}
