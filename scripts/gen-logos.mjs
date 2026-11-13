// TASIMO Plus logotiplari (5 ta yangi): trace natijasidan (scripts/.trace/*.json — trace-logos.py) animatsiya guruhlarini yig'adi.
//   src/components/logo/logo-art.ts        — saytdagi ArtLogo komponenti uchun ma'lumot (guruhlar, kesish, ranglar)
//   branding/svg/animated/<nom>.svg        — mustaqil animatsiyali SVG (ochilganda bir marta jonlanadi)
// Ishga tushirish: node scripts/gen-logos.mjs   (avval: python -X utf8 scripts/trace-logos.py)
//
// Guruh rollari: letter — skrollda so'nib yig'iladi; mark — qoladi va chapga suriladi; badge — PLUS yorlig'i (belgi bilan qoladi);
// extra — bezak (skrollda so'nadi). Qism guruhga markazi (bbox markazi) to'rtburchak ichida bo'lsa tushadi.
// Bitta bog'langan shakl ikki guruhga bo'linsa — har biri o'z kesish (clip) maydoni bilan chiziladi.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TRACE = join(root, 'scripts', '.trace');

const COLORS = { ink: '#0A62B3', soft: '#CEE4F8', mid: '#6CA6E3', white: '#FFFFFF' };

/** Selektor: { in: [x0, y0, x1, y1], layer?, emblem? } — markazi to'rtburchakda bo'lgan qismlar */
const sel = (rect, layer) => ({ in: rect, layer });
const full = (w, h) => [0, 0, w, h];
// Tog' logotipi: tog' + yer chizig'i + PLUS kapsulasi; pastdagi ilmoq (x 1505–1529.5, y 223.5 dan pastga) kesib tashlanadi
const PEAK = [
  [1296, 0],
  [1845, 0],
  [1845, 240],
  [1531, 240],
  [1531, 227.4],
  [1501, 223.6],
  [1501, 240],
  [1296, 240],
];

/**
 * Har logotip: name (admin uchun), dark (oq logotip — och fonda to'q plashka ichida), collapsedW (yig'ilgan kenglik),
 * clips (id → rect | {not: rect} | {circle: [cx, cy, r]} | {notCircle: [cx, cy, r]}), groups.
 */
const CONFIG = {
  official: {
    trace: 'reference',
    name: 'Rasmiy (Brand Guidelines)',
    dark: true,
    collapsedW: 530,
    clips: { left: [0, 0, 1118, 480], right: [1118, 0, 1636, 480] },
    // Yig'ilganda faqat PLUS plashkasi qoladi (foydalanuvchi: «O» va qushcha ustida PLUS g'alati turadi)
    groups: [
      { k: 'T', r: 'letter', fx: -40, parts: [sel([0, 180, 212, 470], 'white')] },
      { k: 'A', r: 'letter', fx: -40, parts: [sel([212, 180, 470, 470], 'white')] },
      { k: 'S', r: 'letter', fx: -40, parts: [sel([490, 180, 660, 470], 'white')] },
      { k: 'I', r: 'letter', fx: -40, parts: [sel([670, 180, 780, 470], 'white')] },
      { k: 'M', r: 'letter', fx: -40, clip: 'left', parts: [sel([790, 300, 1116, 470], 'white'), sel([1080, 150, 1100, 330], 'white')], shared: [1] },
      {
        k: 'mark',
        r: 'mark',
        hide: true,
        sub: [
          { k: 'bar', clip: 'right', parts: [sel([1080, 150, 1100, 330], 'white')], shared: [0] },
          {
            k: 'emblem',
            emblem: true,
            sub: [
              { k: 'ring', cls: 'lg-ring', parts: [{ emblem: 'ring' }] },
              { k: 'wA', cls: 'lg-wing', w: 0, parts: [{ emblem: 'wingA' }] },
              { k: 'wB', cls: 'lg-wing', w: 1, parts: [{ emblem: 'wingB' }] },
              { k: 'wC', cls: 'lg-wing', w: 2, parts: [{ emblem: 'wingC' }] },
              { k: 'head', cls: 'lg-head', parts: [{ emblem: 'head' }] },
            ],
          },
        ],
      },
      { k: 'badge', r: 'badge', collapse: { fill: 0.62, pad: 10 }, parts: [sel(full(1636, 480), 'plate'), sel([1340, 20, 1600, 115], 'white')] },
    ],
  },
  mountain: {
    trace: 'mountain',
    name: "Tog' va chodir",
    collapsedW: 620,
    // Tog', uning ostidagi yer chizig'i va PLUS kapsulasi M chizig'i bilan bitta shakl — `peak` ko'pburchagi bo'yicha kesib
    // ajratiladi (kapsula ostidagi ilmoq chizig'i chiqarib tashlanadi); yig'ilganda tog' + PLUS qoladi
    clips: {
      left: [0, 0, 1232, 551],
      rest: { rectMinusPoly: [[1232, 0, 1845, 551], PEAK] },
      peak: { poly: PEAK },
    },
    groups: [
      { k: 'T', r: 'letter', fx: -40, parts: [sel([0, 230, 250, 540], 'ink')] },
      { k: 'A', r: 'letter', fx: -40, parts: [sel([250, 230, 530, 540], 'ink')] },
      { k: 'S', r: 'letter', fx: -40, parts: [sel([535, 230, 735, 540], 'ink')] },
      { k: 'I', r: 'letter', fx: -40, parts: [sel([740, 230, 860, 540], 'ink')] },
      { k: 'M', r: 'letter', fx: -40, clip: 'left', parts: [sel([870, 300, 1232, 540], 'ink'), sel([1340, 180, 1370, 210], 'ink')], shared: [1] },
      {
        k: 'mark',
        r: 'mark',
        hide: true,
        sub: [
          { k: 'top', clip: 'rest', parts: [sel([1340, 180, 1370, 210], 'ink')], shared: [0] },
          { k: 'ring', cls: 'lg-ring', parts: [sel([1360, 370, 1380, 395], 'ink')] },
          { k: 'wA', cls: 'lg-wing', w: 0, parts: [sel([1405, 415, 1425, 435], 'ink')] },
          { k: 'wB', cls: 'lg-wing', w: 1, parts: [sel([1447, 425, 1467, 447], 'ink')] },
          { k: 'wC', cls: 'lg-wing', w: 2, parts: [sel([1474, 447, 1494, 467], 'ink')] },
          { k: 'head', cls: 'lg-head', parts: [sel([1328, 339, 1348, 359], 'ink')] },
        ],
      },
      {
        k: 'badge',
        r: 'badge',
        collapse: { fill: 0.8, pad: 10, box: [1296, 6, 1832, 228] },
        sub: [
          { k: 'outline', clip: 'peak', parts: [sel([1340, 180, 1370, 210], 'ink')], shared: [0] },
          { k: 'faces', parts: [sel([1340, 0, 1700, 240], 'soft')] },
          { k: 'tent', cls: 'lg-tent', parts: [sel([1400, 100, 1530, 215], 'white')] },
        ],
        parts: [sel([1500, 100, 1830, 215], 'mid'), sel([1550, 120, 1800, 205], 'white')],
      },
    ],
  },
  compass: {
    trace: 'compass',
    name: 'Kompas',
    collapsedW: 650,
    clips: { needle: { circle: [1498, 299.5, 93] }, ring: { notCircle: [1498, 299.5, 93] } },
    groups: [
      { k: 't', r: 'letter', fx: -40, parts: [sel([0, 60, 268, 470], 'ink')] },
      { k: 'a', r: 'letter', fx: -40, parts: [sel([268, 140, 570, 470], 'ink')] },
      { k: 's', r: 'letter', fx: -40, parts: [sel([570, 140, 810, 470], 'ink')] },
      { k: 'i', r: 'letter', fx: -40, parts: [sel([810, 60, 920, 470], 'ink')] },
      { k: 'm', r: 'letter', fx: -40, parts: [sel([920, 140, 1330, 470], 'ink')] },
      {
        k: 'mark',
        r: 'mark',
        cx: -1333,
        sub: [
          { k: 'ring', clip: 'ring', parts: [sel([1335, 140, 1660, 460], 'ink')], shared: [0] },
          {
            k: 'needle',
            cls: 'lg-needle',
            origin: [1498.6, 294.3],
            clip: 'needle',
            parts: [sel([1335, 140, 1660, 460], 'ink'), sel([1420, 260, 1530, 380], 'soft'), sel([1420, 260, 1530, 380], 'white')],
            shared: [0],
          },
        ],
      },
      { k: 'badge', r: 'badge', cx: -1333, parts: [sel([1550, 0, 1975, 200], 'soft'), sel([1550, 0, 1975, 200], 'ink')] },
      {
        k: 'trail',
        r: 'extra',
        sub: [
          { k: 'd1', cls: 'lg-dash', n: 0, parts: [sel([1530, 430, 1610, 493], 'soft')] },
          { k: 'd2', cls: 'lg-dash', n: 1, parts: [sel([1615, 430, 1700, 493], 'soft')] },
          { k: 'd3', cls: 'lg-dash', n: 2, parts: [sel([1700, 390, 1775, 450], 'soft')] },
          { k: 'd4', cls: 'lg-dash', n: 3, parts: [sel([1770, 335, 1840, 400], 'soft')] },
          { k: 'dot', cls: 'lg-dash', n: 4, parts: [sel([1840, 290, 1920, 370], 'ink')] },
        ],
      },
    ],
  },
  compass2: {
    trace: 'compass2',
    name: 'Kompas guli',
    collapsedW: 760,
    clips: { badge: [1560, 0, 1912, 128], rest: { not: [1560, 0, 1912, 128] } },
    groups: [
      {
        k: 'mark',
        r: 'mark',
        sub: [
          { k: 'rose', parts: [sel([0, 0, 425, 467], 'ink'), sel([300, 280, 400, 340], 'soft')], except: [sel([140, 180, 290, 330], 'ink')] },
          {
            k: 'needle',
            cls: 'lg-needle',
            origin: [212, 254],
            parts: [sel([140, 180, 290, 330], 'ink'), sel([140, 180, 290, 330], 'soft')],
          },
        ],
      },
      { k: 'T', r: 'letter', fx: -300, parts: [sel([423, 150, 610, 400], 'ink')] },
      { k: 'A', r: 'letter', fx: -420, parts: [sel([610, 150, 840, 400], 'ink')] },
      { k: 'S', r: 'letter', fx: -560, parts: [sel([840, 150, 990, 400], 'ink')] },
      { k: 'I', r: 'letter', fx: -660, parts: [sel([990, 150, 1100, 400], 'ink')] },
      { k: 'M', r: 'letter', fx: -820, parts: [sel([1100, 150, 1420, 400], 'ink')] },
      { k: 'bar', r: 'letter', fx: -900, clip: 'rest', parts: [sel([1490, 130, 1520, 160], 'ink'), sel([1550, 130, 1680, 145], 'soft')], shared: [0] },
      { k: 'O', r: 'letter', fx: -1000, parts: [sel([1420, 200, 1700, 420], 'ink')] },
      {
        k: 'badge',
        r: 'badge',
        cx: -1235,
        cy: 18,
        sub: [{ k: 'tab', clip: 'badge', parts: [sel([1490, 130, 1520, 160], 'ink')], shared: [0] }],
        parts: [sel([1560, 0, 1912, 128], 'soft'), sel([1600, 20, 1870, 120], 'ink')],
      },
    ],
  },
  tent: {
    trace: 'tent',
    name: 'Chodir harfi',
    collapsedW: 720,
    groups: [
      { k: 'T', r: 'letter', fx: 160, parts: [sel([0, 120, 215, 418], 'ink')] },
      {
        k: 'mark',
        r: 'mark',
        cx: -214,
        sub: [
          { k: 'A', parts: [sel([300, 120, 520, 418], 'ink')] },
          { k: 'tent', cls: 'lg-tent', origin: [407, 400], parts: [sel([290, 220, 530, 410], 'soft')] },
        ],
      },
      { k: 'S', r: 'letter', fx: -380, parts: [sel([560, 120, 830, 418], 'ink')] },
      { k: 'I', r: 'letter', fx: -560, parts: [sel([830, 120, 935, 418], 'ink')] },
      { k: 'M', r: 'letter', fx: -820, parts: [sel([935, 120, 1320, 418], 'ink')] },
      { k: 'O', r: 'letter', fx: -1150, parts: [sel([1320, 120, 1640, 418], 'ink')] },
      { k: 'badge', r: 'badge', cx: -1197, cy: 16, parts: [sel([1520, 0, 1907, 185], 'ink'), sel([1520, 0, 1907, 185], 'soft')] },
    ],
  },
};

// ───────────────────────────── qismlarni guruhlarga taqsimlash ─────────────────────────────

const center = (p) => [(p.bbox[0] + p.bbox[2]) / 2, (p.bbox[1] + p.bbox[3]) / 2];
const inside = (pt, r) => pt[0] >= r[0] && pt[0] <= r[2] && pt[1] >= r[1] && pt[1] <= r[3];
const matches = (part, s) => {
  if (s.emblem) return part.emblem === s.emblem;
  if (part.emblem) return false;
  if (s.layer && part.layer !== s.layer) return false;
  return inside(center(part), s.in);
};

function assign(name, data, groups) {
  const owner = new Map(); // part index → group key (shared bo'lmagan)
  const sharedUse = new Map(); // part index → guruhlar soni
  const build = (g, path) => {
    const key = [...path, g.k].join('.');
    const picked = [];
    (g.parts ?? []).forEach((s, si) => {
      data.parts.forEach((part, pi) => {
        if (!matches(part, s)) return;
        if ((g.except ?? []).some((e) => matches(part, e))) return;
        const shared = (g.shared ?? []).includes(si);
        if (shared) sharedUse.set(pi, (sharedUse.get(pi) ?? 0) + 1);
        else {
          if (owner.has(pi)) throw new Error(`${name}: qism ${pi} (${part.layer} ${part.bbox}) ikki guruhda: ${owner.get(pi)} va ${key}`);
          owner.set(pi, key);
        }
        if (!picked.includes(pi)) picked.push(pi);
      });
    });
    const out = { k: g.k };
    for (const field of ['r', 'cls', 'fx', 'cx', 'cy', 'w', 'n', 'clip', 'origin']) if (g[field] !== undefined) out[field] = g[field];
    if (g.hide) out.cls = [out.cls, 'lg-hide'].filter(Boolean).join(' ');
    const emblemParts = picked.filter((pi) => data.parts[pi].emblem);
    if (g.emblem) {
      const any = data.parts.find((p) => p.emblem);
      out.t = any.transform;
    }
    out.p = picked
      .filter((pi) => !emblemParts.includes(pi) || !g.emblem)
      .map((pi) => ({ l: data.parts[pi].layer, d: data.parts[pi].d, _x: (data.parts[pi].bbox[0] + data.parts[pi].bbox[2]) / 2 }));
    if (g.sub) out.sub = g.sub.map((s) => build(s, [...path, g.k]));
    if (!out.p.length && !out.sub?.length) throw new Error(`${name}: «${key}» guruhiga qism tushmadi`);
    return out;
  };
  const result = groups.map((g) => build(g, []));
  data.parts.forEach((part, pi) => {
    if (!owner.has(pi) && !sharedUse.has(pi)) throw new Error(`${name}: qism ${pi} (${part.layer} ${part.bbox} area ${part.area}) hech bir guruhga tushmadi`);
    if (sharedUse.has(pi) && owner.has(pi)) throw new Error(`${name}: qism ${pi} ham bo'lingan, ham alohida guruhda`);
    if (sharedUse.has(pi) && sharedUse.get(pi) < 2) throw new Error(`${name}: bo'lingan qism ${pi} faqat bitta guruhda`);
  });
  return result;
}

function clipPath(spec, w, h) {
  const rect = (r) => `M${r[0]} ${r[1]}H${r[2]}V${r[3]}H${r[0]}Z`;
  const circle = ([cx, cy, r]) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
  if (Array.isArray(spec)) return { d: rect(spec) };
  if (spec.not) return { d: rect([-200, -200, w + 200, h + 200]) + rect(spec.not), evenodd: true };
  if (spec.circle) return { d: circle(spec.circle) };
  if (spec.notCircle) return { d: rect([-200, -200, w + 200, h + 200]) + circle(spec.notCircle), evenodd: true };
  const capsule = ([x0, y0, x1, y1]) => {
    const r = (y1 - y0) / 2;
    return `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
  };
  if (spec.capsule) return { d: capsule(spec.capsule) };
  if (spec.rectMinusCapsule) return { d: rect(spec.rectMinusCapsule[0]) + capsule(spec.rectMinusCapsule[1]), evenodd: true };
  const poly = (pts) => `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
  if (spec.poly) return { d: poly(spec.poly) };
  if (spec.rectMinusPoly) return { d: rect(spec.rectMinusPoly[0]) + poly(spec.rectMinusPoly[1]), evenodd: true };
  throw new Error('clip: noma\'lum shakl');
}

// Harflar navbati: i — chapdan o'ngga tartib (intro animatsiyasi), d — belgiga yaqinligi (yig'ilishda yaqini birinchi)
function stagger(groups) {
  const xs = (g) => {
    const all = [...g.p.map((p) => p._x), ...(g.sub ?? []).flatMap((s) => s.p.map((p) => p._x))].filter((v) => v !== undefined);
    return all.reduce((a, b) => a + b, 0) / Math.max(1, all.length);
  };
  const letters = groups.filter((g) => g.r === 'letter');
  const mark = groups.find((g) => g.r === 'mark');
  const markX = mark ? xs(mark) : 0;
  [...letters].sort((a, b) => xs(a) - xs(b)).forEach((g, i) => {
    g.i = i;
  });
  [...letters].sort((a, b) => Math.abs(xs(a) - markX) - Math.abs(xs(b) - markX)).forEach((g, d) => {
    g.d = d;
  });
  const strip = (gs) =>
    gs.forEach((g) => {
      g.p.forEach((p) => delete p._x);
      if (g.sub) strip(g.sub);
    });
  strip(groups);
  return groups;
}

// ───────────────────────────── chiqish ─────────────────────────────

const art = {};
for (const [id, cfg] of Object.entries(CONFIG)) {
  const data = JSON.parse(readFileSync(join(TRACE, `${cfg.trace}.json`), 'utf8'));
  const groups = stagger(assign(id, data, cfg.groups));
  // Yig'ilgan holat: yorliq (PLUS) kattalashib, logotip balandligining `fill` qismini egallaydi va chap chetga o'tadi
  let collapsedW = cfg.collapsedW;
  cfg.groups.forEach((gc, gi) => {
    if (!gc.collapse) return;
    const g = groups[gi];
    const boxes = data.parts.filter((p) => (gc.parts ?? []).some((s) => matches(p, s))).map((p) => p.bbox);
    const [x0, y0, x1, y1] = gc.collapse.box ?? [
      Math.min(...boxes.map((b) => b[0])),
      Math.min(...boxes.map((b) => b[1])),
      Math.max(...boxes.map((b) => b[2])),
      Math.max(...boxes.map((b) => b[3])),
    ];
    const bw = x1 - x0;
    const bh = y1 - y0;
    const scale = (gc.collapse.fill * data.height) / bh;
    const cxm = (x0 + x1) / 2;
    const cym = (y0 + y1) / 2;
    g.origin = [round1(cxm), round1(cym)];
    g.cs = Math.round(scale * 1000) / 1000;
    g.cx = round1(gc.collapse.pad - (cxm - (scale * bw) / 2));
    g.cy = round1(data.height / 2 - cym);
    collapsedW = Math.round(scale * bw + 2 * gc.collapse.pad);
  });
  const clips = Object.fromEntries(Object.entries(cfg.clips ?? {}).map(([k, spec]) => [k, clipPath(spec, data.width, data.height)]));
  art[id] = {
    name: cfg.name,
    w: data.width,
    h: data.height,
    ...(cfg.dark ? { dark: true } : {}),
    collapsedW,
    letters: groups.filter((g) => g.r === 'letter').length,
    ...(data.gradient ? { gradient: roundGradient(data.gradient) } : {}),
    clips,
    groups,
  };
  const count = (gs) => gs.reduce((n, g) => n + g.p.length + (g.sub ? count(g.sub) : 0), 0);
  console.log(`${id}: ${data.width}×${data.height}, guruhlar ${groups.map((g) => g.k).join(' ')}, yo'llar ${count(groups)}`);
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function roundGradient(g) {
  const r = (v) => Math.round(v * 10) / 10;
  return { x1: r(g.x1), y1: r(g.y1), x2: r(g.x2), y2: r(g.y2), c1: g.c1, c2: g.c2 };
}

const ts = `/* AUTO-GENERATED: node scripts/gen-logos.mjs — qo'lda tahrirlamang.
 * Manba: branding/*.png (+ Brand Guidelines PDF dagi rasmiy logotip) → scripts/trace-logos.py → scripts/.trace/*.json.
 * Guruh rollari: letter (skrollda so'nib yig'iladi), mark (qoladi, chapga suriladi), badge (PLUS), extra (bezak). */

export type ArtLayer = 'ink' | 'soft' | 'mid' | 'white' | 'plate';

export interface ArtPath {
  /** Qatlam — rang CSS o'zgaruvchisidan (ohangga qarab almashadi) */
  l: ArtLayer;
  d: string;
}

export interface ArtGroup {
  k: string;
  r?: 'letter' | 'mark' | 'badge' | 'extra';
  /** Imzo animatsiyasi klassi: lg-needle, lg-wing, lg-tent … */
  cls?: string;
  /** Harflar navbati (chapdan o'ngga) */
  i?: number;
  /** Belgiga yaqinlik tartibi (0 — eng yaqin): yig'ilishda yaqini birinchi so'nadi */
  d?: number;
  /** Yig'ilganda harf siljishi (viewBox birligida) */
  fx?: number;
  /** Yig'ilganda belgi/yorliq siljishi */
  cx?: number;
  cy?: number;
  /** Yig'ilganda masshtab (yorliq kattalashadi) */
  cs?: number;
  /** Qanot tartibi / iz bo'lagi tartibi */
  w?: number;
  n?: number;
  /** Kesish maydoni (clips kaliti) */
  clip?: string;
  /** Aylanish markazi (viewBox birligida) */
  origin?: [number, number];
  /** Ichki yo'llar uchun transform atributi (rasmiy emblema) */
  t?: string;
  p: ArtPath[];
  sub?: ArtGroup[];
}

export interface LogoArt {
  name: string;
  w: number;
  h: number;
  /** Oq logotip: och fonda to'q plashka ichida ko'rsatiladi (brend: oq logotipni oq/och fonga qo'ymang) */
  dark?: boolean;
  /** Yig'ilgan holatdagi ko'rinadigan kenglik */
  collapsedW: number;
  letters: number;
  gradient?: { x1: number; y1: number; x2: number; y2: number; c1: string; c2: string };
  clips: Record<string, { d: string; evenodd?: boolean }>;
  groups: ArtGroup[];
}

export const ART_LOGO_IDS = ${JSON.stringify(Object.keys(art))} as const;
export type ArtLogoId = (typeof ART_LOGO_IDS)[number];

export const ART_COLORS = ${JSON.stringify(COLORS)} as const;

export const LOGO_ART: Record<ArtLogoId, LogoArt> = ${JSON.stringify(art)};
`;
writeFileSync(join(root, 'src', 'components', 'logo', 'logo-art.ts'), ts);

// ───────────────────────────── mustaqil animatsiyali SVG ─────────────────────────────

const ANIM_CSS = `
.lg-g{transform-box:fill-box;transform-origin:center}
.lg-letter{animation:lg-in-letter .8s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(.15s + var(--i,0) * 70ms)}
.lg-mark{animation:lg-in-mark .9s cubic-bezier(.22,1,.36,1) both}
.lg-badge{animation:lg-in-badge .7s cubic-bezier(.34,1.56,.64,1) both;animation-delay:.75s}
.lg-extra{animation:lg-fade .5s linear both;animation-delay:1s}
.lg-dash{animation:lg-fade .35s linear both;animation-delay:calc(1s + var(--n,0) * 110ms)}
.lg-needle{transform-box:view-box;transform-origin:var(--ox) var(--oy);animation:lg-needle 1.8s cubic-bezier(.22,1,.36,1) .35s both}
.lg-wing{transform-origin:0% 100%;animation:lg-flap .8s cubic-bezier(.7,0,.2,1) both;animation-delay:calc(.6s + var(--w,0) * 80ms)}
.lg-ring{animation:lg-turn 1s cubic-bezier(.7,0,.2,1) .45s both}
.lg-head{transform-origin:100% 100%;animation:lg-nod .8s cubic-bezier(.7,0,.2,1) .7s both}
.lg-tent{transform-box:view-box;transform-origin:var(--ox,50%) var(--oy,100%);animation:lg-tent .9s cubic-bezier(.34,1.56,.64,1) .8s both}
.lg-pill{animation:lg-pop .6s cubic-bezier(.34,1.56,.64,1) 1s both}
@keyframes lg-in-letter{from{opacity:0;transform:translateY(22%)}}
@keyframes lg-in-mark{from{opacity:0;transform:scale(.86)}}
@keyframes lg-in-badge{0%{opacity:0;transform:translateY(-24%) scale(.9)}100%{opacity:1;transform:none}}
@keyframes lg-fade{from{opacity:0}}
@keyframes lg-needle{0%{transform:rotate(-200deg)}70%{transform:rotate(14deg)}100%{transform:rotate(0)}}
@keyframes lg-flap{0%,100%{transform:none}45%{transform:rotate(-10deg) translateY(-2%)}}
@keyframes lg-turn{0%,100%{transform:none}45%{transform:rotate(-14deg)}}
@keyframes lg-nod{0%,100%{transform:none}40%{transform:translate(4%,-14%) rotate(-8deg)}}
@keyframes lg-tent{from{transform:scaleY(.2);opacity:0}}
@keyframes lg-pop{0%{transform:scale(.8);opacity:0}100%{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

function svgGroup(g, a, uid) {
  const style = [];
  for (const [field, v] of Object.entries({ i: g.i, n: g.n, w: g.w, d: g.d })) if (v !== undefined) style.push(`--${field}:${v}`);
  if (g.origin) style.push(`--ox:${g.origin[0]}px`, `--oy:${g.origin[1]}px`);
  const cls = ['lg-g', g.r && `lg-${g.r}`, g.cls].filter(Boolean).join(' ');
  const attrs = [`class="${cls}"`];
  if (style.length) attrs.push(`style="${style.join(';')}"`);
  if (g.clip) attrs.push(`clip-path="url(#${uid}-${g.clip})"`);
  const fill = (l) => (l === 'plate' ? `url(#${uid}-g)` : COLORS[l]);
  const paths = g.p.map((p) => `<path fill="${fill(p.l)}" fill-rule="evenodd" d="${p.d}"/>`).join('');
  const sub = (g.sub ?? []).map((s) => svgGroup(s, a, uid)).join('');
  const inner = g.t ? `<g transform="${g.t}">${paths}${sub}</g>` : paths + sub;
  return `<g ${attrs.join(' ')}>${inner}</g>`;
}

mkdirSync(join(root, 'branding', 'svg', 'animated'), { recursive: true });
for (const [id, a] of Object.entries(art)) {
  const uid = `tp-${id}`;
  const defs = [];
  if (a.gradient) {
    const g = a.gradient;
    defs.push(
      `<linearGradient id="${uid}-g" gradientUnits="userSpaceOnUse" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}"><stop offset="0" stop-color="${g.c1}"/><stop offset="1" stop-color="${g.c2}"/></linearGradient>`,
    );
  }
  for (const [k, c] of Object.entries(a.clips)) {
    defs.push(`<clipPath id="${uid}-${k}" clipPathUnits="userSpaceOnUse"><path d="${c.d}"${c.evenodd ? ' clip-rule="evenodd"' : ''}/></clipPath>`);
  }
  const body = a.groups.map((g) => svgGroup(g, a, uid)).join('');
  const bg = a.dark ? `<rect x="-60" y="-60" width="${a.w + 120}" height="${a.h + 120}" fill="#122C46"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${a.dark ? `-60 -60 ${a.w + 120} ${a.h + 120}` : `0 0 ${a.w} ${a.h}`}" width="${a.w + (a.dark ? 120 : 0)}" height="${a.h + (a.dark ? 120 : 0)}" role="img" aria-label="TASIMO Plus — ${a.name}"><title>TASIMO Plus</title><style>${ANIM_CSS}</style><defs>${defs.join('')}</defs>${bg}${body}</svg>`;
  writeFileSync(join(root, 'branding', 'svg', 'animated', `tasimo-plus-${id}.svg`), svg);
}
console.log('logo-art.ts va branding/svg/animated/*.svg yozildi');
