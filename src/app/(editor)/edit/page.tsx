import { Editor } from '@/components/editor/Editor';
import { LoginForm } from '@/components/editor/LoginForm';
import { editorApi } from '@/lib/api.server';
import { normalizeDoc } from '@/lib/doc/normalize';
import { isLocale } from '@/lib/doc/types';
import { getEditorToken } from '@/lib/editor-session';
import { ACCOUNT_URL } from '@/lib/env.server';

export const dynamic = 'force-dynamic';

interface EditorState {
  draft: unknown;
  draftVersion: number;
  publishedAt: string | null;
  hasUnpublished: boolean;
}

/** /edit — parol bilan kirilgan bo'lsa muharrir, aks holda kirish formasi */
export default async function EditPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const token = await getEditorToken();
  if (!token) return <LoginForm />;

  const result = await editorApi<EditorState>('/plus/editor/content', token);
  if (result.status === 401) return <LoginForm message="Sessiya tugagan — parolni qayta kiriting." />;
  if (!result.ok || !result.data || !('draftVersion' in result.data)) {
    const raw = result.data && 'message' in result.data ? result.data.message : null;
    return <LoginForm message={(Array.isArray(raw) ? raw.join(', ') : raw) || 'Server bilan aloqa yo‘q. Birozdan keyin qayta urinib ko‘ring.'} />;
  }

  const { lang } = await searchParams;
  const state = result.data;
  return (
    <Editor
      initialDoc={normalizeDoc(state.draft, ACCOUNT_URL)}
      initialVersion={state.draftVersion}
      hasUnpublished={state.hasUnpublished}
      publishedAt={state.publishedAt}
      accountUrl={ACCOUNT_URL}
      initialLocale={isLocale(lang) ? lang : 'en'}
    />
  );
}
