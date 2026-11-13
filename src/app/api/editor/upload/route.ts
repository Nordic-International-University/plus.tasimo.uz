import { type NextRequest } from 'next/server';
import { editorApi } from '@/lib/api.server';
import { forbidden, getEditorToken, relay, sameOrigin } from '@/lib/editor-session';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024;

/** Rasm yuklash (multipart, maydon — file) — backend WebP'ga o'giradi va CDN manzilini qaytaradi */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return relay({ status: 400, data: { message: 'Rasm tanlanmagan.' } });
  if (file.size > MAX_BYTES) return relay({ status: 413, data: { message: 'Rasm 8 MB dan oshmasin.' } });
  const out = new FormData();
  out.append('file', file, file.name);
  return relay(await editorApi('/plus/editor/upload', await getEditorToken(), { method: 'POST', body: out }));
}
