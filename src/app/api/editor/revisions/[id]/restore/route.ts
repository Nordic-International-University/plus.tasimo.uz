import { type NextRequest } from 'next/server';
import { editorApi } from '@/lib/api.server';
import { forbidden, getEditorToken, relay, sameOrigin } from '@/lib/editor-session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return forbidden();
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) return relay({ status: 400, data: { message: 'Noto‘g‘ri nusxa.' } });
  return relay(await editorApi(`/plus/editor/revisions/${id}/restore`, await getEditorToken(), { method: 'POST', body: '{}' }));
}
