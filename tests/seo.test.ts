import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultDoc } from '../src/lib/doc/default-doc';
import type { PlusDoc } from '../src/lib/doc/types';
import { buildJsonLd, buildMetadata } from '../src/lib/seo';

const SITE = 'https://plus.tasimo.uz';
const base = () => createDefaultDoc('https://account.tasimo.uz');
const withSeo = (seo: Partial<PlusDoc['seo']>): PlusDoc => {
  const doc = base();
  return { ...doc, seo: { ...doc.seo, ...seo } };
};
type Node = Record<string, unknown>;
const graphOf = (doc: PlusDoc, locale: 'en' | 'ru', publishedAt: string | null = null) => {
  const data = buildJsonLd(doc, locale, SITE, publishedAt) as { '@context': string; '@graph': Node[] };
  return data['@graph'];
};
const byType = (graph: Node[], type: string) =>
  graph.find((node) => (Array.isArray(node['@type']) ? (node['@type'] as string[]).includes(type) : node['@type'] === type));

test('title: admin yozgan sarlavhada «TASIMO Plus» bo‘lsa — o‘zgarmaydi', () => {
  assert.equal(buildMetadata(base(), 'en', SITE).title, 'TASIMO Plus — Mathematics Olympiad for Primary School Students');
  assert.equal(buildMetadata(withSeo({ title: { en: 'Олимпиада', ru: 'ТАСИМО Плюс: олимпиада' } }), 'ru', SITE).title, 'ТАСИМО Плюс: олимпиада');
});

test('title: brendsiz sarlavhaga « — TASIMO Plus» qo‘shiladi, bo‘sh bo‘lsa — brend + dekriptor', () => {
  assert.equal(buildMetadata(withSeo({ title: { en: 'Math olympiad for kids', ru: '' } }), 'en', SITE).title, 'Math olympiad for kids — TASIMO Plus');
  assert.equal(buildMetadata(withSeo({ title: { en: '', ru: '' } }), 'ru', SITE).title, 'TASIMO Plus — математическая олимпиада для учащихся начальных классов');
});

test('description: bo‘sh bo‘lsa — brendli zaxira tavsif (shu tilda)', () => {
  const meta = buildMetadata(withSeo({ description: { en: '', ru: '' } }), 'ru', SITE);
  assert.match(String(meta.description), /^TASIMO Plus — математическая олимпиада/);
  assert.equal(meta.openGraph?.description, meta.description);
});

test('canonical va hreflang: /en, /ru, x-default', () => {
  const meta = buildMetadata(base(), 'ru', SITE);
  assert.equal(meta.alternates?.canonical, `${SITE}/ru`);
  assert.deepEqual(meta.alternates?.languages, { en: `${SITE}/en`, ru: `${SITE}/ru`, 'x-default': `${SITE}/en` });
});

test('JSON-LD: bitta @graph — Organization ← WebSite ← WebPage, id’lar bog‘langan', () => {
  const graph = graphOf(base(), 'en', '2026-11-13T10:55:57.893Z');
  const org = byType(graph, 'Organization')!;
  const site = byType(graph, 'WebSite')!;
  const page = byType(graph, 'WebPage')!;
  assert.equal(org['@id'], 'https://tasimo.uz/#organization');
  assert.equal(org.url, 'https://tasimo.uz');
  assert.deepEqual(org.logo, { '@type': 'ImageObject', url: `${SITE}/icon-512.png`, width: 512, height: 512 });
  assert.ok((org.sameAs as string[]).length > 0);

  assert.equal(site['@id'], `${SITE}/#website`);
  assert.equal(site.url, `${SITE}/`);
  assert.equal(site.name, 'TASIMO Plus');
  assert.ok((site.alternateName as string[]).includes('Tasimo Plus'));
  assert.ok((site.alternateName as string[]).includes('ТАСИМО Плюс'));
  assert.deepEqual(site.publisher, { '@id': org['@id'] });

  assert.equal(page['@id'], `${SITE}/en#webpage`);
  assert.equal(page.url, `${SITE}/en`);
  assert.equal(page.inLanguage, 'en');
  assert.deepEqual(page.isPartOf, { '@id': site['@id'] });
  assert.deepEqual(page.about, { '@id': org['@id'] });
  assert.equal(page.dateModified, '2026-11-13T10:55:57.893Z');
  assert.equal(page.name, 'TASIMO Plus — Mathematics Olympiad for Primary School Students');
});

test('JSON-LD: FAQ bo‘lsa sahifa WebPage + FAQPage (savollar matni formatsiz), yashirilsa — faqat WebPage', () => {
  const page = byType(graphOf(base(), 'ru'), 'WebPage')!;
  assert.deepEqual(page['@type'], ['WebPage', 'FAQPage']);
  const questions = page.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  assert.ok(questions.length > 0);
  assert.ok(questions.every((q) => q.name && q.acceptedAnswer.text && !/<[a-z]/i.test(q.name + q.acceptedAnswer.text)));

  const doc = base();
  const hidden = { ...doc, sections: doc.sections.map((s) => (s.type === 'faq' ? { ...s, hidden: true } : s)) };
  const plain = byType(graphOf(hidden, 'ru'), 'WebPage')!;
  assert.equal(plain['@type'], 'WebPage');
  assert.equal(plain.mainEntity, undefined);
  assert.equal(plain.dateModified, undefined);
});
