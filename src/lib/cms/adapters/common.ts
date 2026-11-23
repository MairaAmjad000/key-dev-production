import type { SeoMeta } from '@/types';
import type { ApiHomeSections, ApiSeo, Maybe } from './api-types';

/** First non-empty string, or undefined. */
export function pick(...values: Array<Maybe<string>>): string | undefined {
  return values.find((value) => typeof value === 'string' && value.trim() !== '') ?? undefined;
}

/** True unless the admin panel explicitly switched the block off. */
export function isOn(block: { enabled?: Maybe<boolean>; status?: Maybe<boolean> } | null | undefined): boolean {
  return !!block && block.enabled !== false && block.status !== false;
}

/** Shallow clone helper: copies `base` and overwrites keys whose new value is defined. */
export function merge<T extends object>(base: T, patch: { [K in keyof T]?: T[K] | undefined }): T {
  const out = { ...base };
  for (const key of Object.keys(patch) as Array<keyof T>) {
    const value = patch[key];
    if (value !== undefined) out[key] = value as T[keyof T];
  }
  return out;
}

/** Page URL of an item the admin panel only identifies by slug (the API's own `url` points at its own domain). */
export function path(prefix: string, slug: Maybe<string>): string {
  return slug ? `${prefix}/${slug}` : prefix;
}

export function toSeoMeta(seo: Maybe<ApiSeo>): SeoMeta {
  if (!seo) return {};
  const meta: SeoMeta = {
    keywords: pick(seo.meta_keywords),
    robots: pick(seo.robots),
    canonicalUrl: pick(seo.canonical_url),
    ogTitle: pick(seo.og_title),
    ogDescription: pick(seo.og_description),
    ogType: pick(seo.og_type),
    ogImage: pick(seo.og_image),
    ogUrl: pick(seo.og_url),
    twitterCard: pick(seo.twitter_card),
    twitterTitle: pick(seo.twitter_title),
    twitterDescription: pick(seo.twitter_description),
    twitterImage: pick(seo.twitter_image),
    schemaData: pick(seo.schema_data),
  };
  return Object.fromEntries(Object.entries(meta).filter(([, v]) => v !== undefined)) as SeoMeta;
}

/** Escape text that is interpolated into an HTML string. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** API string or '' (never a bundled value). */
export const str = (...values: Array<Maybe<string>>) => pick(...values) ?? '';

/** Escape plain admin text that is rendered as HTML (`<` and `&` only: the text lands between tags). */
export const escape = (value: Maybe<string>) => (value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Plain admin text → HTML for the places the markup renders HTML: escaped, single line breaks kept. */
export const html = (value: string) => escape(value).replace(/\r?\n/g, '<br/>');

/** Blank lines separate paragraphs. */
export const paragraphsOf = (value: Maybe<string>) => (value ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

/**
 * The blocks the home page and the inner pages (Who we are, How we work) have in common, in the shape the home mappers
 * read. Inner-page blocks call the small label `subtitle` where the home page calls it `small_title`.
 */
export function sharedHomeBlocks(api: {
  logos?: ApiHomeSections['banner'];
  testimonials?: Maybe<NonNullable<ApiHomeSections['testimonials']> & { subtitle?: Maybe<string> }>;
  portfolio?: Maybe<NonNullable<ApiHomeSections['portfolio']> & { subtitle?: Maybe<string> }>;
  technologies?: Maybe<NonNullable<ApiHomeSections['technologies']> & { subtitle?: Maybe<string> }>;
  blogs?: Maybe<NonNullable<ApiHomeSections['blogs']> & { subtitle?: Maybe<string> }>;
}): ApiHomeSections {
  const label = <T extends { small_title?: Maybe<string>; subtitle?: Maybe<string> }>(block: T | null | undefined) =>
    block ? { ...block, small_title: pick(block.subtitle, block.small_title) } : block;
  return {
    banner: api.logos,
    testimonials: label(api.testimonials),
    portfolio: label(api.portfolio),
    technologies: label(api.technologies),
    blogs: label(api.blogs),
  };
}

/**
 * Link typed in the admin panel → the address this site serves. The admin names its pages "about", "process" and
 * "technology"; here they live at /who-we-are, /how-we-work and /technologies. Any other link is returned as typed.
 */
export function internalHref(href: Maybe<string>): string | undefined {
  const value = pick(href);
  if (!value) return undefined;
  const aliases: Array<[RegExp, string]> = [
    [/^\/?(about|about-us|aboutus)\/?$/i, '/who-we-are'],
    [/^\/?(process|our-process|how-it-works)\/?$/i, '/how-we-work'],
    [/^\/?(technology|technologies)\/?$/i, '/technologies'],
  ];
  return aliases.find(([pattern]) => pattern.test(value.trim()))?.[1] ?? value;
}

