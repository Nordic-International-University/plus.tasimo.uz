import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visitorTouch, withPlusRef, withVisitorRef } from '../src/lib/doc/ref';

const NOW = Date.parse('2026-11-13T12:00:00Z');
const cookie = (value: Record<string, string>) => JSON.stringify(value);
const REGISTER = withPlusRef('https://account.tasimo.uz/register?mode=global', 'register');

test('visitorTouch: cookie (birinchi reklama) URL’dagidan ustun — backend ham shu kontaktga bog‘laydi', () => {
  const touch = visitorTouch(
    cookie({ s: 'instagram', m: 'paid', c: 'plus-a', ct: 'reel-1', ts: '2026-11-10T09:00:00Z' }),
    '?utm_source=facebook&utm_medium=paid&utm_campaign=plus-b',
    NOW,
  );
  assert.deepEqual(touch, { source: 'instagram', medium: 'paid', campaign: 'plus-a', content: 'reel-1' });
});

test('visitorTouch: cookie yo‘q yoki o‘qib bo‘lmasa — joriy URL’dagi utm', () => {
  assert.deepEqual(visitorTouch(null, '?utm_source=instagram&utm_medium=paid&utm_campaign=plus-b&utm_term=ota-ona', NOW), {
    source: 'instagram',
    medium: 'paid',
    campaign: 'plus-b',
    term: 'ota-ona',
  });
  assert.deepEqual(visitorTouch('{buzuq', '?utm_campaign=plus-c', NOW), { campaign: 'plus-c' });
});

test('visitorTouch: 30 kundan eski cookie, utm’siz kontakt (faqat referrer/click ID) va bo‘sh holat — null', () => {
  assert.equal(visitorTouch(cookie({ s: 'instagram', c: 'plus-a', ts: '2026-09-01T00:00:00Z' }), '', NOW), null);
  assert.equal(visitorTouch(cookie({ r: 'https://www.google.com/', ts: '2026-11-12T00:00:00Z' }), '', NOW), null);
  assert.equal(visitorTouch(cookie({ k: 'gclid', ts: '2026-11-12T00:00:00Z' }), '?fbclid=abc', NOW), null);
  assert.equal(visitorTouch(null, '', NOW), null);
});

test('visitorTouch: eski cookie bo‘lsa ham yangi URL’dagi reklama olinadi', () => {
  const touch = visitorTouch(cookie({ s: 'instagram', c: 'plus-a', ts: '2026-09-01T00:00:00Z' }), '?utm_source=tiktok&utm_campaign=plus-d', NOW);
  assert.deepEqual(touch, { source: 'tiktok', campaign: 'plus-d' });
});

test('withVisitorRef: tugma havolasidagi tasimo_plus belgisi tashrifchining reklamasi bilan almashadi', () => {
  const url = new URL(withVisitorRef(REGISTER, { source: 'instagram', medium: 'paid', campaign: 'plus-a', content: 'reel-1' }));
  assert.equal(url.hostname, 'account.tasimo.uz');
  assert.equal(url.pathname, '/register');
  assert.equal(url.searchParams.get('mode'), 'global');
  assert.equal(url.searchParams.get('utm_source'), 'instagram');
  assert.equal(url.searchParams.get('utm_medium'), 'paid');
  assert.equal(url.searchParams.get('utm_campaign'), 'plus-a');
  assert.equal(url.searchParams.get('utm_content'), 'reel-1');
  assert.equal(url.searchParams.has('utm_term'), false);
});

test('withVisitorRef: reklamada bo‘lmagan utm maydoni havolada qolmaydi (tugma nomi reklama bilan aralashmasin)', () => {
  const url = new URL(withVisitorRef(REGISTER, { source: 'instagram', campaign: 'plus-a' }));
  assert.equal(url.searchParams.has('utm_medium'), false);
  assert.equal(url.searchParams.has('utm_content'), false);
});

test('withVisitorRef: tashqi sayt, plus o‘zi va nisbiy havola — tegilmaydi', () => {
  const touch = { source: 'instagram', campaign: 'plus-a' };
  assert.equal(withVisitorRef('https://t.me/tasimo_bot', touch), 'https://t.me/tasimo_bot');
  assert.equal(withVisitorRef('https://plus.tasimo.uz/ru', touch), 'https://plus.tasimo.uz/ru');
  assert.equal(withVisitorRef('#faq', touch), '#faq');
});
