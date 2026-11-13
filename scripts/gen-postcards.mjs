// Standart illyustratsiyalar (public/art/*.svg) — Ipak yo'li shaharlari + matematika. `bun run gen:art`
// Yengil (har biri ~3–6 KB), stilizatsiya: haqiqiy surat emas — admin muharrirda o'z suratlariga almashtiradi.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, '..', 'public', 'art');
mkdirSync(OUT, { recursive: true });

const W = 800;
const H = 600;

const sky = (id, stops) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const stars = (n, seed, color = '#fff') => {
  let x = seed;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () => `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H * 0.55).toFixed(0)}" r="${(rnd() * 1.6 + 0.4).toFixed(1)}" fill="${color}" opacity="${(rnd() * 0.6 + 0.3).toFixed(2)}"/>`).join('');
};

/** Girih — sakkiz qirrali yulduz naqshi */
const girih = (cx, cy, r, color, opacity = 1) => {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i;
    const rr = i % 2 ? r * 0.55 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="none" stroke="${color}" stroke-width="2" opacity="${opacity}"/>`;
};

const mathOverlay = (color, items) =>
  `<g fill="${color}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" opacity="0.55">${items
    .map(([x, y, size, text]) => `<text x="${x}" y="${y}" font-size="${size}">${text}</text>`)
    .join('')}</g>`;

const svg = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>\n`;

/** Peshtoq (ravoqli darvoza) + gumbaz + minoralar */
const madrasa = (x, w, h, base, tile, dome) => {
  const archW = w * 0.46;
  const archX = x + (w - archW) / 2;
  const top = base - h;
  return `
  <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${base === 0 ? tile : '#e9c98f'}"/>
  <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#tiles)" opacity="0.5"/>
  <path d="M${archX} ${base} V${top + h * 0.38} Q${archX + archW / 2} ${top + h * 0.08} ${archX + archW} ${top + h * 0.38} V${base} Z" fill="${tile}"/>
  <path d="M${archX + 10} ${base} V${top + h * 0.42} Q${archX + archW / 2} ${top + h * 0.17} ${archX + archW - 10} ${top + h * 0.42} V${base} Z" fill="#14234f" opacity="0.85"/>
  ${dome ? `<ellipse cx="${x + w / 2}" cy="${top - 4}" rx="${w * 0.26}" ry="${w * 0.24}" fill="${dome}"/><rect x="${x + w / 2 - w * 0.22}" y="${top - 6}" width="${w * 0.44}" height="10" fill="#e9c98f"/>` : ''}
  <rect x="${x - 16}" y="${top - h * 0.22}" width="16" height="${h * 1.22}" fill="#e9c98f"/>
  <rect x="${x + w}" y="${top - h * 0.22}" width="16" height="${h * 1.22}" fill="#e9c98f"/>
  <rect x="${x - 19}" y="${top - h * 0.22 - 10}" width="22" height="12" fill="${tile}"/>
  <rect x="${x + w - 3}" y="${top - h * 0.22 - 10}" width="22" height="12" fill="${tile}"/>`;
};

const tilesDef = (color) =>
  `<pattern id="tiles" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="none"/>${girih(14, 14, 10, color, 0.9)}</pattern>`;

const cards = {
  registan: svg(
    sky('s', [
      [0, '#ff9a6b'],
      [0.45, '#ffc985'],
      [1, '#ffe7c2'],
    ]) + tilesDef('#1f6f8b'),
    `<rect width="800" height="600" fill="url(#s)"/>
    <circle cx="610" cy="150" r="70" fill="#fff4d6" opacity="0.9"/>
    ${mathOverlay('#7a3b1f', [
      [40, 80, 34, 'π r²'],
      [650, 300, 26, 'sin θ'],
    ])}
    ${madrasa(70, 190, 250, 470, '#2a7fa3', null)}
    ${madrasa(305, 190, 290, 470, '#1f6f8b', '#2bb3c0')}
    ${madrasa(540, 190, 250, 470, '#2a7fa3', null)}
    <rect y="470" width="800" height="130" fill="#d9a35f"/>
    <rect y="470" width="800" height="10" fill="#b77b3e" opacity="0.6"/>
    <g opacity="0.25" stroke="#7a3b1f" stroke-width="2" fill="none"><circle cx="400" cy="300" r="230"/><path d="M170 300 H630 M400 70 V530"/></g>`,
  ),
  samarkand: svg(
    sky('s', [
      [0, '#0b1a4a'],
      [0.6, '#3a3a8f'],
      [1, '#ff9a8b'],
    ]),
    `<rect width="800" height="600" fill="url(#s)"/>${stars(70, 7)}
    <circle cx="150" cy="120" r="34" fill="#fff4d6"/>
    <g fill="#13265a"><rect x="300" y="300" width="200" height="200"/><rect x="250" y="250" width="22" height="250"/><rect x="528" y="250" width="22" height="250"/></g>
    <path d="M310 300 Q400 120 490 300 Z" fill="#2bb3c0"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${318 + i * 20} 300 Q400 ${140 + Math.abs(4 - i) * 8} ${330 + i * 18} 300" stroke="#1a8c99" stroke-width="3" fill="none"/>`).join('')}
    <rect x="300" y="290" width="200" height="16" fill="#e9c98f"/>
    <rect y="500" width="800" height="100" fill="#0d1b45"/>
    ${mathOverlay('#ffd9a0', [
      [560, 140, 30, '365d 6h 10m'],
      [60, 440, 26, 'tan α'],
    ])}
    <path d="M60 520 Q400 470 740 520" stroke="#ffc24b" stroke-width="2" stroke-dasharray="6 8" fill="none" opacity="0.7"/>`,
  ),
  khiva: svg(
    sky('s', [
      [0, '#7cc6ff'],
      [1, '#e8f6ff'],
    ]) + tilesDef('#ffffff'),
    `<rect width="800" height="600" fill="url(#s)"/>
    <ellipse cx="160" cy="130" rx="90" ry="26" fill="#fff" opacity="0.8"/><ellipse cx="620" cy="90" rx="70" ry="20" fill="#fff" opacity="0.7"/>
    <g>
      <rect x="320" y="170" width="160" height="320" rx="6" fill="#d9a35f"/>
      ${['#1f8a8a', '#2bb3c0', '#16607a', '#2bb3c0', '#1f8a8a', '#16607a', '#2bb3c0'].map((c, i) => `<rect x="320" y="${190 + i * 42}" width="160" height="26" fill="${c}"/><rect x="320" y="${190 + i * 42}" width="160" height="26" fill="url(#tiles)" opacity="0.35"/>`).join('')}
    </g>
    <g fill="#c98f4b"><path d="M0 420 H800 V600 H0 Z"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 40}" y="400" width="24" height="24"/>`).join('')}</g>
    <rect y="470" width="800" height="130" fill="#b77b3e"/>
    ${mathOverlay('#16607a', [
      [40, 300, 34, 'algorithm'],
      [600, 260, 30, 'x + y = 10'],
    ])}`,
  ),
  bukhara: svg(
    sky('s', [
      [0, '#ffb36b'],
      [0.55, '#ff7a6b'],
      [1, '#5b2a6b'],
    ]),
    `<rect width="800" height="600" fill="url(#s)"/>
    <circle cx="560" cy="200" r="90" fill="#ffd27a" opacity="0.85"/>
    <path d="M370 470 L384 120 H416 L430 470 Z" fill="#c98f4b"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${380 - i}" y="${150 + i * 40}" width="${40 + i * 2}" height="6" fill="#8f5b2e" opacity="0.6"/>`).join('')}
    <rect x="372" y="105" width="56" height="20" fill="#2bb3c0"/>
    <g fill="#5b2a3b"><ellipse cx="170" cy="470" rx="110" ry="80"/><ellipse cx="640" cy="480" rx="130" ry="90"/><rect x="0" y="470" width="800" height="130"/></g>
    <g fill="#3d1d2e"><circle cx="170" cy="400" r="10"/><circle cx="640" cy="400" r="10"/></g>
    ${mathOverlay('#fff0d6', [
      [60, 120, 32, 'a² + b² = c²'],
      [600, 380, 26, '∑ n'],
    ])}`,
  ),
  tashkent: svg(
    sky('s', [
      [0, '#0b1026'],
      [0.6, '#1b2a6b'],
      [1, '#5b8cff'],
    ]),
    `<rect width="800" height="600" fill="url(#s)"/>${stars(60, 11)}
    <g fill="#0e1738">
      <rect x="40" y="380" width="70" height="220"/><rect x="120" y="330" width="60" height="270"/><rect x="190" y="400" width="80" height="200"/>
      <rect x="560" y="360" width="70" height="240"/><rect x="640" y="300" width="60" height="300"/><rect x="710" y="390" width="70" height="210"/>
    </g>
    <g fill="#ffc24b" opacity="0.75">${Array.from({ length: 40 }, (_, i) => `<rect x="${50 + (i % 8) * 12 + (i > 23 ? 520 : 0)}" y="${400 + Math.floor(i / 8) * 26}" width="5" height="8"/>`).join('')}</g>
    <path d="M396 80 L404 80 L412 470 L388 470 Z" fill="#cfd8ff"/>
    <ellipse cx="400" cy="250" rx="34" ry="14" fill="#e8eeff"/><ellipse cx="400" cy="300" rx="22" ry="9" fill="#e8eeff"/>
    <circle cx="400" cy="76" r="5" fill="#ff6b8b"/>
    <path d="M300 470 Q340 400 380 470 Z" fill="#f2f4ff"/><path d="M420 470 Q460 400 500 470 Z" fill="#f2f4ff"/>
    <rect y="470" width="800" height="130" fill="#0a1230"/>
    ${mathOverlay('#9fb4ff', [
      [470, 160, 30, 'e^iπ + 1 = 0'],
      [60, 300, 26, 'f(x)'],
    ])}`,
  ),
  observatory: svg(
    sky('s', [
      [0, '#05081a'],
      [1, '#1a1f5e'],
    ]),
    `<rect width="800" height="600" fill="url(#s)"/>${stars(110, 23)}
    <g fill="none" stroke="#2ef2c8" stroke-width="1.5" opacity="0.35"><circle cx="400" cy="620" r="420"/><circle cx="400" cy="620" r="360"/></g>
    <path d="M140 600 A300 300 0 0 1 400 300" stroke="#e9c98f" stroke-width="44" fill="none"/>
    <path d="M140 600 A300 300 0 0 1 400 300" stroke="#b77b3e" stroke-width="44" fill="none" stroke-dasharray="3 18" opacity="0.8"/>
    <path d="M400 300 L400 600" stroke="#e9c98f" stroke-width="6"/>
    ${Array.from({ length: 10 }, (_, i) => {
      const a = Math.PI + (Math.PI / 2) * (i / 9);
      return `<line x1="${400 + 300 * Math.cos(a)}" y1="${600 + 300 * Math.sin(a)}" x2="${400 + 330 * Math.cos(a)}" y2="${600 + 330 * Math.sin(a)}" stroke="#fff4d6" stroke-width="2"/>`;
    }).join('')}
    <path d="M400 300 L620 120" stroke="#ffc24b" stroke-width="2" stroke-dasharray="5 6"/>
    <circle cx="620" cy="120" r="8" fill="#ffc24b"/>
    ${mathOverlay('#cdd6ff', [
      [470, 330, 30, 'θ = 23.5°'],
      [520, 80, 22, 'Ulugh Beg, 1420s'],
    ])}`,
  ),
  algebra: svg(
    sky('s', [
      [0, '#fff8ee'],
      [1, '#f4ead9'],
    ]) + `<pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#5b8cff" stroke-opacity="0.18"/></pattern>`,
    `<rect width="800" height="600" fill="url(#s)"/><rect width="800" height="600" fill="url(#grid)"/>
    <g transform="translate(220 120)">
      <rect width="240" height="240" fill="#2ef2c8" opacity="0.35" stroke="#0b9e84" stroke-width="3"/>
      <rect x="240" width="60" height="240" fill="#ffc24b" opacity="0.45" stroke="#c98f00" stroke-width="3"/>
      <rect y="240" width="240" height="60" fill="#ffc24b" opacity="0.45" stroke="#c98f00" stroke-width="3"/>
      <rect x="240" y="240" width="60" height="60" fill="#ff6b8b" opacity="0.4" stroke="#d63f63" stroke-width="3" stroke-dasharray="6 5"/>
      <text x="120" y="130" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="44" fill="#064e43">x²</text>
      <text x="270" y="130" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="24" fill="#5c3a00">5x</text>
      <text x="120" y="280" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="24" fill="#5c3a00">5x</text>
      <text x="270" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#6b1430">25</text>
    </g>
    <text x="400" y="480" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="40" fill="#10162f">x² + 10x = 39  ⟹  x = 3</text>
    <text x="400" y="530" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#10162f" opacity="0.6">al-jabr wa’l-muqabala · al-Khwarizmi</text>`,
  ),
  caravan: svg(
    sky('s', [
      [0, '#ffcf8a'],
      [1, '#ff9a6b'],
    ]),
    `<rect width="800" height="600" fill="url(#s)"/>
    <circle cx="640" cy="190" r="80" fill="#fff1c9" opacity="0.9"/>
    <path d="M0 400 Q200 330 420 390 T800 370 V600 H0 Z" fill="#e8a65e"/>
    <path d="M0 460 Q260 400 520 470 T800 450 V600 H0 Z" fill="#cf8a45"/>
    <g fill="#5b3418">
      ${[120, 260, 400].map((x, i) => `<g transform="translate(${x} ${398 - i * 6})"><ellipse cx="40" cy="20" rx="42" ry="20"/><circle cx="30" cy="2" r="12"/><path d="M78 20 Q100 -10 96 -30 L104 -30 Q110 0 88 26 Z"/><rect x="10" y="30" width="7" height="40"/><rect x="30" y="30" width="7" height="40"/><rect x="52" y="30" width="7" height="40"/><rect x="68" y="30" width="7" height="40"/></g>`).join('')}
    </g>
    <path d="M40 520 C200 470 360 560 520 500 S760 470 780 480" stroke="#fff4d6" stroke-width="3" stroke-dasharray="8 10" fill="none"/>
    ${mathOverlay('#7a3b1f', [
      [60, 120, 30, 'd = v · t'],
      [520, 330, 24, 'S → K → B → T'],
    ])}`,
  ),
  mountains: svg(
    sky('s', [
      [0, '#6ec3ff'],
      [1, '#d9f0ff'],
    ]),
    `<rect width="800" height="600" fill="url(#s)"/>
    <path d="M0 420 L170 180 L300 360 L420 140 L560 340 L660 230 L800 400 V600 H0 Z" fill="#5a6f9a"/>
    <path d="M170 180 L215 245 L185 240 L160 265 L130 236 Z M420 140 L470 210 L440 205 L415 232 L385 200 Z M660 230 L690 272 L665 268 L645 285 L628 262 Z" fill="#fff"/>
    <path d="M0 470 L220 330 L380 450 L560 320 L800 470 V600 H0 Z" fill="#3e8f6e"/>
    <path d="M0 600 Q300 520 400 560 T800 540 V600 Z" fill="#2ebfa0" opacity="0.8"/>
    ${mathOverlay('#ffffff', [
      [470, 110, 30, 'h = 3309 m'],
      [60, 110, 26, '∫ f(x) dx'],
    ])}`,
  ),
};

/**
 * Brend palitrasi (Brand Guidelines: «illyustratsiyada cheklangan palitra»): har rang yorqinligiga qarab uch rang
 * oralig'iga o'tkaziladi — soya #122C46 (matn/neytral), o'rta ton PLUS BLUE #0A62B3, yorug'lik PLUS LIGHT ohangi.
 * Natija — bir oilaga mansub illyustratsiyalar (rang-baranglik yo'q).
 */
const DARK = [18, 44, 70]; // #122C46
const MID = [10, 98, 179]; // #0A62B3
const LIGHT = [238, 245, 252]; // #EEF5FC — #CEE4F8 ning oq bilan aralashmasi
function duotone(svgText) {
  const toLinear = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const mixTo = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return svgText.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (_, hex) => {
    const full = hex.length === 3 ? hex.split('').map((ch) => ch + ch).join('') : hex;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    // Ko'rinadigan yorqinlik (0..1): pastki yarmi — soyadan ko'kka, yuqori yarmi — ko'kdan yorug'likka
    const t = Math.min(1, Math.max(0, Math.pow(lum, 1 / 2.2)));
    const mix = t < 0.5 ? mixTo(DARK, MID, t / 0.5) : mixTo(MID, LIGHT, (t - 0.5) / 0.5);
    return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  });
}

for (const [name, raw] of Object.entries(cards)) {
  const content = duotone(raw);
  writeFileSync(join(OUT, `${name}.svg`), content.replace(/\n\s+/g, '\n'));
  console.log(`art/${name}.svg ${(content.length / 1024).toFixed(1)} KB`);
}
