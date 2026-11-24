/**
 * Content access layer: the only place the app reads content from.
 *
 * With CMS_API_URL set, ALL content comes from the admin panel: the site-wide content from GET /layout,
 * /form-options and /global-sections, the home page from GET /home and the Who we are page from GET /pages/about, the How we work page from GET /pages/process and the Client Review page from GET /pages/client-review, the Technologies page from GET /pages/technology and the Portfolio page from GET /pages/portfolio the Blog page from GET /pages/blog, the Contact page from GET /pages/contact and each service category page from GET /service-categories/<slug> (see adapters/). There is no fallback
 * content: if the API cannot be reached the request throws and Next.js keeps serving the last good page.
 * The bundled content/ folder is only used as markup / size template for the adapters, as the data of pages the
 * API does not serve yet (every page except home, Who we are, How we work, Client Review, Technologies, Portfolio, Blog, Contact and the service categories), and as the whole data source when CMS_API_URL is empty (demo mode).
 */
import type { PageData, SiteData, SiteSettings } from '@/types';
import { cmsConfig } from '@/config/cms';
import { sanitizeDeep } from '@/lib/utils/html';
import { fetchFromCms, requireFromCms } from './client';
import { localPages, localSite } from './local';
import { serviceCategoryTemplate } from './local-service-category';
import { adaptGlobalSections } from './adapters/global-sections';
import { adaptAbout } from './adapters/about';
import { adaptHome } from './adapters/home';
import { adaptProcess } from './adapters/process';
import { adaptClientReview } from './adapters/client-review';
import { adaptTechnology } from './adapters/technology';
import { adaptPortfolio } from './adapters/portfolio';
import { fillServiceIcons } from './service-icons';
import { adaptBlog } from './adapters/blog';
import { adaptBlogPost } from './adapters/blog-post';
import { adaptServiceCategory } from './adapters/service-category';
import { adaptContact } from './adapters/contact';
import { adaptLayout, adaptSettings } from './adapters/layout';
import type { ApiAbout, ApiBlog, ApiContact, ApiClientReview, ApiFormOptions, ApiGlobalSections, ApiHome, ApiLayout, ApiPortfolio, ApiProcess, ApiServiceCategory, ApiServiceCategoryList, ApiTechnology } from './adapters/api-types';

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

/** An inner page rendered from `GET {CMS_API_URL}/<path>`: the adapter fills the bundled page's sections, which are then sanitized. */
async function innerPage<T>(path: string, adapt: (api: T, local: PageData) => PageData, local: PageData, prepare?: (api: T) => Promise<void>): Promise<PageData | null> {
  const api = await requireFromCms<T>(path);
  if (!api) return null;
  await prepare?.(api);
  const adapted = adapt(api, local);
  return { ...adapted, sections: await sanitizeDeep(adapted.sections) };
}

/**
 * A service category page (/service-category/<slug>) from `GET /service-categories/<slug>`. Every category the API lists
 * is rendered with the one layout of local-service-category.ts. A slug the API does not list returns null (the caller
 * then falls back to a bundled page of that slug, if there is one).
 */
async function serviceCategoryPage(slug: string): Promise<PageData | null> {
  const list = await requireFromCms<ApiServiceCategoryList>('service-categories');
  if (!list?.categories?.some((category) => category.slug === slug)) return null;
  const api = await requireFromCms<ApiServiceCategory>(`service-categories/${slug}`);
  const page = api ? adaptServiceCategory(api, serviceCategoryTemplate, slug) : null;
  return page ? { ...page, sections: await sanitizeDeep(page.sections) } : null;
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
  // An article (/blog/<slug>): the admin panel sends the full articles inside GET /pages/blog. With a CMS the dummy
  // articles are not served; a slug the API does not know is a 404. (/blog/category/... is not an article.)
  if (cmsConfig.apiUrl && /^blog\/(?!category\/)[^/]+$/.test(slug)) {
    const api = await requireFromCms<ApiBlog>('pages/blog');
    const page = api ? adaptBlogPost(api, slug.slice('blog/'.length)) : null;
    return page ? { ...page, sections: await sanitizeDeep(page.sections) } : null;
  }
  // A service category (/service-category/<slug>): the admin panel's GET /service-categories/<slug>.
  if (cmsConfig.apiUrl && /^service-category\/[^/]+$/.test(slug)) {
    const page = await serviceCategoryPage(slug.slice('service-category/'.length));
    if (page) return page;
  }
  // Inner pages the admin panel serves under GET /pages/<key>: Who we are = "About", How we work = "Process", Client Review = "client-review", Technologies = "technology", Portfolio = "portfolio".
  if (local && cmsConfig.apiUrl) {
    if (slug === 'who-we-are') return (await innerPage<ApiAbout>('pages/about', adaptAbout, local)) ?? local;
    if (slug === 'how-we-work') return (await innerPage<ApiProcess>('pages/process', adaptProcess, local)) ?? local;
    if (slug === 'client-review') return (await innerPage<ApiClientReview>('pages/client-review', adaptClientReview, local)) ?? local;
    if (slug === 'technologies') return (await innerPage<ApiTechnology>('pages/technology', adaptTechnology, local)) ?? local;
    if (slug === 'portfolio') return (await innerPage<ApiPortfolio>('pages/portfolio', adaptPortfolio, local, fillServiceIcons)) ?? local;
    if (slug === 'contact') return (await innerPage<ApiContact>('pages/contact', adaptContact, local)) ?? local;
    if (slug === 'blog') {
      // The Blog endpoint only sends the texts above the testimonials; the reviews are the Client Review page's.
      const reviews = (await requireFromCms<ApiClientReview>('pages/client-review'))?.sections?.testimonials ?? undefined;
      return (await innerPage<ApiBlog>('pages/blog', (api, page) => adaptBlog(api, page, reviews), local)) ?? local;
    }
  }
  return local;
}

/** Slugs of all pages (used to pre-render them): the bundled ones plus every service category the admin panel lists. */
export async function getPageSlugs(): Promise<string[]> {
  const slugs = new Set(Object.keys(localPages));
  if (cmsConfig.apiUrl) {
    // A list that cannot be loaded only costs the pre-rendering of the categories: they are rendered on first visit.
    const list = await fetchFromCms<ApiServiceCategoryList>('service-categories');
    for (const category of list?.categories ?? []) if (category.slug) slugs.add(`service-category/${category.slug}`);
  }
  return [...slugs];
}
