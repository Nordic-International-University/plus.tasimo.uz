import { type NextRequest } from 'next/server';
import { editorApi } from '@/lib/api.server';
import { forbidden, getEditorToken, relay, sameOrigin } from '@/lib/editor-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  return relay(await editorApi('/plus/editor/content', await getEditorToken()));
}

/** Avtomatik saqlash: { content, baseVersion } */
export async function PUT(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const body = await request.text();
  if (body.length > 1_000_000) return relay({ status: 413, data: { message: 'Hujjat juda katta.' } });
  return relay(await editorApi('/plus/editor/draft', await getEditorToken(), { method: 'PUT', body }));
}
