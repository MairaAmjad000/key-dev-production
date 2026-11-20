/**
 * Content access layer: the only place the app reads content from.
 *
 * With CMS_API_URL set, the site-wide content comes from GET /layout, /form-options and /global-sections and the
 * home page from GET /home (see adapters/). Whatever the API cannot supply, or when it cannot be reached at all,
 * is taken from the bundled content/ files, so the site always renders. Other pages still use content/ for now.
 */
import type { PageData, SiteData, SiteSettings } from '@/types';
import { fetchFromCms } from './client';
import { localPages, localSite } from './local';
import { adaptGlobalSections } from './adapters/global-sections';
import { adaptHome } from './adapters/home';
import { adaptLayout, adaptSettings } from './adapters/layout';
import type { ApiFormOptions, ApiGlobalSections, ApiHome, ApiLayout } from './adapters/api-types';

export async function getSiteSettings(): Promise<SiteSettings> {
  const layout = await fetchFromCms<ApiLayout>('layout');
  return adaptSettings(layout?.settings, localSite.settings);
}

/** Settings, navigation and global blocks shared by every page. */
export async function getSiteData(): Promise<SiteData> {
  const [layout, formOptions, globals] = await Promise.all([
    fetchFromCms<ApiLayout>('layout'),
    fetchFromCms<ApiFormOptions>('form-options'),
    fetchFromCms<ApiGlobalSections>('global-sections'),
  ]);
  const site = adaptLayout(layout, formOptions, localSite);
  return { ...site, globalSections: adaptGlobalSections(globals, localSite.globalSections) };
}

/** One page: SEO plus its ordered sections. `slug` is "home" for the front page. */
export async function getPage(slug: string): Promise<PageData | null> {
  const local = localPages[slug] ?? null;
  if (slug === 'home' && local) {
    const home = await fetchFromCms<ApiHome>('home');
    if (home) return adaptHome(home, local);
  }
  return local;
}

/** Slugs of all pages (used to pre-render them). */
export async function getPageSlugs(): Promise<string[]> {
  return Object.keys(localPages);
}
