// TASIMO PLUS logotipi ma'lumoti: TASIMO qushcha emblemasi va «TASIMO» harflari — dashboard.tasimo.uz/src/assets/logo.svg
// (brend fayli), «PLUS» — shu shrift o'lchamlari bo'yicha chizilgan (bosh harf balandligi 104.4, ustun 20.72, gorizontal 18.62).
// Natija: src/components/logo/logo-data.ts. Ishga tushirish: node scripts/gen-logo.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, '..', 'dashboard.tasimo.uz', 'src', 'assets', 'logo.svg'), 'utf8');
const paths = [...source.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((match) => match[1]);
if (paths.length !== 20) throw new Error(`logo.svg: 20 ta path kutilgan edi, ${paths.length} ta topildi`);

// Emblema qismlari (logo.svg tartibi): 0 — katta qanot, 1 — halqa, 2 — o'rta qanot, 3 — qush boshi, 4 — kichik qanot
const emblem = { wingA: paths[0], ring: paths[1], wingB: paths[2], head: paths[3], wingC: paths[4] };

// «TASIMO» — 5..10 (original koordinatalarda, harflar oralig'i brend faylidagidek)
const tasimo = ['T', 'A', 'S', 'I', 'M', 'O'].map((char, i) => ({ char, d: paths[5 + i] }));

// «PLUS» — original koordinatalarda, «O» dan keyin so'z oralig'i bilan
const TOP = 436.4;
const BASE = 540;
const STEM = 20.72;
const BAR = 18.62;
const r = (n) => Math.round(n * 100) / 100;

function glyphP(x) {
  const outer = `M${x},${BASE}V${TOP}H${r(x + 47)}C${r(x + 64.5)},${TOP} ${r(x + 76)},${r(TOP + 11)} ${r(x + 76)},${r(TOP + 31)}V${r(TOP + 37)}C${r(x + 76)},${r(TOP + 57)} ${r(x + 64.5)},${r(TOP + 68.2)} ${r(x + 47)},${r(TOP + 68.2)}H${r(x + STEM)}V${BASE}Z`;
  const inner = `M${r(x + STEM)},${r(TOP + BAR)}V${r(TOP + 49.6)}H${r(x + 45)}C${r(x + 52.5)},${r(TOP + 49.6)} ${r(x + 55.4)},${r(TOP + 45.4)} ${r(x + 55.4)},${r(TOP + 38)}V${r(TOP + 30.2)}C${r(x + 55.4)},${r(TOP + 22.8)} ${r(x + 52.5)},${r(TOP + BAR)} ${r(x + 45)},${r(TOP + BAR)}Z`;
  return { d: outer + inner, width: 76 };
}

function glyphL(x) {
  return { d: `M${x},${TOP}H${r(x + STEM)}V${r(BASE - BAR)}H${r(x + 68)}V${BASE}H${x}Z`, width: 68 };
}

function glyphU(x) {
  const w = 80;
  return {
    d: `M${x},${TOP}H${r(x + STEM)}V${r(BASE - 38)}C${r(x + STEM)},${r(BASE - 25.5)} ${r(x + 26.5)},${r(BASE - BAR)} ${r(x + 40)},${r(BASE - BAR)}C${r(x + 53.5)},${r(BASE - BAR)} ${r(x + w - STEM)},${r(BASE - 25.5)} ${r(x + w - STEM)},${r(BASE - 38)}V${TOP}H${r(x + w)}V${r(BASE - 37)}C${r(x + w)},${r(BASE - 12.5)} ${r(x + 66)},${r(BASE + 0.84)} ${r(x + 40)},${r(BASE + 0.84)}C${r(x + 14)},${r(BASE + 0.84)} ${x},${r(BASE - 12.5)} ${x},${r(BASE - 37)}Z`,
    width: w,
  };
}

const S_MIN_X = 613.37; // brend faylidagi «S» ning chap cheti
const WORD_GAP = 38;
const O_RIGHT = 940.62;
let x = O_RIGHT + WORD_GAP;
const p = glyphP(x);
x += p.width + 13;
const l = glyphL(x);
x += l.width + 9;
const u = glyphU(x);
x += u.width + 13;
const sShift = r(x - S_MIN_X);
const plus = [
  { char: 'P', d: p.d, evenodd: true },
  { char: 'L', d: l.d },
  { char: 'U', d: u.d },
  { char: 'S', d: paths[7], shift: sShift },
];
const wordRight = x + 70.3;

// Yangi koordinatalar: emblema 0..281 × 0..284, so'z — emblemaning vertikal markazida, 1.12 marta kattaroq
const EMBLEM = { x: 123.6, y: 397.9, w: 282, h: 285 };
const SCALE = 1.12;
const capH = (BASE - TOP) * SCALE;
const wordX = EMBLEM.w + 58;
const wordY = r(EMBLEM.h / 2 - capH / 2);
const wordTransform = `translate(${wordX} ${wordY}) scale(${SCALE}) translate(${-437.86} ${-TOP})`;
const width = Math.ceil(wordX + (wordRight - 437.86) * SCALE + 4);
const height = EMBLEM.h;

const out = `/* AUTO-GENERATED: node scripts/gen-logo.mjs — qo'lda tahrirlamang.
 * Emblema va «TASIMO» — dashboard.tasimo.uz/src/assets/logo.svg (brend), «PLUS» — shu shrift o'lchamlarida chizilgan. */

export const LOGO = {
  width: ${width},
  height: ${height},
  /** Emblema kengligi (logotip kengligidan ulushi — yig'ilgan holat) */
  emblemWidth: ${EMBLEM.w},
  emblemTransform: 'translate(${-EMBLEM.x} ${-EMBLEM.y})',
  wordTransform: '${wordTransform}',
  emblem: ${JSON.stringify(emblem, null, 2).replace(/\n/g, '\n  ')},
  letters: ${JSON.stringify(
    [...tasimo.map((letter) => ({ ...letter, word: 'tasimo' })), ...plus.map((letter) => ({ ...letter, word: 'plus' }))],
    null,
    2,
  ).replace(/\n/g, '\n  ')},
} as const;
`;
writeFileSync(join(root, 'src', 'components', 'logo', 'logo-data.ts'), out);

// Ko'rib chiqish uchun SVG (ikkinchi argument — fayl yo'li)
const preview = process.argv[2];
if (preview) {
  const letterPaths = [...tasimo, ...plus]
    .map((letter) => `<path fill="${plus.includes(letter) ? '#2c5fd8' : '#002060'}"${letter.evenodd ? ' fill-rule="evenodd"' : ''} d="${letter.d}"${letter.shift ? ` transform="translate(${letter.shift} 0)"` : ''}/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g transform="translate(${-EMBLEM.x} ${-EMBLEM.y})" fill="#002060">${Object.values(emblem)
    .map((d) => `<path d="${d}"/>`)
    .join('')}</g><g transform="${wordTransform}">${letterPaths}</g></svg>`;
  writeFileSync(preview, svg);
}
console.log(`logo-data.ts yozildi: ${width}×${height}`);
