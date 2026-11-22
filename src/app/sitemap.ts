import type { MetadataRoute } from 'next';
import { siteUrl } from '@/config/site';
import { getPageSlugs } from '@/lib/cms';

export const revalidate = 3600;

/** Every page of the site. Needs SITE_URL (sitemaps must use absolute addresses); without it the sitemap is empty. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) return [];
  const slugs = await getPageSlugs();
  return slugs.map((slug) => ({
    url: slug === 'home' ? siteUrl : `${siteUrl}/${slug}`,
    changeFrequency: slug === 'home' ? 'daily' : 'weekly',
    priority: slug === 'home' ? 1 : 0.7,
  }));
}
