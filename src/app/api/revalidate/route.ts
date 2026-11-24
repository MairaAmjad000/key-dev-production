import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { after, NextResponse, type NextRequest } from 'next/server';
import { cmsConfig } from '@/config/cms';
import { CMS_TAG, getPageSlugs } from '@/lib/cms';

/** How many pages are re-requested at the same time after a publish. */
const WARM_CONCURRENCY = 4;

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
    // A few pages at a time: rebuilding every page at once makes each of them fetch its icons from the admin panel
    // together, and the ones that time out would be cached with plain <img> icons (no fill / hover styling).
    for (let i = 0; i < slugs.length; i += WARM_CONCURRENCY) {
      await Promise.allSettled(slugs.slice(i, i + WARM_CONCURRENCY).map((slug) => fetch(`${origin}${slug === 'home' ? '/' : `/${slug}`}`, { cache: 'no-store' })));
    }
  });
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
