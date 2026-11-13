import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyRich,
  editPlain,
  hasMarks,
  marksInRange,
  normalizeRich,
  parseRich,
  plainText,
  replaceRange,
  richToHtml,
  serializeRich,
} from '../src/lib/doc/rich';

const apply = (markup: string, start: number, end: number, op: Parameters<typeof applyRich>[3]) => serializeRich(applyRich(parseRich(markup), start, end, op));

test('rich: oddiy matn o‘zgarmaydi, «x < 5» teg emas', () => {
  assert.deepEqual(parseRich('Salom dunyo'), [{ text: 'Salom dunyo' }]);
  assert.equal(plainText('x < 5 & y > 2'), 'x < 5 & y > 2');
  assert.equal(plainText(normalizeRich('x < 5 & y > 2')), 'x < 5 & y > 2');
  assert.equal(hasMarks('x < 5'), false);
});

test('rich: belgilar → bo‘laklar → qayta yozish (aylanma)', () => {
  const markup = 'Qualify <b>online</b>. <span data-c="#2c5fd8"><i>Compete</i></span> in <span data-g="#2c5fd8,#7c5cff">Tashkent</span>.';
  const runs = parseRich(markup);
  assert.equal(plainText(markup), 'Qualify online. Compete in Tashkent.');
  assert.deepEqual(runs[1], { b: true, text: 'online' });
  assert.deepEqual(runs[3], { i: true, c: '#2c5fd8', text: 'Compete' });
  assert.deepEqual(runs[5], { g: '#2c5fd8,#7c5cff', text: 'Tashkent' });
  assert.equal(serializeRich(runs), markup);
  assert.equal(hasMarks(markup), true);
});

test('rich: qalin almashtirish — hammasi qalin bo‘lsa olib tashlanadi', () => {
  const once = apply('Hello world', 6, 11, { type: 'toggle', mark: 'b' });
  assert.equal(once, 'Hello <b>world</b>');
  assert.equal(apply(once, 6, 11, { type: 'toggle', mark: 'b' }), 'Hello world');
  // aralash oraliq: avval hammasi qalin bo'ladi
  assert.equal(apply(once, 0, 11, { type: 'toggle', mark: 'b' }), '<b>Hello world</b>');
});

test('rich: rang va gradient bir-birini almashtiradi, null — olib tashlaydi', () => {
  const colored = apply('Aa Bb', 0, 2, { type: 'color', value: '#a8792b' });
  assert.equal(colored, '<span data-c="#a8792b">Aa</span> Bb');
  const gradient = apply(colored, 0, 2, { type: 'gradient', value: '#2c5fd8,#002060' });
  assert.equal(gradient, '<span data-g="#2c5fd8,#002060">Aa</span> Bb');
  assert.equal(apply(gradient, 0, 2, { type: 'gradient', value: null }), 'Aa Bb');
  // xavfsiz bo'lmagan qiymat qabul qilinmaydi
  assert.equal(apply('Aa', 0, 2, { type: 'color', value: 'red;background:url(x)' }), 'Aa');
});

test('rich: «Oddiy» qalin/kursiv/chiziqni oladi, rang qoladi; clear — hammasini', () => {
  const markup = '<span data-c="#2c5fd8"><b><i><u>Aa</u></i></b></span>';
  assert.equal(apply(markup, 0, 2, { type: 'regular' }), '<span data-c="#2c5fd8">Aa</span>');
  assert.equal(apply(markup, 0, 2, { type: 'clear' }), 'Aa');
});

test('rich: faol belgilar (panel tugmalari)', () => {
  const runs = parseRich('<b>ab</b>cd');
  assert.deepEqual(marksInRange(runs, 0, 2), { b: true, i: false, u: false, regular: false, c: null, g: null });
  assert.equal(marksInRange(runs, 0, 4).b, false);
  assert.equal(marksInRange(runs, 2, 4).regular, true);
});

test('rich: ruxsatsiz teg va atributlar matn bo‘lib qoladi, xavfli rang o‘tmaydi', () => {
  assert.equal(plainText('<script>alert(1)</script>'), '<script>alert(1)</script>');
  const runs = parseRich('<span data-c="javascript:x">a</span><span style="color:red">b</span>');
  assert.equal(runs.some((run) => run.c), false);
  const html = richToHtml('<b>a</b> <script>x</script>');
  assert.equal(html.includes('<script>'), false);
  assert.ok(html.includes('&lt;script&gt;'));
});

test('rich: muharrir HTML — qatorlar <span>, rang/gradient klassi bilan', () => {
  assert.equal(richToHtml('a\n<b>b</b>'), '<span>a<br></span><span><strong>b</strong></span>');
  assert.ok(richToHtml('<span data-g="#2c5fd8,#7c5cff">g</span>').includes('class="rt-grad" style="--g1:#2c5fd8;--g2:#7c5cff"'));
});

test('rich: belgilangan joy ustidan yozish formatni saqlaydi', () => {
  const runs = parseRich('in <span data-g="#2c5fd8,#7c5cff">Tashkent</span>!');
  assert.equal(serializeRich(replaceRange(runs, 3, 11, 'Samarkand')), 'in <span data-g="#2c5fd8,#7c5cff">Samarkand</span>!');
  // kursor (bo'sh oraliq) — oldingi belgining formati
  assert.equal(serializeRich(replaceRange(parseRich('<b>ab</b>c'), 2, 2, 'X')), '<b>abX</b>c');
  // o'chirish
  assert.equal(serializeRich(replaceRange(parseRich('<b>ab</b>cd'), 1, 3, '')), '<b>a</b>d');
});

test('rich: o‘ng paneldagi oddiy tahrir formatni buzmaydi', () => {
  const markup = 'Compete in <b>Tashkent</b> now';
  assert.equal(editPlain(markup, 'Compete in Tashkent today'), 'Compete in <b>Tashkent</b> today');
  // so'z ichidagi tahrir — o'sha so'zning formati; bo'sh joydan keyingisi — bo'sh joyniki
  assert.equal(editPlain(markup, 'Compete in Tashkentt now'), 'Compete in <b>Tashkentt</b> now');
  assert.equal(editPlain(markup, 'Compete in Tashkent city now'), 'Compete in <b>Tashkent</b> city now');
  assert.equal(editPlain('Q&A', 'Q&A!'), 'Q&amp;A!');
  assert.equal(plainText(editPlain('a', 'a <b>b</b>')), 'a <b>b</b>');
});
