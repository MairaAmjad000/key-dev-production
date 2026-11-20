import type { SeoMeta } from '@/types';
import type { ApiSeo, Maybe } from './api-types';

/** First non-empty string, or undefined. */
export function pick(...values: Array<Maybe<string>>): string | undefined {
  return values.find((value) => typeof value === 'string' && value.trim() !== '') ?? undefined;
}

/** True unless the admin panel explicitly switched the block off. */
export function isOn(block: { enabled?: Maybe<boolean>; status?: Maybe<boolean> } | null | undefined): boolean {
  return !!block && block.enabled !== false && block.status !== false;
}

/** Item `index` of `list`, wrapping around, for borrowing a bundled item (e.g. a placeholder image). */
export function cycle<T>(list: readonly T[] | undefined, index: number): T | undefined {
  return list && list.length > 0 ? list[index % list.length] : undefined;
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
