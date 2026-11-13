import { revalidateTag } from 'next/cache';
import { type NextRequest } from 'next/server';
import { editorApi } from '@/lib/api.server';
import { PLUS_CACHE_TAG } from '@/lib/cache';
import { forbidden, getEditorToken, relay, sameOrigin } from '@/lib/editor-session';

export const dynamic = 'force-dynamic';

/** E'lon qilish — muvaffaqiyatli bo'lsa sayt keshi darhol yangilanadi */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const body = await request.text();
  const result = await editorApi('/plus/editor/publish', await getEditorToken(), { method: 'POST', body: body || '{}' });
  if (result.ok) revalidateTag(PLUS_CACHE_TAG, { expire: 0 });
  return relay(result);
}
