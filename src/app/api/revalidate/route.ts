import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { after, NextResponse, type NextRequest } from 'next/server';
import { cmsConfig } from '@/config/cms';
import { CMS_TAG, getPageSlugs } from '@/lib/cms';

/** Constant-time string comparison (lengths are compared first, which only leaks the length). */
function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Webhook for the admin panel: call it after content is published so the site updates immediately.
 *   POST /api/revalidate    header  x-revalidate-secret: <CMS_REVALIDATE_SECRET>
 * The secret is accepted in the header only (query strings end up in access logs).
 *
 * It purges every cached CMS response and page, then (after answering) requests each page once so the next
 * visitor gets a freshly built, already cached page instead of waiting for the rebuild.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret') ?? '';
  if (!cmsConfig.revalidateSecret || !safeEqual(secret, cmsConfig.revalidateSecret)) {
    return NextResponse.json({ ok: false, error: 'Invalid secret' }, { status: 401 });
  }
  revalidateTag(CMS_TAG);

  const origin = request.nextUrl.origin;
  after(async () => {
    const slugs = await getPageSlugs();
    await Promise.allSettled(slugs.map((slug) => fetch(`${origin}${slug === 'home' ? '/' : `/${slug}`}`, { cache: 'no-store' })));
  });
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
