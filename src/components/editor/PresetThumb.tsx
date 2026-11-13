import type { CSSProperties, ReactNode } from 'react';
import type { SectionType } from '@/lib/doc/types';

/**
 * «Bo'lim qo'shish» oynasidagi eskizlar: har variantning haqiqiy joylashuvi sxematik (skeleton) ko'rinishda —
 * sarlavha, matn qatorlari, kartalar, rasmlar, tugmalar. Ranglar bo'limning standart fonidan (editor.css → .sk-tone-*).
 * Kartaga sichqoncha olib borilganda qismlar ketma-ket yig'iladi (.sk-part, --i) va ayrimlarida ma'noli harakat bor.
 * viewBox 240×150.
 */

const part = (i: number) => ({ className: 'sk-part', style: { '--i': i } as CSSProperties });

function Eyebrow({ x, y, center = false, i = 0 }: { x: number; y: number; center?: boolean; i?: number }) {
  const w = 34;
  const x0 = center ? x - w / 2 : x;
  return (
    <g {...part(i)}>
      <rect x={x0} y={y + 1} width={7} height={1} className="sk-accent" />
      <rect x={x0 + 9} y={y} width={w - 9} height={3} rx={1.5} className="sk-accent" />
    </g>
  );
}

function Bar({ x, y, w, h = 7, accent = false, center = false, i = 0 }: { x: number; y: number; w: number; h?: number; accent?: boolean; center?: boolean; i?: number }) {
  return <rect {...part(i)} x={center ? x - w / 2 : x} y={y} width={w} height={h} rx={h / 2} className={accent ? 'sk-accent' : 'sk-ink'} />;
}

function Lines({ x, y, w, n = 2, gap = 5.5, center = false, i = 0 }: { x: number; y: number; w: number; n?: number; gap?: number; center?: boolean; i?: number }) {
  return (
    <g {...part(i)}>
      {Array.from({ length: n }, (_, k) => {
        const lw = n > 1 && k === n - 1 ? w * 0.66 : w;
        return <rect key={k} x={center ? x - lw / 2 : x} y={y + k * gap} width={lw} height={2.4} rx={1.2} className="sk-muted" />;
      })}
    </g>
  );
}

function Btn({ x, y, w = 30, primary = false, i = 0 }: { x: number; y: number; w?: number; primary?: boolean; i?: number }) {
  return <rect {...part(i)} x={x} y={y} width={w} height={9} rx={4.5} className={primary ? 'sk-btn' : 'sk-btn2'} />;
}

function Card({ x, y, w, h, r = 5, i = 0, children }: { x: number; y: number; w: number; h: number; r?: number; i?: number; children?: ReactNode }) {
  return (
    <g {...part(i)}>
      <rect x={x} y={y} width={w} height={h} rx={r} className="sk-card" />
      {children}
    </g>
  );
}

function Picture({ x, y, w, h, r = 4 }: { x: number; y: number; w: number; h: number; r?: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={r} className="sk-img" />
      <path
        d={`M${x + w * 0.1} ${y + h * 0.84} L${x + w * 0.36} ${y + h * 0.5} L${x + w * 0.54} ${y + h * 0.7} L${x + w * 0.68} ${y + h * 0.56} L${x + w * 0.9} ${y + h * 0.84} Z`}
        className="sk-img2"
      />
      <circle cx={x + w * 0.74} cy={y + h * 0.3} r={Math.max(2, Math.min(w, h) * 0.09)} className="sk-img2" />
    </>
  );
}

function Img({ x, y, w, h, r = 4, i = 0 }: { x: number; y: number; w: number; h: number; r?: number; i?: number }) {
  return (
    <g {...part(i)}>
      <Picture x={x} y={y} w={w} h={h} r={r} />
    </g>
  );
}

function Chip({ x, y, s = 8 }: { x: number; y: number; s?: number }) {
  return <rect x={x} y={y} width={s} height={s} rx={2.4} className="sk-chip" />;
}

function Rule({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <line x1={x1} x2={x2} y1={y} y2={y} className="sk-line" />;
}

/** Markazdagi sarlavha bloki: yorliq, sarlavha (1–2 qator), izoh */
function Head({ y = 14, title = 108, second = 0, sub = 120 }: { y?: number; title?: number; second?: number; sub?: number }) {
  return (
    <>
      <Eyebrow x={120} y={y} center i={0} />
      <Bar x={120} y={y + 9} w={title} h={7} center i={1} />
      {second > 0 && <Bar x={120} y={y + 19} w={second} h={7} center i={1} />}
      {sub > 0 && <Lines x={120} y={y + (second ? 31 : 22)} w={sub} n={1} center i={2} />}
    </>
  );
}

function Digit({ x, y, value, size = 24 }: { x: number; y: number; value: string; size?: number }) {
  return (
    <text x={x} y={y} className="sk-num" fontSize={size}>
      {value}
    </text>
  );
}

const THUMBS: Record<string, () => ReactNode> = {
  // ───────── Bosh ekran ─────────
  'hero:orbit': () => (
    <>
      <Eyebrow x={16} y={26} i={0} />
      <Bar x={16} y={35} w={84} h={9} i={1} />
      <Bar x={16} y={48} w={62} h={9} accent i={2} />
      <Lines x={16} y={65} w={86} n={3} i={3} />
      <Btn x={16} y={89} w={36} primary i={4} />
      <Btn x={56} y={89} w={30} i={4} />
      <Card x={124} y={22} w={100} h={102} r={8} i={2} />
      <line {...part(3)} x1={139} x2={139} y1={38} y2={104} className="sk-dash" />
      {[38, 71, 104].map((cy, k) => (
        <g key={cy} {...part(3 + k)}>
          <circle cx={139} cy={cy} r={6} className="sk-card sk-seq" style={{ '--s': k } as CSSProperties} />
          <rect x={151} y={cy - 5} width={44} height={4} rx={2} className="sk-ink" />
          <rect x={151} y={cy + 2} width={58} height={2.4} rx={1.2} className="sk-muted" />
        </g>
      ))}
    </>
  ),
  'hero:split': () => (
    <>
      <Eyebrow x={16} y={22} i={0} />
      <Bar x={16} y={31} w={84} h={9} i={1} />
      <Bar x={16} y={44} w={62} h={9} accent i={2} />
      <Lines x={16} y={61} w={86} n={3} i={3} />
      <Btn x={16} y={84} w={36} primary i={4} />
      <Btn x={56} y={84} w={30} i={4} />
      <Img x={132} y={16} w={92} h={98} r={9} i={2} />
      {[16, 72, 128].map((x, k) => (
        <g key={x} {...part(5 + k)}>
          <Rule x1={x} x2={x + 48} y={122} />
          <rect x={x} y={127} width={14} height={5} rx={2.5} className="sk-ink" />
          <rect x={x} y={135} width={40} height={2.4} rx={1.2} className="sk-muted" />
        </g>
      ))}
    </>
  ),
  'hero:poster': () => (
    <>
      <g {...part(0)}>
        <Picture x={0} y={0} w={240} h={150} r={0} />
        <rect x={0} y={0} width={240} height={150} className="sk-overlay" />
      </g>
      <Eyebrow x={120} y={28} center i={1} />
      <Bar x={120} y={37} w={104} h={9} center i={2} />
      <Bar x={120} y={50} w={74} h={9} accent center i={2} />
      <Lines x={120} y={67} w={120} n={2} center i={3} />
      <Btn x={83} y={84} w={36} primary i={4} />
      <Btn x={123} y={84} w={34} i={4} />
      {[40, 100, 160].map((x, k) => (
        <g key={x} {...part(5 + k)}>
          <Rule x1={x} x2={x + 42} y={112} />
          <rect x={x} y={117} width={14} height={5} rx={2.5} className="sk-ink" />
          <rect x={x} y={125} width={36} height={2.4} rx={1.2} className="sk-muted" />
        </g>
      ))}
    </>
  ),

  // ───────── Loyiha haqida ─────────
  'about:split': () => (
    <>
      <Img x={16} y={18} w={82} h={112} r={9} i={0} />
      <Eyebrow x={112} y={20} i={1} />
      <Bar x={112} y={29} w={96} h={8} i={2} />
      <Bar x={112} y={40} w={70} h={8} i={2} />
      <Lines x={112} y={55} w={112} n={3} i={3} />
      {[
        [112, 80],
        [170, 80],
        [112, 106],
        [170, 106],
      ].map(([x, y], k) => (
        <g key={k} {...part(4 + k)}>
          <Rule x1={x} x2={x + 50} y={y} />
          <Chip x={x} y={y + 5} />
          <rect x={x} y={y + 16} width={34} height={3.5} rx={1.75} className="sk-ink" />
          <rect x={x} y={y + 22} width={46} height={2.2} rx={1.1} className="sk-muted" />
        </g>
      ))}
    </>
  ),
  'about:centered': () => (
    <>
      <Head y={16} title={110} second={80} sub={150} />
      {[16, 70, 124, 178].map((x, k) => (
        <g key={x} {...part(3 + k)}>
          <Rule x1={x} x2={x + 46} y={86} />
          <Chip x={x} y={92} />
          <rect x={x} y={104} width={32} height={3.5} rx={1.75} className="sk-ink" />
          <rect x={x} y={111} width={44} height={2.2} rx={1.1} className="sk-muted" />
          <rect x={x} y={116} width={30} height={2.2} rx={1.1} className="sk-muted" />
        </g>
      ))}
    </>
  ),

  // ───────── Afzalliklar ─────────
  'features:cards': () => (
    <>
      <Head y={12} title={100} sub={118} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const x = 16 + (k % 3) * 71;
        const y = 48 + Math.floor(k / 3) * 49;
        return (
          <Card key={k} x={x} y={y} w={66} h={43} i={3 + k}>
            <Chip x={x + 7} y={y + 7} />
            <rect x={x + 7} y={y + 20} width={34} height={3.5} rx={1.75} className="sk-ink" />
            <rect x={x + 7} y={y + 28} width={50} height={2.2} rx={1.1} className="sk-muted" />
            <rect x={x + 7} y={y + 33} width={36} height={2.2} rx={1.1} className="sk-muted" />
          </Card>
        );
      })}
    </>
  ),
  'features:icons': () => (
    <>
      <Head y={12} title={100} sub={118} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const x = 16 + (k % 3) * 71;
        const y = 50 + Math.floor(k / 3) * 46;
        return (
          <g key={k} {...part(3 + k)}>
            <Rule x1={x} x2={x + 64} y={y} />
            <Chip x={x} y={y + 6} />
            <rect x={x} y={y + 19} width={36} height={3.5} rx={1.75} className="sk-ink" />
            <rect x={x} y={y + 27} width={56} height={2.2} rx={1.1} className="sk-muted" />
            <rect x={x} y={y + 32} width={40} height={2.2} rx={1.1} className="sk-muted" />
          </g>
        );
      })}
    </>
  ),
  'features:bento': () => (
    <>
      <Head y={10} title={96} sub={0} />
      {[
        [16, 34, 102, 50, true],
        [122, 34, 49, 50, false],
        [175, 34, 49, 50, false],
        [16, 88, 49, 52, false],
        [69, 88, 102, 52, true],
        [175, 88, 49, 52, false],
      ].map(([x, y, w, h, wide], k) => (
        <Card key={k} x={x as number} y={y as number} w={w as number} h={h as number} i={2 + k}>
          {wide && <rect x={(x as number) + 1} y={(y as number) + 1} width={(w as number) - 2} height={(h as number) - 2} rx={4} className="sk-img sk-faint" />}
          <Chip x={(x as number) + 7} y={(y as number) + 7} />
          <rect x={(x as number) + 7} y={(y as number) + (h as number) - 16} width={wide ? 48 : 30} height={3.5} rx={1.75} className="sk-ink" />
          <rect x={(x as number) + 7} y={(y as number) + (h as number) - 9} width={wide ? 64 : 34} height={2.2} rx={1.1} className="sk-muted" />
        </Card>
      ))}
    </>
  ),

  // ───────── Mavsumlar ─────────
  'seasons:route': () => (
    <>
      <Head y={12} title={112} sub={130} />
      {[16, 123].map((x, k) => (
        <Card key={x} x={x} y={50} w={101} h={86} r={8} i={3 + k}>
          <rect x={x + 10} y={62} width={22} height={2.4} rx={1.2} className="sk-muted" />
          <g className="sk-spin">
            {k === 0 ? (
              <g className="sk-glyph">
                <line x1={x + 85} y1={58} x2={x + 85} y2={70} />
                <line x1={x + 79.8} y1={61} x2={x + 90.2} y2={67} />
                <line x1={x + 79.8} y1={67} x2={x + 90.2} y2={61} />
              </g>
            ) : (
              <g className="sk-glyph">
                <circle cx={x + 85} cy={64} r={3} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                  const rad = (a * Math.PI) / 180;
                  return <line key={a} x1={x + 85 + Math.cos(rad) * 4.6} y1={64 + Math.sin(rad) * 4.6} x2={x + 85 + Math.cos(rad) * 6.8} y2={64 + Math.sin(rad) * 6.8} />;
                })}
              </g>
            )}
          </g>
          <rect x={x + 10} y={80} width={58} height={7} rx={3.5} className="sk-ink" />
          <Rule x1={x + 10} x2={x + 91} y={96} />
          <rect x={x + 10} y={104} width={70} height={2.4} rx={1.2} className="sk-muted" />
          <rect x={x + 10} y={112} width={62} height={2.4} rx={1.2} className="sk-muted" />
        </Card>
      ))}
    </>
  ),
  'seasons:cards': () => (
    <>
      <Head y={10} title={112} sub={0} />
      {[16, 123].map((x, k) => (
        <Card key={x} x={x} y={36} w={101} h={102} r={8} i={2 + k}>
          <Picture x={x + 1} y={37} w={99} h={40} r={7} />
          <rect x={x + 10} y={86} width={22} height={2.4} rx={1.2} className="sk-muted" />
          <rect x={x + 10} y={94} width={58} height={7} rx={3.5} className="sk-ink" />
          <Rule x1={x + 10} x2={x + 91} y={108} />
          <rect x={x + 10} y={115} width={70} height={2.4} rx={1.2} className="sk-muted" />
          <rect x={x + 10} y={122} width={58} height={2.4} rx={1.2} className="sk-muted" />
        </Card>
      ))}
    </>
  ),

  // ───────── Qadamlar ─────────
  'steps:path': () => (
    <>
      <Head y={12} title={116} sub={0} />
      <line {...part(2)} x1={16} x2={224} y1={56} y2={56} className="sk-line" />
      {[16, 70, 124, 178].map((x, k) => (
        <g key={x} {...part(3 + k)}>
          <circle cx={x + 7} cy={56} r={7} className="sk-card sk-seq" style={{ '--s': k } as CSSProperties} />
          <rect x={x + 18} y={54.5} width={8} height={3} rx={1.5} className="sk-muted" />
          <rect x={x} y={72} width={38} height={4} rx={2} className="sk-ink" />
          <rect x={x} y={81} width={46} height={2.2} rx={1.1} className="sk-muted" />
          <rect x={x} y={86} width={34} height={2.2} rx={1.1} className="sk-muted" />
        </g>
      ))}
      <Btn x={102} y={110} w={36} primary i={7} />
    </>
  ),
  'steps:numbered': () => (
    <>
      <Head y={12} title={116} sub={0} />
      {[
        [16, 44],
        [124, 44],
        [16, 92],
        [124, 92],
      ].map(([x, y], k) => (
        <g key={k} {...part(2 + k)}>
          <Rule x1={x} x2={x + 100} y={y} />
          <Digit x={x} y={y + 20} value={`0${k + 1}`} size={15} />
          <rect x={x + 26} y={y + 9} width={48} height={4} rx={2} className="sk-ink" />
          <rect x={x + 26} y={y + 18} width={70} height={2.2} rx={1.1} className="sk-muted" />
          <rect x={x + 26} y={y + 23} width={54} height={2.2} rx={1.1} className="sk-muted" />
        </g>
      ))}
    </>
  ),

  // ───────── Raqamlar ─────────
  'stats:band': () => (
    <>
      <Bar x={120} y={22} w={104} h={8} center i={0} />
      {['2', '2', '1', '2'].map((value, k) => {
        const x = 16 + k * 54;
        return (
          <g key={k} {...part(1 + k)}>
            <Rule x1={x} x2={x + 46} y={54} />
            <Digit x={x} y={86} value={value} size={28} />
            <rect x={x} y={96} width={44} height={2.4} rx={1.2} className="sk-muted" />
            <rect x={x} y={102} width={30} height={2.4} rx={1.2} className="sk-muted" />
          </g>
        );
      })}
    </>
  ),
  'stats:cards': () => (
    <>
      <Bar x={120} y={18} w={104} h={8} center i={0} />
      {['2', '2', '1'].map((value, k) => {
        const x = 16 + k * 71;
        return (
          <Card key={k} x={x} y={42} w={66} h={86} i={1 + k}>
            <Chip x={x + 8} y={50} />
            <Digit x={x + 8} y={92} value={value} size={28} />
            <rect x={x + 8} y={102} width={46} height={2.4} rx={1.2} className="sk-muted" />
            <rect x={x + 8} y={108} width={32} height={2.4} rx={1.2} className="sk-muted" />
          </Card>
        );
      })}
    </>
  ),

  // ───────── Galereya ─────────
  'gallery:postcards': () => (
    <>
      <Head y={8} title={100} sub={0} />
      {[
        [16, 32, 100, 58],
        [124, 32, 46, 58],
        [178, 32, 46, 27],
        [178, 63, 46, 27],
        [16, 96, 46, 46],
        [70, 96, 100, 46],
        [178, 96, 46, 46],
      ].map(([x, y, w, h], k) => (
        <Card key={k} x={x} y={y} w={w} h={h} r={4} i={2 + k}>
          <Picture x={x + 2} y={y + 2} w={w - 4} h={h - 10} r={3} />
          <rect x={x + 3} y={y + h - 5.5} width={w * 0.46} height={2.2} rx={1.1} className="sk-ink" />
        </Card>
      ))}
    </>
  ),
  'gallery:clean': () => (
    <>
      <Head y={8} title={100} sub={0} />
      {[
        [16, 32, 100, 58],
        [124, 32, 46, 58],
        [178, 32, 46, 27],
        [178, 63, 46, 27],
        [16, 96, 46, 46],
        [70, 96, 100, 46],
        [178, 96, 46, 46],
      ].map(([x, y, w, h], k) => (
        <g key={k} {...part(2 + k)}>
          <Picture x={x} y={y} w={w} h={h} r={4} />
          <rect x={x} y={y + h - 11} width={w} height={11} rx={0} className="sk-shade" />
          <rect x={x + 4} y={y + h - 6.5} width={w * 0.46} height={2.2} rx={1.1} className="sk-white" />
        </g>
      ))}
    </>
  ),

  // ───────── Video ─────────
  'video:featured': () => (
    <>
      <Head y={10} title={112} sub={0} />
      <g {...part(2)}>
        <rect x={40} y={36} width={160} height={98} rx={8} className="sk-player" />
        <Picture x={40} y={36} w={160} h={98} r={8} />
        <rect x={40} y={36} width={160} height={98} rx={8} className="sk-overlay" />
      </g>
      <g {...part(3)}>
        <g className="sk-pulse">
          <circle cx={120} cy={85} r={11} className="sk-white" />
          <path d="M117 79.5 L125 85 L117 90.5 Z" className="sk-play" />
        </g>
      </g>
    </>
  ),
  'video:split': () => (
    <>
      <Eyebrow x={16} y={40} i={0} />
      <Bar x={16} y={49} w={82} h={8} i={1} />
      <Bar x={16} y={60} w={60} h={8} i={1} />
      <Lines x={16} y={76} w={86} n={2} i={2} />
      <Btn x={16} y={94} w={34} primary i={3} />
      <g {...part(2)}>
        <rect x={114} y={34} width={110} height={70} rx={7} className="sk-player" />
        <Picture x={114} y={34} w={110} h={70} r={7} />
        <rect x={114} y={34} width={110} height={70} rx={7} className="sk-overlay" />
      </g>
      <g {...part(3)}>
        <g className="sk-pulse">
          <circle cx={169} cy={69} r={9} className="sk-white" />
          <path d="M166.5 64.5 L173 69 L166.5 73.5 Z" className="sk-play" />
        </g>
      </g>
    </>
  ),

  // ───────── Fikrlar / mukofotlar ─────────
  'testimonials:quotes': () => (
    <>
      <Head y={12} title={110} sub={0} />
      {[16, 87, 158].map((x, k) => (
        <Card key={x} x={x} y={40} w={66} h={96} i={2 + k}>
          <text x={x + 8} y={60} className="sk-quote" fontSize={18}>
            “
          </text>
          <rect x={x + 8} y={66} width={50} height={2.4} rx={1.2} className="sk-muted" />
          <rect x={x + 8} y={72} width={50} height={2.4} rx={1.2} className="sk-muted" />
          <rect x={x + 8} y={78} width={36} height={2.4} rx={1.2} className="sk-muted" />
          <circle cx={x + 14} cy={120} r={6} className="sk-img" />
          <rect x={x + 24} y={115} width={30} height={3.5} rx={1.75} className="sk-ink" />
          <rect x={x + 24} y={122} width={22} height={2.2} rx={1.1} className="sk-muted" />
        </Card>
      ))}
    </>
  ),
  'testimonials:prizes': () => (
    <>
      <Head y={10} title={104} sub={0} />
      {[
        [16, 58, 72, '2'],
        [87, 40, 90, '1'],
        [158, 58, 72, '3'],
      ].map(([x, y, h, place], k) => (
        <Card key={k} x={x as number} y={y as number} w={66} h={h as number} i={2 + k}>
          <circle cx={(x as number) + 33} cy={(y as number) + 16} r={8} className="sk-chip" />
          <text x={(x as number) + 33} y={(y as number) + 44} className="sk-num" fontSize={20} textAnchor="middle">
            {place}
          </text>
          <rect x={(x as number) + 15} y={(y as number) + 52} width={36} height={3.5} rx={1.75} className="sk-ink" />
          <rect x={(x as number) + 11} y={(y as number) + 59} width={44} height={2.2} rx={1.1} className="sk-muted" />
        </Card>
      ))}
    </>
  ),

  // ───────── Savol-javob ─────────
  'faq:accordion': () => (
    <>
      <Head y={10} title={112} sub={0} />
      {[38, 70, 88, 106, 124].map((y, k) => (
        <g key={y} {...part(2 + k)}>
          <Rule x1={40} x2={200} y={y} />
          {y < 140 && k < 5 && (
            <>
              <rect x={40} y={y + 6} width={k === 0 ? 92 : 78 - k * 6} height={4} rx={2} className="sk-ink" />
              <circle cx={194} cy={y + 8} r={4.5} className="sk-ring" />
              <path d={`M191.5 ${y + 8} H196.5 M194 ${y + 5.5} V${y + 10.5}`} className={k === 0 ? 'sk-plus sk-plus-open' : 'sk-plus'} />
            </>
          )}
          {k === 0 && (
            <g className="sk-open">
              <rect x={40} y={y + 16} width={120} height={2.4} rx={1.2} className="sk-muted" />
              <rect x={40} y={y + 22} width={96} height={2.4} rx={1.2} className="sk-muted" />
            </g>
          )}
        </g>
      ))}
      <Rule x1={40} x2={200} y={142} />
    </>
  ),
  'faq:two-column': () => (
    <>
      <Eyebrow x={16} y={30} i={0} />
      <Bar x={16} y={39} w={70} h={8} i={1} />
      <Bar x={16} y={50} w={52} h={8} i={1} />
      <Btn x={16} y={68} w={34} primary i={2} />
      {[22, 52, 72, 92, 112].map((y, k) => (
        <g key={y} {...part(2 + k)}>
          <Rule x1={106} x2={224} y={y} />
          <rect x={106} y={y + 6} width={k === 0 ? 76 : 64 - k * 4} height={4} rx={2} className="sk-ink" />
          <circle cx={218} cy={y + 8} r={4.5} className="sk-ring" />
          <path d={`M215.5 ${y + 8} H220.5 M218 ${y + 5.5} V${y + 10.5}`} className={k === 0 ? 'sk-plus sk-plus-open' : 'sk-plus'} />
          {k === 0 && (
            <g className="sk-open">
              <rect x={106} y={y + 16} width={96} height={2.4} rx={1.2} className="sk-muted" />
              <rect x={106} y={y + 22} width={74} height={2.4} rx={1.2} className="sk-muted" />
            </g>
          )}
        </g>
      ))}
      <Rule x1={106} x2={224} y={132} />
    </>
  ),

  // ───────── Chaqiriq ─────────
  'cta:boarding': () => (
    <>
      <Eyebrow x={16} y={40} i={0} />
      <Bar x={16} y={49} w={72} h={8} i={1} />
      <Bar x={16} y={60} w={56} h={8} i={1} />
      <Lines x={16} y={76} w={80} n={2} i={2} />
      <Btn x={16} y={94} w={36} primary i={3} />
      <Btn x={56} y={94} w={30} i={3} />
      <g {...part(2)}>
        <rect x={112} y={34} width={112} height={80} rx={7} className="sk-ticket" />
        <line x1={196} x2={196} y1={38} y2={110} className="sk-tdash" />
        <circle cx={196} cy={34} r={4} className="sk-notch" />
        <circle cx={196} cy={114} r={4} className="sk-notch" />
        <rect x={120} y={42} width={30} height={3.5} rx={1.75} className="sk-tink" />
        <rect x={168} y={42} width={20} height={2.4} rx={1.2} className="sk-tmuted" />
        <rect x={120} y={55} width={26} height={8} rx={2} className="sk-tink" />
        <rect x={168} y={55} width={20} height={8} rx={2} className="sk-tink" />
        <line x1={149} x2={165} y1={59} y2={59} className="sk-tdash" />
        <path d="M154 56.5 L160 59 L154 61.5 L155.5 59 Z" className="sk-tink sk-plane" />
        <line x1={120} x2={188} y1={72} y2={72} className="sk-tdash" />
        {[120, 143, 166].map((x) => (
          <g key={x}>
            <rect x={x} y={80} width={14} height={2} rx={1} className="sk-tmuted" />
            <rect x={x} y={86} width={18} height={4} rx={2} className="sk-tink" />
            <rect x={x} y={94} width={16} height={2} rx={1} className="sk-tmuted" />
          </g>
        ))}
        {[0, 3, 5, 8, 10, 13, 16, 18, 21, 24].map((dy) => (
          <rect key={dy} x={204} y={58 + dy} width={12} height={dy % 3 === 0 ? 2 : 1} className="sk-tink" />
        ))}
      </g>
    </>
  ),
  'cta:banner': () => (
    <>
      <Eyebrow x={120} y={42} center i={0} />
      <Bar x={120} y={51} w={110} h={9} center i={1} />
      <Bar x={120} y={64} w={80} h={9} center i={1} />
      <Lines x={120} y={81} w={120} n={1} center i={2} />
      <Btn x={83} y={94} w={36} primary i={3} />
      <Btn x={123} y={94} w={34} i={3} />
    </>
  ),

  // ───────── Matn ─────────
  'richtext:article': () => (
    <>
      <Eyebrow x={60} y={20} i={0} />
      <Bar x={60} y={29} w={100} h={8} i={1} />
      <Bar x={60} y={40} w={76} h={8} i={1} />
      <Lines x={60} y={58} w={120} n={4} i={2} />
      <Lines x={60} y={88} w={120} n={3} i={3} />
      <Lines x={60} y={111} w={120} n={3} i={4} />
    </>
  ),
  'richtext:aside': () => (
    <>
      <Eyebrow x={16} y={30} i={0} />
      <Bar x={16} y={39} w={72} h={8} i={1} />
      <Bar x={16} y={50} w={60} h={8} i={1} />
      <Bar x={16} y={61} w={44} h={8} i={1} />
      <Lines x={110} y={32} w={114} n={5} i={2} />
      <Lines x={110} y={67} w={114} n={4} i={3} />
      <Lines x={110} y={96} w={114} n={4} i={4} />
    </>
  ),

  // ───────── Hamkorlar ─────────
  'logos:marquee': () => (
    <>
      <Bar x={120} y={38} w={64} h={6} center i={0} />
      <g {...part(1)}>
        <g className="sk-slide">
          {Array.from({ length: 12 }, (_, k) => (
            <g key={k}>
              <rect x={16 + k * 44} y={62} width={36} height={18} rx={5} className="sk-card" />
              <rect x={24 + k * 44} y={69} width={20} height={4} rx={2} className="sk-muted" />
            </g>
          ))}
        </g>
      </g>
    </>
  ),
  'logos:grid': () => (
    <>
      <Bar x={120} y={26} w={64} h={6} center i={0} />
      {Array.from({ length: 10 }, (_, k) => {
        const x = 16 + (k % 5) * 42;
        const y = 48 + Math.floor(k / 5) * 30;
        return (
          <Card key={k} x={x} y={y} w={38} h={24} i={1 + k}>
            <rect x={x + 9} y={y + 10} width={20} height={4} rx={2} className="sk-muted" />
          </Card>
        );
      })}
    </>
  ),
};

/** Variant eskizi (SVG). Topilmasa — umumiy sarlavha + matn eskizi */
export function PresetThumb({ type, variant }: { type: SectionType; variant: string }) {
  const draw =
    THUMBS[`${type}:${variant}`] ??
    (() => (
      <>
        <Head y={30} title={110} sub={140} />
        <Lines x={120} y={80} w={150} n={4} center i={3} />
      </>
    ));
  return (
    <svg viewBox="0 0 240 150" className="sk" aria-hidden="true" focusable="false">
      {draw()}
    </svg>
  );
}
