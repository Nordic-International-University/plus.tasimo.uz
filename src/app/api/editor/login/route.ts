import { NextResponse, type NextRequest } from 'next/server';
import { editorApi } from '@/lib/api.server';
import { EDITOR_COOKIE, forbidden, isSecureRequest, sameOrigin } from '@/lib/editor-session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : '';
  if (!password) return NextResponse.json({ message: 'Parolni kiriting.' }, { status: 400 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '';
  const result = await editorApi<{ token: string; expiresIn: number }>('/plus/editor/login', null, {
    method: 'POST',
    body: JSON.stringify({ password }),
    headers: ip ? { 'x-visitor-ip': ip } : undefined,
  });
  if (!result.ok || !result.data || !('token' in result.data)) {
    return NextResponse.json(result.data ?? { message: 'Kirib bo‘lmadi.' }, { status: result.status || 500 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(EDITOR_COOKIE, result.data.token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecureRequest(request),
    path: '/',
    maxAge: result.data.expiresIn,
  });
  return response;
}
