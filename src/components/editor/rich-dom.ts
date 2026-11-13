import { applyRich, isSafeColor, isSafeGradient, parseRich, replaceRange, richToHtml, serializeRich, type Marks, type RichOp, type Run } from '@/lib/doc/rich';

/**
 * Muharrir: contentEditable DOM ↔ belgilangan matn va belgilash (selection) o'rni.
 * O'rin — belgilar soni bo'yicha (BR = 1 belgi «\n»), domToRich bilan bir xil sanaladi.
 * Formatlash amallari DOM'ni qayta chizadi — brauzerning o'z «orqaga»si ularni bilmaydi, shuning uchun har element
 * uchun kichik tarix (undoFormat / redoFormat) shu yerda.
 */

const NBSP = String.fromCharCode(160);

/** contentEditable → belgilangan matn. Ruxsatsiz teglar (brauzer qo'shgani) tashlanadi, matni qoladi */
export function domToRich(root: HTMLElement): string {
  const runs: Run[] = [];
  const walk = (node: Node, marks: Marks) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.nodeValue ?? '').split(NBSP).join(' ').replace(/\r/g, '');
      if (text) runs.push({ ...marks, text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (tag === 'BR') {
      runs.push({ ...marks, text: '\n' });
      return;
    }
    const next: Marks = { ...marks };
    if (tag === 'B' || tag === 'STRONG') next.b = true;
    else if (tag === 'I' || tag === 'EM') next.i = true;
    else if (tag === 'U') next.u = true;
    const gradient = el.getAttribute('data-g');
    const color = el.getAttribute('data-c');
    if (isSafeGradient(gradient)) {
      next.g = gradient;
      delete next.c;
    } else if (isSafeColor(color)) {
      next.c = color;
      delete next.g;
    }
    // Ba'zi brauzerlar Enter'da <div> qo'shadi — yangi qator
    if ((tag === 'DIV' || tag === 'P') && runs.length && !runs[runs.length - 1].text.endsWith('\n')) runs.push({ text: '\n' });
    el.childNodes.forEach((child) => walk(child, next));
  };
  root.childNodes.forEach((child) => walk(child, {}));
  // contentEditable oxiriga qo'yadigan bo'sh qator — matnga kirmaydi
  const last = runs[runs.length - 1];
  if (last?.text.endsWith('\n')) last.text = last.text.slice(0, -1);
  return serializeRich(runs);
}

const ALLOWED_TAGS = new Set(['SPAN', 'STRONG', 'EM', 'U', 'BR']);

function isForeign(el: Element): boolean {
  if (!ALLOWED_TAGS.has(el.tagName)) return true;
  const names = el.getAttributeNames();
  if (el.tagName !== 'SPAN') return names.length > 0;
  if (!names.length) return false;
  if (el.hasAttribute('data-g')) return !isSafeGradient(el.getAttribute('data-g')) || names.some((name) => name !== 'data-g' && name !== 'class' && name !== 'style');
  if (el.hasAttribute('data-c')) return !isSafeColor(el.getAttribute('data-c')) || names.some((name) => name !== 'data-c' && name !== 'style');
  return true;
}

/**
 * Brauzer o'zicha qo'shgan belgilar bormi (<font>, style'li span, <div> …). Masalan, gradientli so'zni o'chirib
 * yozilganda Chrome «yozish uslubi»ni (shaffof rang) saqlab qoladi — matn ko'rinmay qolardi.
 */
export function hasForeignMarkup(root: HTMLElement): boolean {
  for (const el of root.querySelectorAll('*')) if (isForeign(el)) return true;
  return false;
}

function nodeLength(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue?.length ?? 0;
  if (node.nodeName === 'BR') return 1;
  let total = 0;
  node.childNodes.forEach((child) => {
    total += nodeLength(child);
  });
  return total;
}

function offsetOf(root: Node, container: Node, offset: number): number {
  if (container === root) {
    let total = 0;
    for (let k = 0; k < offset && k < root.childNodes.length; k++) total += nodeLength(root.childNodes[k]);
    return total;
  }
  let total = 0;
  let found = false;
  const visit = (node: Node) => {
    if (found) return;
    if (node === container) {
      if (node.nodeType === Node.TEXT_NODE) total += offset;
      else for (let k = 0; k < offset && k < node.childNodes.length; k++) total += nodeLength(node.childNodes[k]);
      found = true;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      total += node.nodeValue?.length ?? 0;
      return;
    }
    if (node.nodeName === 'BR') {
      total += 1;
      return;
    }
    node.childNodes.forEach(visit);
  };
  root.childNodes.forEach(visit);
  return total;
}

/** Joriy belgilash shu element ichida bo'lsa — boshlanish va tugash o'rni */
export function getSelectionOffsets(root: HTMLElement): { start: number; end: number } | null {
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const a = offsetOf(root, range.startContainer, range.startOffset);
  const b = offsetOf(root, range.endContainer, range.endOffset);
  return { start: Math.min(a, b), end: Math.max(a, b) };
}

function locate(root: Node, target: number): { node: Node; offset: number } {
  let remaining = target;
  let result: { node: Node; offset: number } | null = null;
  const visit = (node: Node) => {
    if (result) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.nodeValue?.length ?? 0;
      if (remaining <= length) {
        result = { node, offset: remaining };
        return;
      }
      remaining -= length;
      return;
    }
    if (node.nodeName === 'BR') {
      if (remaining === 0 && node.parentNode) {
        result = { node: node.parentNode, offset: Array.prototype.indexOf.call(node.parentNode.childNodes, node) };
        return;
      }
      remaining -= 1;
      return;
    }
    node.childNodes.forEach(visit);
  };
  root.childNodes.forEach(visit);
  return result ?? { node: root, offset: root.childNodes.length };
}

export function rangeFromOffsets(root: HTMLElement, start: number, end: number): Range {
  const a = locate(root, start);
  const b = locate(root, end);
  const range = document.createRange();
  range.setStart(a.node, a.offset);
  range.setEnd(b.node, b.offset);
  return range;
}

export function setSelectionOffsets(root: HTMLElement, start: number, end: number): void {
  const selection = document.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(rangeFromOffsets(root, start, end));
}

/** Brauzer qo'shgan ortiqcha belgilarni tozalab, qayta chizish (kursor o'z joyida qoladi) */
export function normalizeElement(el: HTMLElement): void {
  const selection = document.activeElement === el ? getSelectionOffsets(el) : null;
  el.innerHTML = richToHtml(domToRich(el));
  if (selection) setSelectionOffsets(el, selection.start, selection.end);
}

// ── Formatlash tarixi (element bo'yicha) ──

interface Step {
  before: string;
  after: string;
  undoSel: [number, number];
  redoSel: [number, number];
  key?: string;
}

const histories = new WeakMap<HTMLElement, { undo: Step[]; redo: Step[] }>();

function historyOf(el: HTMLElement) {
  let history = histories.get(el);
  if (!history) {
    history = { undo: [], redo: [] };
    histories.set(el, history);
  }
  return history;
}

function record(el: HTMLElement, step: Step) {
  const history = historyOf(el);
  history.redo.length = 0;
  const top = history.undo[history.undo.length - 1];
  // Bir xil amalning ketma-ket takrori (rang tanlagichini surish) — bitta qadam
  if (step.key && top?.key === step.key && top.after === step.before) {
    top.after = step.after;
    top.redoSel = step.redoSel;
    return;
  }
  history.undo.push(step);
  if (history.undo.length > 60) history.undo.shift();
}

/** DOM'ni yangi matn bilan chizish va InlineText saqlashi uchun «input» hodisasi */
function render(el: HTMLElement, markup: string, selection: [number, number], focus: boolean) {
  el.innerHTML = richToHtml(markup);
  if (focus) el.focus({ preventScroll: true });
  if (focus || document.activeElement === el) setSelectionOffsets(el, selection[0], selection[1]);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Formatlash amali [start, end) ga. focus=false — rang tanlagichi ochiq turganda (fokusni tortib olmaymiz).
 * key — ketma-ket bir xil amallar tarixda bitta qadam bo'lsin.
 */
export function applyRichToElement(el: HTMLElement, start: number, end: number, op: RichOp, opts: { focus?: boolean; key?: string } = {}): boolean {
  const before = domToRich(el);
  const after = serializeRich(applyRich(parseRich(before), start, end, op));
  if (after === before) return false;
  render(el, after, [start, end], opts.focus ?? true);
  record(el, { before, after, undoSel: [start, end], redoSel: [start, end], key: opts.key });
  return true;
}

/**
 * Belgilangan matn o'rniga yozish/o'chirish (biz bajaramiz — brauzer formatni «shaffof rang» bilan buzmasin).
 * Yangi matn almashtirilgan qismning formatini oladi.
 */
export function replaceSelection(el: HTMLElement, text: string): boolean {
  const selection = getSelectionOffsets(el);
  if (!selection) return false;
  const { start, end } = selection;
  const before = domToRich(el);
  const after = serializeRich(replaceRange(parseRich(before), start, end, text));
  const caret = start + text.length;
  render(el, after, [caret, caret], true);
  if (after !== before) record(el, { before, after, undoSel: [start, end], redoSel: [caret, caret] });
  return true;
}

/** Ctrl+Z: oxirgi formatlash qadami (undan keyin matn qo'lda o'zgarmagan bo'lsa) */
export function undoFormat(el: HTMLElement): boolean {
  const history = histories.get(el);
  const top = history?.undo[history.undo.length - 1];
  if (!history || !top || domToRich(el) !== top.after) return false;
  history.undo.pop();
  history.redo.push(top);
  render(el, top.before, top.undoSel, true);
  return true;
}

export function redoFormat(el: HTMLElement): boolean {
  const history = histories.get(el);
  const top = history?.redo[history.redo.length - 1];
  if (!history || !top || domToRich(el) !== top.before) return false;
  history.redo.pop();
  history.undo.push(top);
  render(el, top.after, top.redoSel, true);
  return true;
}
