import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getPageSlugs, getSiteData, toMetadata } from '@/lib/cms';
import { SiteShell } from '@/components/layout/SiteShell';

/**
 * Render on every visit instead of freezing the page at build time. The static copy only changed after a new
 * deploy (a GitHub commit), because the background refresh did not run on Vercel. API responses are still cached
 * for CMS_REVALIDATE_SECONDS (see lib/cms/client.ts), so the admin panel is not hit on every single request.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type PageProps = { params: Promise<{ slug?: string[] }> };

/** "/" is the page with the slug "home"; "/a/b" is the page with the slug "a/b". */
const toSlug = (parts?: string[]) => (parts && parts.length > 0 ? parts.join('/') : 'home');

export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs.map((slug) => ({ slug: slug === 'home' ? [] : slug.split('/') }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPage(toSlug((await params).slug));
  return page?.seo ? toMetadata(page.seo) : {};
}

export default async function Page({ params }: PageProps) {
  const slug = toSlug((await params).slug);
  const [site, page] = await Promise.all([getSiteData(), getPage(slug)]);
  if (!page) notFound();
  return <SiteShell site={site} page={page} />;
}