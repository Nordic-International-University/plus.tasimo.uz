import { type NextRequest } from 'next/server';
import { editorApi } from '@/lib/api.server';
import { forbidden, getEditorToken, relay, sameOrigin } from '@/lib/editor-session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  return relay(await editorApi('/plus/editor/discard', await getEditorToken(), { method: 'POST', body: '{}' }));
}
