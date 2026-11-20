import type { Metadata } from 'next';
import type { SeoMeta } from '@/types';

/** Next.js metadata from the SEO fields of a page or of the site settings. Empty fields are left out. */
export function toMetadata(seo: { title?: string; description?: string } & SeoMeta, siteName?: string): Metadata {
  const metadata: Metadata = {};
  if (seo.title) metadata.title = seo.title;
  if (seo.description) metadata.description = seo.description;
  if (seo.keywords) metadata.keywords = seo.keywords;
  if (seo.robots) {
    const flags = seo.robots.toLowerCase().split(',').map((flag) => flag.trim());
    metadata.robots = { index: !flags.includes('noindex'), follow: !flags.includes('nofollow') };
  }
  if (seo.canonicalUrl) metadata.alternates = { canonical: seo.canonicalUrl };
  const ogTitle = seo.ogTitle ?? seo.title;
  const ogDescription = seo.ogDescription ?? seo.description;
  if (ogTitle || ogDescription || seo.ogImage || seo.ogUrl) {
    metadata.openGraph = {
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(seo.ogUrl ? { url: seo.ogUrl } : {}),
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
      ...(siteName ? { siteName } : {}),
      ...(seo.ogType === 'website' || seo.ogType === 'article' ? { type: seo.ogType } : {}),
    };
  }
  const card = seo.twitterCard === 'summary' || seo.twitterCard === 'summary_large_image' ? seo.twitterCard : undefined;
  if (card || seo.twitterTitle || seo.twitterDescription || seo.twitterImage) {
    metadata.twitter = {
      ...(card ? { card } : {}),
      ...((seo.twitterTitle ?? ogTitle) ? { title: seo.twitterTitle ?? ogTitle } : {}),
      ...((seo.twitterDescription ?? ogDescription) ? { description: seo.twitterDescription ?? ogDescription } : {}),
      ...(seo.twitterImage ? { images: [seo.twitterImage] } : {}),
    };
  }
  return metadata;
}
