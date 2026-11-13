import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ART_LOGO_IDS, LOGO_ART, type ArtGroup } from '../src/components/logo/logo-art';
import { LOGO_IDS } from '../src/lib/doc/types';

const walk = (groups: ArtGroup[], visit: (group: ArtGroup) => void) =>
  groups.forEach((group) => {
    visit(group);
    if (group.sub) walk(group.sub, visit);
  });

test('logotiplar: har variantda belgi, harflar va yo‘llar bor; kesish id’lari mavjud', () => {
  assert.deepEqual([...ART_LOGO_IDS].sort(), LOGO_IDS.filter((id) => id !== 'bird').sort());
  for (const id of ART_LOGO_IDS) {
    const art = LOGO_ART[id];
    assert.ok(art.w > 0 && art.h > 0, id);
    assert.ok(art.groups.some((g) => g.r === 'mark'), `${id}: belgi yo‘q`);
    assert.equal(art.groups.filter((g) => g.r === 'letter').length, art.letters, id);
    assert.ok(art.collapsedW > 0 && art.collapsedW < art.w, `${id}: yig‘ilgan kenglik`);
    let paths = 0;
    walk(art.groups, (group) => {
      paths += group.p.length;
      if (group.clip) assert.ok(art.clips[group.clip], `${id}: ${group.k} kesishi yo‘q`);
      for (const path of group.p) assert.match(path.d, /^M[\d.-]/, `${id}: ${group.k} path`);
    });
    assert.ok(paths >= 10, `${id}: yo‘llar kam (${paths})`);
  }
});

test('logotiplar: yig‘ilishda belgi va yorliq ko‘rinadigan maydon ichida qoladi', () => {
  for (const id of ART_LOGO_IDS) {
    const art = LOGO_ART[id];
    for (const group of art.groups.filter((g) => g.r === 'mark' || g.r === 'badge')) {
      assert.ok((group.cx ?? 0) <= 0, `${id}: ${group.k} o‘ngga siljimasin`);
    }
  }
});
