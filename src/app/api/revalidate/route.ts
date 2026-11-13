import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { PLUS_CACHE_TAG } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Backend webhook: { tags: ["plus-landing"] }, header x-revalidate-secret */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: 'Service unavailable' }, { status: 503 });
  const provided = Buffer.from(request.headers.get('x-revalidate-secret') ?? '');
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags : [];
  const revalidated = tags.filter((tag) => tag === PLUS_CACHE_TAG);
  revalidated.forEach((tag) => revalidateTag(tag, { expire: 0 }));
  return NextResponse.json({ revalidated, rejected: tags.filter((tag) => tag !== PLUS_CACHE_TAG), now: Date.now() });
}
