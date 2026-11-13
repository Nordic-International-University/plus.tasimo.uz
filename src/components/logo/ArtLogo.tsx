import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { LOGO_ART, type ArtGroup, type ArtLogoId } from './logo-art';

/** Brend: ALT matni — logotip + dekriptor (Brand Guidelines, 21/24) */
export const LOGO_LABEL = 'TASIMO Plus — Mathematics Olympiad for Primary School Students';

function Group({ group, uid }: { group: ArtGroup; uid: string }) {
  const style: Record<string, string | number> = {};
  if (group.i !== undefined) style['--i'] = group.i;
  if (group.d !== undefined) style['--d'] = group.d;
  if (group.fx !== undefined) style['--fx'] = `${group.fx}px`;
  if (group.cx !== undefined) style['--cx'] = `${group.cx}px`;
  if (group.cy !== undefined) style['--cy'] = `${group.cy}px`;
  if (group.cs !== undefined) style['--cs'] = group.cs;
  if (group.w !== undefined) style['--w'] = group.w;
  if (group.n !== undefined) style['--n'] = group.n;
  if (group.origin) {
    style['--ox'] = `${group.origin[0]}px`;
    style['--oy'] = `${group.origin[1]}px`;
  }
  const content = (
    <>
      {group.p.map((path, index) => (
        <path key={index} className={`lg-${path.l}`} d={path.d} fillRule="evenodd" fill={path.l === 'plate' ? `url(#${uid}-g)` : undefined} />
      ))}
      {group.sub?.map((sub) => <Group key={sub.k} group={sub} uid={uid} />)}
    </>
  );
  return (
    <g
      className={cn('lg-g', group.r && `lg-${group.r}`, group.cls, group.origin && 'lg-o')}
      style={Object.keys(style).length ? (style as CSSProperties) : undefined}
      clipPath={group.clip ? `url(#${uid}-${group.clip})` : undefined}
    >
      {group.t ? <g transform={group.t}>{content}</g> : content}
    </g>
  );
}

/**
 * Vektorlashtirilgan TASIMO Plus logotipi (5 variant, logo-art.ts). Hook yo'q — saytda server komponent sifatida ham ishlaydi.
 * Skrollda (sarlavha data-scrolled) harflar so'nib yig'iladi, belgi va PLUS yorlig'i chapga suriladi; imzo harakatlari
 * (igna, qanot, chodir, iz) — globals.css → «Logotiplar». `uid` — sahifada noyob bo'lsin (gradient va kesish id'lari).
 * Oq (rasmiy) logotip och fonda to'q plashka ichida turadi — brend: oq logotipni oq yoki och fonga qo'ymang.
 * tone="light" — to'q fon (footer): ko'k qismlar oqqa almashadi, PLUS yorlig'i o'z ranglarida qoladi.
 */
export function ArtLogo({ id, uid, tone = 'dark', className }: { id: ArtLogoId; uid: string; tone?: 'dark' | 'light'; className?: string }) {
  const art = LOGO_ART[id];
  return (
    <span
      role="img"
      aria-label={LOGO_LABEL}
      className={cn('lg', art.dark && 'lg-dark', className)}
      data-logo={id}
      data-tone={tone}
      style={{ aspectRatio: `${art.w} / ${art.h}`, '--lg-cw': art.collapsedW / art.w, '--lg-n': art.letters } as CSSProperties}
    >
      {art.dark && <span className="lg-backdrop" aria-hidden="true" />}
      <svg viewBox={`0 0 ${art.w} ${art.h}`} aria-hidden="true" focusable="false">
        <defs>
          {art.gradient && (
            <linearGradient id={`${uid}-g`} gradientUnits="userSpaceOnUse" x1={art.gradient.x1} y1={art.gradient.y1} x2={art.gradient.x2} y2={art.gradient.y2}>
              <stop offset="0" stopColor={art.gradient.c1} />
              <stop offset="1" stopColor={art.gradient.c2} />
            </linearGradient>
          )}
          {Object.entries(art.clips).map(([key, clip]) => (
            <clipPath key={key} id={`${uid}-${key}`} clipPathUnits="userSpaceOnUse">
              <path d={clip.d} clipRule={clip.evenodd ? 'evenodd' : undefined} />
            </clipPath>
          ))}
        </defs>
        {art.groups.map((group) => (
          <Group key={group.k} group={group} uid={uid} />
        ))}
      </svg>
    </span>
  );
}
