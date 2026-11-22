import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getPageSlugs, getSiteData, getSiteSettings, toMetadata } from '@/lib/cms';
import { siteUrl } from '@/config/site';
import { preload } from 'react-dom';
import { SiteShell } from '@/components/layout/SiteShell';

/**
 * Pages are served from the static cache (fast). Admin changes appear immediately through POST /api/revalidate, which
 * purges the cache and re-warms every page; this interval is only the safety net if that webhook is not called
 * (keep in sync with CMS_REVALIDATE_SECONDS).
 */
export const revalidate = 60;
export const maxDuration = 60;

type PageProps = { params: Promise<{ slug?: string[] }> };

/** "/" is the page with the slug "home"; "/a/b" is the page with the slug "a/b". */
const toSlug = (parts?: string[]) => (parts && parts.length > 0 ? parts.join('/') : 'home');

/**
 * schema.org structured data from the admin panel, re-serialised so it can only ever be JSON: invalid input is dropped,
 * and "<" is escaped so the data cannot close the <script> tag it is embedded in.
 */
function toJsonLd(raw?: string): string | null {
  if (!raw?.trim()) return null;
  try {
    return JSON.stringify(JSON.parse(raw)).replace(/</g, '\\u003c');
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs.map((slug) => ({ slug: slug === 'home' ? [] : slug.split('/') }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = toSlug((await params).slug);
  const [page, site] = await Promise.all([getPage(slug), getSiteSettings()]);
  if (!page?.seo) return {};
  // A page without its own share picture uses the site-wide one; and every page names its own canonical address.
  const seo = {
    ...page.seo,
    ogImage: page.seo.ogImage ?? site.seo.ogImage,
    twitterImage: page.seo.twitterImage ?? page.seo.ogImage ?? site.seo.twitterImage ?? site.seo.ogImage,
    canonicalUrl: page.seo.canonicalUrl ?? (siteUrl ? `${siteUrl}${slug === 'home' ? '' : `/${slug}`}` : undefined),
  };
  return toMetadata(seo, site.seo.siteName);
}

export default async function Page({ params }: PageProps) {
  const slug = toSlug((await params).slug);
  const [site, page] = await Promise.all([getSiteData(), getPage(slug)]);
  if (!page) notFound();
  const jsonLd = toJsonLd(page.seo?.schemaData);
  const heroImage = page.sections.find((block) => block.type === 'hero')?.data;
  const heroSrc = heroImage && 'image' in heroImage ? heroImage.image?.src : '';
  if (heroSrc) preload(heroSrc, { as: 'image', fetchPriority: 'high' });
  return (
    <>
      <SiteShell site={site} page={page} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
    </>
  );
}