/**
 * Matn formatlash (qalin, kursiv, tagiga chizilgan, rang, gradient) — hujjatda oddiy string ichida qattiq cheklangan
 * belgilar sifatida saqlanadi: <b> <i> <u> <span data-c="#rrggbb"> <span data-g="#rrggbb,#rrggbb">.
 * Boshqa hech narsa teg emas — «x < 5» kabi oddiy matn o'zgarishsiz qoladi (eski hujjatlar ham shu).
 * Sayt bu belgilarni o'z parseri bilan React elementlariga aylantiradi (innerHTML yo'q), alt/SEO uchun — plainText().
 */

export interface Marks {
  b?: true;
  i?: true;
  u?: true;
  /** Rang: #rrggbb */
  c?: string;
  /** Gradient: "#rrggbb,#rrggbb" (chapdan o'ngga) */
  g?: string;
}

export type Run = Marks & { text: string };

export type RichOp =
  | { type: 'toggle'; mark: 'b' | 'i' | 'u' }
  | { type: 'color'; value: string | null }
  | { type: 'gradient'; value: string | null }
  /** «Oddiy»: qalin, kursiv, tagiga chizilgan olib tashlanadi (rang qoladi) */
  | { type: 'regular' }
  /** Hamma formatlash olib tashlanadi */
  | { type: 'clear' };

const HEX = /^#[0-9a-fA-F]{6}$/;
const GRADIENT = /^#[0-9a-fA-F]{6},#[0-9a-fA-F]{6}$/;

export const isSafeColor = (value: string | undefined | null): value is string => typeof value === 'string' && HEX.test(value);
export const isSafeGradient = (value: string | undefined | null): value is string => typeof value === 'string' && GRADIENT.test(value);

/** Muharrir palitrasi: avval brend ranglari (Brand Guidelines 09/24), so'ng qo'shimcha sokin ranglar */
export const RICH_COLORS: { value: string; label: string }[] = [
  { value: '#122c46', label: 'Siyoh (brend matni)' },
  { value: '#0a62b3', label: 'PLUS BLUE' },
  { value: '#cee4f8', label: 'PLUS LIGHT (to‘q fonga)' },
  { value: '#3a86d0', label: 'Och ko‘k' },
  { value: '#a8792b', label: 'Oltin' },
  { value: '#b4505a', label: 'Gilos' },
  { value: '#4f7a3a', label: 'Yashil' },
  { value: '#64748b', label: 'Kulrang' },
  { value: '#ffffff', label: 'Oq' },
];

/** Birinchisi — brend gradienti (#0A62B3 → #CEE4F8); brend uni asosan yordamchi grafika uchun tavsiya qiladi */
export const RICH_GRADIENTS: { value: string; label: string }[] = [
  { value: '#0a62b3,#cee4f8', label: 'Brend (PLUS)' },
  { value: '#122c46,#0a62b3', label: 'Okean' },
  { value: '#0a62b3,#7c5cff', label: 'Shom' },
  { value: '#1f9d7a,#0a62b3', label: 'Dengiz' },
  { value: '#a8792b,#e0b354', label: 'Oltin' },
  { value: '#cee4f8,#ffffff', label: 'Tong (to‘q fonga)' },
];

const ENTITY: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"' };
const decode = (text: string) => text.replace(/&(lt|gt|amp|quot);/g, (entity) => ENTITY[entity] ?? entity);
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Faqat ruxsat etilgan teglar; qolgan «<» — oddiy belgi */
const TOKEN = /<(\/?)(b|i|u)>|<span data-(c|g)="([^"<>]{1,40})">|<\/span>/g;

const sameMarks = (a: Marks, b: Marks) => a.b === b.b && a.i === b.i && a.u === b.u && a.c === b.c && a.g === b.g;
const marksOf = (run: Run): Marks => {
  const out: Marks = {};
  if (run.b) out.b = true;
  if (run.i) out.i = true;
  if (run.u) out.u = true;
  if (run.c) out.c = run.c;
  if (run.g) out.g = run.g;
  return out;
};

/** Belgilangan matn → bo'laklar (har biri o'z belgilari bilan) */
export function parseRich(markup: string): Run[] {
  const runs: Run[] = [];
  const stack: { tag: 'b' | 'i' | 'u' | 'span'; marks: Marks }[] = [];
  const current = (): Marks => (stack.length ? stack[stack.length - 1].marks : {});
  const push = (text: string) => {
    if (!text) return;
    const marks = current();
    const last = runs[runs.length - 1];
    if (last && sameMarks(marksOf(last), marks)) last.text += text;
    else runs.push({ ...marks, text });
  };

  let index = 0;
  TOKEN.lastIndex = 0;
  for (let match = TOKEN.exec(markup); match; match = TOKEN.exec(markup)) {
    push(decode(markup.slice(index, match.index)));
    index = match.index + match[0].length;
    const [, closing, tag, kind, value] = match;
    if (tag) {
      if (closing) {
        // Yopuvchi teg — eng yaqin mosini topib yopamiz (noto'g'ri tartib bo'lsa ham buzilmaydi)
        const at = stack.map((entry) => entry.tag).lastIndexOf(tag as 'b' | 'i' | 'u');
        if (at >= 0) stack.splice(at);
      } else {
        stack.push({ tag: tag as 'b' | 'i' | 'u', marks: { ...current(), [tag]: true } });
      }
    } else if (kind) {
      const marks: Marks = { ...current() };
      if (kind === 'c' && isSafeColor(value)) {
        marks.c = value;
        delete marks.g;
      } else if (kind === 'g' && isSafeGradient(value)) {
        marks.g = value;
        delete marks.c;
      }
      stack.push({ tag: 'span', marks });
    } else {
      const at = stack.map((entry) => entry.tag).lastIndexOf('span');
      if (at >= 0) stack.splice(at);
    }
  }
  push(decode(markup.slice(index)));
  return runs;
}

/** Bo'laklar → belgilangan matn (qo'shni bir xil bo'laklar birlashadi, tartib: span > b > i > u) */
export function serializeRich(runs: Run[]): string {
  const merged: Run[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const last = merged[merged.length - 1];
    if (last && sameMarks(marksOf(last), marksOf(run))) last.text += run.text;
    else merged.push({ ...run });
  }
  return merged
    .map((run) => {
      let out = escape(run.text);
      if (run.u) out = `<u>${out}</u>`;
      if (run.i) out = `<i>${out}</i>`;
      if (run.b) out = `<b>${out}</b>`;
      if (run.g && isSafeGradient(run.g)) out = `<span data-g="${run.g}">${out}</span>`;
      else if (run.c && isSafeColor(run.c)) out = `<span data-c="${run.c}">${out}</span>`;
      return out;
    })
    .join('');
}

/** Toza matn (alt, aria, SEO, JSON-LD, muharrir ro'yxatlari) */
export function plainText(markup: string | undefined | null): string {
  if (!markup) return '';
  return parseRich(markup)
    .map((run) => run.text)
    .join('');
}

export const hasMarks = (markup: string | undefined | null): boolean =>
  Boolean(markup) && parseRich(markup as string).some((run) => run.b || run.i || run.u || run.c || run.g);

/** [start, end) oralig'iga amal: belgini almashtirish, rang, gradient yoki tozalash */
export function applyRich(runs: Run[], start: number, end: number, op: RichOp): Run[] {
  if (end <= start) return runs;
  // Chegaralarda bo'lib chiqamiz
  const split: Run[] = [];
  let pos = 0;
  for (const run of runs) {
    const from = pos;
    const to = pos + run.text.length;
    pos = to;
    const cuts = [from, Math.max(from, Math.min(start, to)), Math.max(from, Math.min(end, to)), to];
    for (let k = 0; k < 3; k++) {
      const a = cuts[k] - from;
      const b = cuts[k + 1] - from;
      if (b > a) split.push({ ...run, text: run.text.slice(a, b) });
    }
  }
  // Oraliqdagi bo'laklar
  let offset = 0;
  const inRange: boolean[] = split.map((run) => {
    const a = offset;
    offset += run.text.length;
    return a >= start && a + run.text.length <= end;
  });
  const targets = split.filter((_, k) => inRange[k]);
  const allHave = op.type === 'toggle' && targets.length > 0 && targets.every((run) => run[op.mark]);

  return split.map((run, k) => {
    if (!inRange[k]) return run;
    const next: Run = { ...run };
    if (op.type === 'toggle') {
      if (allHave) delete next[op.mark];
      else next[op.mark] = true;
    } else if (op.type === 'color') {
      delete next.g;
      if (op.value && isSafeColor(op.value)) next.c = op.value;
      else delete next.c;
    } else if (op.type === 'gradient') {
      delete next.c;
      if (op.value && isSafeGradient(op.value)) next.g = op.value;
      else delete next.g;
    } else if (op.type === 'regular') {
      delete next.b;
      delete next.i;
      delete next.u;
    } else {
      return { text: run.text };
    }
    return next;
  });
}

/** Oraliqdagi umumiy belgilar (asboblar panelida faol tugmalar) */
export function marksInRange(
  runs: Run[],
  start: number,
  end: number,
): { b: boolean; i: boolean; u: boolean; regular: boolean; c: string | null; g: string | null } {
  let pos = 0;
  const hits: Run[] = [];
  for (const run of runs) {
    const from = pos;
    pos += run.text.length;
    if (pos > start && from < end) hits.push(run);
  }
  const all = (key: 'b' | 'i' | 'u') => hits.length > 0 && hits.every((run) => run[key]);
  const same = (key: 'c' | 'g') => (hits.length > 0 && hits.every((run) => run[key] === hits[0][key]) ? (hits[0][key] ?? null) : null);
  const regular = hits.every((run) => !run.b && !run.i && !run.u);
  return { b: all('b'), i: all('i'), u: all('u'), regular, c: same('c'), g: same('g') };
}

/** Bir xil ko'rinishdagi yozuv (taqqoslash uchun): «Q&A» → «Q&amp;A» */
export const normalizeRich = (markup: string): string => serializeRich(parseRich(markup));

/** pos'dagi belgining formatlari (forward=false — undan oldingi belgi: kursor yozishni shu formatda davom ettiradi) */
export function marksAt(runs: Run[], pos: number, forward: boolean): Marks {
  const target = forward ? pos : Math.max(0, pos - 1);
  let from = 0;
  for (const run of runs) {
    const to = from + run.text.length;
    if (target >= from && target < to) return marksOf(run);
    from = to;
  }
  return runs.length ? marksOf(runs[runs.length - 1]) : {};
}

/**
 * [start, end) o'rniga matn qo'yish. Yangi matn formati — almashtirilgan qismning birinchi belgisidan
 * (bo'sh oraliqda — oldingi belgidan): belgilangan rangli so'z ustidan yozilsa ham rang saqlanadi.
 */
export function replaceRange(runs: Run[], start: number, end: number, text: string, marks?: Marks): Run[] {
  const inherit = marks ?? marksAt(runs, start, end > start);
  const out: Run[] = [];
  let inserted = false;
  const insert = () => {
    if (!inserted && text) out.push({ ...inherit, text });
    inserted = true;
  };
  let from = 0;
  for (const run of runs) {
    const to = from + run.text.length;
    if (to <= start) {
      out.push(run);
    } else if (from >= end) {
      insert();
      out.push(run);
    } else {
      if (from < start) out.push({ ...run, text: run.text.slice(0, start - from) });
      insert();
      if (to > end) out.push({ ...run, text: run.text.slice(end - from) });
    }
    from = to;
  }
  insert();
  return out;
}

/**
 * Oddiy matn maydonidagi tahrir (o'ng panel) — formatlash saqlanadi: o'zgargan qism (umumiy bosh va oxirdan
 * keyingi joy) topiladi va faqat o'sha almashtiriladi.
 */
export function editPlain(markup: string, next: string): string {
  const runs = parseRich(markup);
  const prev = runs.map((run) => run.text).join('');
  if (prev === next) return markup;
  const max = Math.min(prev.length, next.length);
  let a = 0;
  while (a < max && prev[a] === next[a]) a++;
  let b = 0;
  while (b < max - a && prev[prev.length - 1 - b] === next[next.length - 1 - b]) b++;
  return serializeRich(replaceRange(runs, a, prev.length - b, next.slice(a, next.length - b)));
}

/** Muharrir (contentEditable) uchun HTML — saytdagi ko'rinish bilan bir xil klass/stil */
export function richToHtml(markup: string): string {
  const runs = parseRich(markup);
  const lines: string[][] = [[]];
  for (const run of runs) {
    run.text.split('\n').forEach((part, k) => {
      if (k > 0) lines.push([]);
      if (!part) return;
      let out = escape(part);
      if (run.u) out = `<u>${out}</u>`;
      if (run.i) out = `<em>${out}</em>`;
      if (run.b) out = `<strong>${out}</strong>`;
      if (run.g && isSafeGradient(run.g)) {
        const [g1, g2] = run.g.split(',');
        out = `<span data-g="${run.g}" class="rt-grad" style="--g1:${g1};--g2:${g2}">${out}</span>`;
      } else if (run.c && isSafeColor(run.c)) {
        out = `<span data-c="${run.c}" style="color:${run.c}">${out}</span>`;
      }
      lines[lines.length - 1].push(out);
    });
  }
  return lines.map((parts, k) => `<span>${parts.join('')}${k < lines.length - 1 ? '<br>' : ''}</span>`).join('');
}
