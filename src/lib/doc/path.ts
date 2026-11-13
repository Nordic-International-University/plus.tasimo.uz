import type { Locale, Path, Text } from './types';

/** Hujjat ichida yo'l bo'yicha o'qish/yozish — o'zgarmas (immutable), faqat yo'ldagi tugunlar nusxalanadi */

type Node = Record<string, unknown> | unknown[];

export function getIn(root: unknown, path: Path): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node;
}

export function setIn<T>(root: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [key, ...rest] = path;
  const base: Node = Array.isArray(root) ? [...root] : root && typeof root === 'object' ? { ...(root as Record<string, unknown>) } : typeof key === 'number' ? [] : {};
  const current = (base as Record<string | number, unknown>)[key];
  (base as Record<string | number, unknown>)[key] = setIn(current, rest, value);
  return base as T;
}

export function updateIn<T>(root: T, path: Path, fn: (value: unknown) => unknown): T {
  return setIn(root, path, fn(getIn(root, path)));
}

/** Matnning bitta tilini yozish (Text yo'q bo'lsa — yaratiladi) */
export function setText<T>(root: T, path: Path, locale: Locale, value: string): T {
  return updateIn(root, path, (current) => {
    const text: Text = current && typeof current === 'object' ? { en: '', ru: '', ...(current as Partial<Text>) } : { en: '', ru: '' };
    return { ...text, [locale]: value };
  });
}

export function moveItem<T>(root: T, arrayPath: Path, from: number, to: number): T {
  return updateIn(root, arrayPath, (value) => {
    const list = Array.isArray(value) ? [...value] : [];
    if (from < 0 || from >= list.length || to < 0 || to >= list.length || from === to) return list;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    return list;
  });
}

export function insertItem<T>(root: T, arrayPath: Path, index: number, item: unknown): T {
  return updateIn(root, arrayPath, (value) => {
    const list = Array.isArray(value) ? [...value] : [];
    list.splice(Math.max(0, Math.min(index, list.length)), 0, item);
    return list;
  });
}

export function removeItem<T>(root: T, arrayPath: Path, index: number): T {
  return updateIn(root, arrayPath, (value) => (Array.isArray(value) ? value.filter((_, i) => i !== index) : []));
}

/** Chuqur nusxa + barcha `id` maydonlari yangilanadi (bo'lim/quti nusxalaganda id takrorlanmasin) */
export function cloneWithNewIds<T>(value: T, makeId: (old: string) => string): T {
  if (Array.isArray(value)) return value.map((item) => cloneWithNewIds(item, makeId)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = key === 'id' && typeof child === 'string' ? makeId(child) : cloneWithNewIds(child, makeId);
    }
    return out as T;
  }
  return value;
}

export const samePath = (a: Path, b: Path) => a.length === b.length && a.every((key, i) => key === b[i]);
export const pathKey = (path: Path) => path.join('.');
