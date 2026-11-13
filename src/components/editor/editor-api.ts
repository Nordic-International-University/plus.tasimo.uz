'use client';

/** Muharrir → shu saytning /api/editor/* yo'llari (token httpOnly cookie'da, brauzer uni ko'rmaydi) */

export class EditorHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data?: unknown,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, credentials: 'same-origin', cache: 'no-store' });
  } catch {
    throw new EditorHttpError('Internet aloqasi yo‘q. O‘zgarishlar shu oynada saqlanib turibdi.', 0);
  }
  const data = (await response.json().catch(() => null)) as T & { message?: string | string[] };
  if (!response.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : raw || `Xatolik (${response.status})`;
    throw new EditorHttpError(message, response.status, data);
  }
  return data;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const editorApi = {
  login: (password: string) => call<{ ok: true }>('/api/editor/login', json('POST', { password })),
  logout: () => call<{ ok: true }>('/api/editor/logout', json('POST')),
  saveDraft: (content: unknown, baseVersion: number) =>
    call<{ draftVersion: number; draftUpdatedAt: string }>('/api/editor/draft', json('PUT', { content, baseVersion })),
  load: () =>
    call<{ draft: unknown; draftVersion: number; draftUpdatedAt: string | null; publishedAt: string | null; hasUnpublished: boolean }>('/api/editor/draft'),
  publish: (note?: string) => call<{ publishedAt: string; draftVersion: number }>('/api/editor/publish', json('POST', note ? { note } : {})),
  discard: () => call<{ draftVersion: number }>('/api/editor/discard', json('POST')),
  revisions: () => call<{ id: number; note: string | null; createdAt: string }[]>('/api/editor/revisions'),
  restore: (id: number) => call<{ draftVersion: number }>(`/api/editor/revisions/${id}/restore`, json('POST')),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return call<{ url: string }>('/api/editor/upload', { method: 'POST', body: form });
  },
};
