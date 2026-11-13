import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { LOGO } from './logo-data';

const VIEW_BOX = `0 0 ${LOGO.width} ${LOGO.height}`;
const EMBLEM_VIEW_BOX = `0 0 ${LOGO.emblemWidth} ${LOGO.height}`;

/** TASIMO qushcha emblemasi: halqa, uchta qanot va qush boshi — har biri alohida (sarlavhada qanotlar qoqadi) */
function EmblemPaths() {
  return (
    <g transform={LOGO.emblemTransform}>
      <path className="tl-ring" d={LOGO.emblem.ring} />
      <path className="tl-wing" d={LOGO.emblem.wingA} style={{ '--w': 0 } as CSSProperties} />
      <path className="tl-wing" d={LOGO.emblem.wingB} style={{ '--w': 1 } as CSSProperties} />
      <path className="tl-wing" d={LOGO.emblem.wingC} style={{ '--w': 2 } as CSSProperties} />
      <path className="tl-head" d={LOGO.emblem.head} />
    </g>
  );
}

/**
 * TASIMO PLUS logotipi (admin o'zgartira olmaydi): TASIMO qushcha emblemasi + «TASIMO» (brend harflari) + «PLUS».
 * Har bir harf — alohida qatlam: sarlavhada skroll boshlanganda harflar emblema tomon yig'iladi, faqat qushcha qoladi
 * (globals.css → .site-header[data-scrolled]). Hamma qatlam bir xil viewBox'da — faqat transform/opacity o'zgaradi.
 */
export function PlusLogo({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const count = LOGO.letters.length;
  return (
    <span
      role="img"
      aria-label="TASIMO Plus"
      className={cn('tp-logo', tone === 'light' && 'tp-logo-light', className)}
      style={{ aspectRatio: `${LOGO.width} / ${LOGO.height}`, '--unit': `${100 / LOGO.width}%` } as CSSProperties}
    >
      <svg className="tl-layer tl-emblem" viewBox={VIEW_BOX} aria-hidden="true" focusable="false">
        <EmblemPaths />
      </svg>
      {LOGO.letters.map((letter, index) => (
        <svg
          key={`${letter.word}-${letter.char}-${index}`}
          className={cn('tl-layer tl-letter', letter.word === 'plus' && 'tl-plus')}
          viewBox={VIEW_BOX}
          aria-hidden="true"
          focusable="false"
          style={{ '--d': count - index } as CSSProperties}
        >
          <g transform={LOGO.wordTransform}>
            <path
              d={letter.d}
              fillRule={'evenodd' in letter && letter.evenodd ? 'evenodd' : undefined}
              transform={'shift' in letter && letter.shift ? `translate(${letter.shift} 0)` : undefined}
            />
          </g>
        </svg>
      ))}
    </span>
  );
}

/** Faqat emblema (qushcha) — kichik joylar uchun: bort-talon, favicon uslubidagi belgi */
export function PlusMark({ size = 32, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg
      viewBox={EMBLEM_VIEW_BOX}
      width={size}
      height={size}
      className={cn('tp-mark', className)}
      fill="currentColor"
      focusable="false"
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <EmblemPaths />
    </svg>
  );
}
