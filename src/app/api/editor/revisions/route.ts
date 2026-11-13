import { editorApi } from '@/lib/api.server';
import { getEditorToken, relay } from '@/lib/editor-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  return relay(await editorApi('/plus/editor/revisions', await getEditorToken()));
}
