/**
 * Content access layer: the only place the app reads content from.
 *
 * With CMS_API_URL set, ALL content comes from the admin panel: the site-wide content from GET /layout,
 * /form-options and /global-sections and the home page from GET /home (see adapters/). There is no fallback
 * content: if the API cannot be reached the request throws and Next.js keeps serving the last good page.
 * The bundled content/ folder is only used as markup / size template for the adapters, as the data of pages the
 * API does not serve yet (every page except home), and as the whole data source when CMS_API_URL is empty (demo mode).
 */
import type { PageData, SiteData, SiteSettings } from '@/types';
import { cmsConfig } from '@/config/cms';
import { sanitizeDeep } from '@/lib/utils/html';
import { requireFromCms } from './client';
import { localPages, localSite } from './local';
import { adaptGlobalSections } from './adapters/global-sections';
import { adaptHome } from './adapters/home';
import { adaptLayout, adaptSettings } from './adapters/layout';
import type { ApiFormOptions, ApiGlobalSections, ApiHome, ApiLayout } from './adapters/api-types';

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!cmsConfig.apiUrl) return localSite.settings;
  const layout = await requireFromCms<ApiLayout>('layout');
  return adaptSettings(layout?.settings, localSite.settings);
}

/** Settings, navigation and global blocks shared by every page. */
export async function getSiteData(): Promise<SiteData> {
  if (!cmsConfig.apiUrl) return localSite;
  const [layout, formOptions, globals] = await Promise.all([
    requireFromCms<ApiLayout>('layout'),
    requireFromCms<ApiFormOptions>('form-options'),
    requireFromCms<ApiGlobalSections>('global-sections'),
  ]);
  const site = adaptLayout(layout, formOptions, localSite);
  // Everything below came from the admin panel: strip scripts / handlers from its HTML before any component renders it.
  const { settings, ...content } = { ...site, globalSections: adaptGlobalSections(globals, localSite.globalSections, layout?.settings?.contact) };
  // `settings` (SEO fields, JSON-LD) is plain data that never reaches dangerouslySetInnerHTML, so it is left as sent.
  return { settings, ...(await sanitizeDeep(content)) };
}

/** One page: SEO plus its ordered sections. `slug` is "home" for the front page. */
export async function getPage(slug: string): Promise<PageData | null> {
  const local = localPages[slug] ?? null;
  if (slug === 'home' && local && cmsConfig.apiUrl) {
    const home = await requireFromCms<ApiHome>('home');
    if (home) {
      const adapted = adaptHome(home, local);
      return { ...adapted, sections: await sanitizeDeep(adapted.sections) };
    }
  }
  return local;
}

/** Slugs of all pages (used to pre-render them). */
export async function getPageSlugs(): Promise<string[]> {
  return Object.keys(localPages);
}
