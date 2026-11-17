// src/app/icon.svg dan: src/app/favicon.ico (16/32/48, PNG ichida — Google natijasidagi belgi va /favicon.ico so'rovi)
// va public/icon-192.png, public/icon-512.png (manifest, JSON-LD Organization logosi). Ishga tushirish: node scripts/gen-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'src/app/icon.svg'));
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

for (const size of [192, 512]) {
  writeFileSync(join(root, `public/icon-${size}.png`), await png(size));
}

// ICO: 6 bayt sarlavha + har rasm uchun 16 bayt katalog yozuvi + PNG ma'lumotlari (Windows Vista+ va brauzerlar o'qiydi)
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((size, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(images[i].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return entry;
});
writeFileSync(join(root, 'src/app/favicon.ico'), Buffer.concat([header, ...entries, ...images]));
console.log('favicon.ico (16/32/48), icon-192.png, icon-512.png yozildi');
