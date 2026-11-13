import { NextResponse, type NextRequest } from 'next/server';
import { EDITOR_COOKIE, forbidden, sameOrigin } from '@/lib/editor-session';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(EDITOR_COOKIE);
  return response;
}
