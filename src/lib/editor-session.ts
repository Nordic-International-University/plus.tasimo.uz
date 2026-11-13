import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/** Muharrir tokeni — httpOnly cookie (JS o'qiy olmaydi), faqat shu sayt yo'llari backend'ga uzatadi */
export const EDITOR_COOKIE = 'plus_editor';

export async function getEditorToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(EDITOR_COOKIE)?.value ?? null;
}

export function isSecureRequest(request: NextRequest): boolean {
  return request.headers.get('x-forwarded-proto') === 'https' || request.nextUrl.protocol === 'https:';
}

/**
 * CSRF himoyasi: o'zgartiruvchi so'rov faqat shu saytning o'zidan (Origin/Referer hosti bir xil).
 * Cookie SameSite=Strict — bu ikkinchi qavat.
 */
export function sameOrigin(request: NextRequest): boolean {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const source = request.headers.get('origin') ?? request.headers.get('referer');
  if (!host || !source) return false;
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

export function forbidden(): NextResponse {
  return NextResponse.json({ message: 'Ruxsat yo‘q.' }, { status: 403 });
}

/** Backend javobini o'zgartirmasdan uzatish (401 bo'lsa — cookie o'chiriladi) */
export function relay(result: { status: number; data: unknown }): NextResponse {
  const response = NextResponse.json(result.data ?? {}, { status: result.status });
  if (result.status === 401) response.cookies.delete(EDITOR_COOKIE);
  return response;
}
