import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cloneWithNewIds, getIn, insertItem, moveItem, removeItem, setIn, setText } from '../src/lib/doc/path';
import { normalizeDoc, safeLink, safeUrl, youtubeId } from '../src/lib/doc/normalize';
import { linkKind, resolveLink } from '../src/lib/doc/links';
import { createDefaultDoc } from '../src/lib/doc/default-doc';
import { withPlusRef } from '../src/lib/doc/ref';
import { SECTION_META, createSection } from '../src/lib/doc/presets';
import { SECTION_TYPES } from '../src/lib/doc/types';

test('path: setIn o‘zgarmas — asl obyekt o‘zgarmaydi', () => {
  const doc = { sections: [{ id: 'a', title: { en: 'A', ru: 'А' } }] };
  const next = setIn(doc, ['sections', 0, 'title', 'en'], 'B');
  assert.equal(doc.sections[0].title.en, 'A');
  assert.equal(getIn(next, ['sections', 0, 'title', 'en']), 'B');
  assert.notEqual(next.sections, doc.sections);
});

test('path: setText yo‘q matnni yaratadi, move/insert/remove', () => {
  const doc = { items: [{ id: '1' }, { id: '2' }, { id: '3' }] };
  const withText = setText(doc, ['items', 0, 'title'], 'ru', 'Привет');
  assert.deepEqual(getIn(withText, ['items', 0, 'title']), { en: '', ru: 'Привет' });
  assert.deepEqual(moveItem(doc, ['items'], 0, 2).items.map((i) => i.id), ['2', '3', '1']);
  assert.deepEqual(insertItem(doc, ['items'], 1, { id: 'x' }).items.map((i) => i.id), ['1', 'x', '2', '3']);
  assert.deepEqual(removeItem(doc, ['items'], 1).items.map((i) => i.id), ['1', '3']);
});

test('path: cloneWithNewIds barcha id larni yangilaydi', () => {
  const copy = cloneWithNewIds({ id: 's', items: [{ id: 'a' }, { id: 'b' }] }, (old) => `${old}2`);
  assert.deepEqual(copy, { id: 's2', items: [{ id: 'a2' }, { id: 'b2' }] });
});

test('normalize: xavfli havola va noma’lum bo‘lim tashlanadi, standart to‘ldiriladi', () => {
  const doc = normalizeDoc({
    sections: [
      { id: 'h', type: 'hero', variant: 'orbit', items: [{ id: 'b', href: 'javascript:alert(1)', image: 'data:x' }] },
      { id: 'z', type: 'unknown' },
      { id: 'h', type: 'faq' },
    ],
  });
  assert.equal(doc.sections.length, 1);
  assert.equal(doc.sections[0].items[0].href, '');
  assert.equal(doc.sections[0].items[0].image, '');
  assert.ok(doc.ctas.register.href.startsWith('https://account.tasimo.uz'));
  assert.equal(doc.footer.socials.length > 0, true);
});

test('normalize: standart hujjat o‘zgarmasdan qaytadi; safeUrl; youtubeId', () => {
  const base = createDefaultDoc();
  const once = normalizeDoc(JSON.parse(JSON.stringify(base)));
  // Idempotent va kontent saqlanadi (normalize faqat standart maydonlarni qo'shadi: span, tall …)
  assert.deepEqual(JSON.parse(JSON.stringify(normalizeDoc(JSON.parse(JSON.stringify(once))))), JSON.parse(JSON.stringify(once)));
  assert.equal(once.sections.length, base.sections.length);
  assert.deepEqual(once.sections.map((s) => s.title), base.sections.map((s) => s.title));
  assert.deepEqual(once.sections[6].items.map((i) => [i.image, i.span, i.tall, i.shape]), base.sections[6].items.map((i) => [i.image, i.span ?? 1, i.tall ?? false, i.shape]));
  assert.equal(safeUrl('#faq'), '#faq');
  assert.equal(safeUrl('#faq', true), '');
  assert.equal(youtubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://evil.com/watch?v=dQw4w9WgXcQ'), null);
});

test('presets: har bir bo‘lim turi uchun preset bor va normalize’dan o‘tadi', () => {
  for (const type of SECTION_TYPES) {
    assert.ok(SECTION_META[type], type);
    const section = createSection(type);
    const doc = normalizeDoc({ ...createDefaultDoc(), sections: [section] });
    assert.equal(doc.sections[0].type, type);
    assert.equal(doc.sections[0].items.length, section.items.length);
  }
});

test('standart hujjat: 11 ta bo‘lim, hamma matn ikki tilda to‘ldirilgan', () => {
  const doc = createDefaultDoc();
  assert.equal(doc.sections.length, 11);
  const walk = (value: unknown, path: string) => {
    if (value && typeof value === 'object' && 'en' in (value as object) && 'ru' in (value as object)) {
      const text = value as { en: string; ru: string };
      assert.ok(text.en.trim() && text.ru.trim(), `bo‘sh tarjima: ${path}`);
      return;
    }
    if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
  };
  walk(doc, 'doc');
});

test('withPlusRef: account havolasiga manba belgisi qo‘shiladi', () => {
  const url = new URL(withPlusRef('https://account.tasimo.uz/register?mode=global', 'register'));
  assert.equal(url.searchParams.get('mode'), 'global');
  assert.equal(url.searchParams.get('utm_source'), 'tasimo_plus');
  assert.equal(url.searchParams.get('utm_medium'), 'landing');
  assert.equal(url.searchParams.get('utm_content'), 'register');
});

test('withPlusRef: tashqi sayt, plus o‘zi, nisbiy havola va admin utm_source — tegilmaydi', () => {
  assert.equal(withPlusRef('https://youtube.com/@tasimo_uz', 'other'), 'https://youtube.com/@tasimo_uz');
  assert.equal(withPlusRef('https://plus.tasimo.uz/ru', 'other'), 'https://plus.tasimo.uz/ru');
  assert.equal(withPlusRef('#faq', 'other'), '#faq');
  assert.equal(withPlusRef('https://account.tasimo.uz/login?utm_source=ig', 'login'), 'https://account.tasimo.uz/login?utm_source=ig');
});

test('havola: cta: — tugma manziliga (manba belgisi bilan), noto‘g‘ri cta: rad etiladi', () => {
  const doc = createDefaultDoc('https://account.tasimo.uz');
  const resolved = resolveLink(doc, 'cta:register');
  assert.equal(resolved.cta, 'register');
  assert.ok(resolved.href.startsWith('https://account.tasimo.uz/register?mode=global'));
  assert.ok(resolved.href.includes('utm_source=tasimo_plus'));
  assert.deepEqual(resolveLink(doc, '#faq'), { href: '#faq', cta: null });
  assert.equal(safeLink('cta:login'), 'cta:login');
  assert.equal(safeLink('cta:hack'), '');
  assert.equal(safeLink('javascript:alert(1)'), '');
});

test('normalize: footer va menyudagi cta: havolalar saqlanadi', () => {
  const raw = createDefaultDoc('https://account.tasimo.uz');
  const doc = normalizeDoc(JSON.parse(JSON.stringify(raw)), 'https://account.tasimo.uz');
  const links = doc.footer.columns.flatMap((column) => column.links.map((link) => link.href));
  assert.ok(links.includes('cta:register'));
  assert.ok(links.includes('cta:login'));
  assert.equal(linkKind('cta:login'), 'cta');
  assert.equal(linkKind('#about'), 'section');
  assert.equal(linkKind('https://tasimo.uz'), 'url');
});

test('logoId: eski hujjat — qushcha, yangi hujjat — rasmiy, noto‘g‘ri qiymat — qushcha', () => {
  const base = createDefaultDoc();
  const legacy = { ...base, header: { nav: base.header.nav, cta: 'register', secondaryCta: 'login' } };
  assert.equal(normalizeDoc(legacy).header.logoId, 'bird');
  assert.equal(normalizeDoc({ sections: [] }).header.logoId, 'official');
  assert.equal(normalizeDoc({ ...base, header: { ...base.header, logoId: 'hacker' } }).header.logoId, 'bird');
  assert.equal(normalizeDoc({ ...base, header: { ...base.header, logoId: 'compass' } }).header.logoId, 'compass');
});

test('brend: standart matnda tasdiqlanmagan va’da va noto‘g‘ri nom yo‘q', () => {
  const text = JSON.stringify(createDefaultDoc());
  for (const banned of [/guarantee/i, /medal/i, /certificate/i, /сертификат/i, /медал/i, /гарант/i, /TASIMO\+/, /Tasno|Tasmimo|Tassimo/]) {
    assert.ok(!banned.test(text), `taqiqlangan ibora: ${banned}`);
  }
  assert.ok(text.includes('Mathematics Olympiad for Primary School Students'));
  assert.ok(text.includes('Математическая олимпиада для учащихся начальных классов'));
});
