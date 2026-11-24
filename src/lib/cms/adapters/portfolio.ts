/**
 * GET /pages/portfolio → the Portfolio page (/portfolio) the components already render.
 *
 * Same rules as the other page adapters: content comes ONLY from the admin panel (no fallback to the bundled files);
 * content/pages/portfolio is a template for what the API has no field for (CSS classes, the breadcrumb, button labels,
 * the filter-bar icons) and for the width / height of images. The order of the sections is the one of that dummy page
 * (page.json), not the API's. A section the API leaves out or switches off, or one without items, is not rendered.
 *
 * | API block      | Section             |
 * |----------------|---------------------|
 * | `hero`         | `categoryHero`      |
 * | `banner`       | `brandLogos`        |
 * | `portfolio`    | `portfolioShowcase` |
 * | `callout`      | `callout`           |
 * | `testimonials` | `testimonials`      |
 * | `our_work`     | `featuredIn`        |
 * | `technologies` | `technologies`      |
 * | `blogs`        | `blog`              |
 *
 * Projects (`portfolioShowcase`): one row per project, built on the layout of the dummy page's single-picture row.
 *
 * | Project field       | In the row                                              |
 * |---------------------|---------------------------------------------------------|
 * | `title`, `tagline`  | the name and the line under it (next to the logo slot)  |
 * | `service.title`     | the tag under the name, and one tab of the filter bar   |
 * | `short_description` | the paragraphs (`description` only if it is empty)      |
 * | `project_url`       | the "View Website" button (none when the URL is empty)  |
 * | `image`             | the picture on the other side, in the 430 x 560 box     |
 *
 * The API has no project logo and no row background picture, so those two slots are left empty (the row keeps its
 * coloured overlay). Rows cycle through the dummy page's dark overlay colours and alternate sides, as the dummy rows do.
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiHomeSections, ApiPortfolio, ApiPortfolioSections, Maybe } from './api-types';
import { SHARED_MAPPERS } from './home';
import { escape, html, internalHref, isOn, pick, sharedHomeBlocks, str, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiPortfolioSections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const categoryHero: Mapper<'categoryHero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  const buttons = [
    { text: pick(api.button_1_text), href: internalHref(api.button_1_url) },
    { text: pick(api.button_2_text), href: internalHref(api.button_2_url) },
  ];
  return {
    ...local,
    // Width / height stay those of the bundled banner (1920 x 780).
    image: local.image ? { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) } : local.image,
    heading: str(api.title),
    headingHtml: undefined,
    text: html(str(api.description)),
    // The two buttons keep the classes (and the "OR" between them) of the dummy ones; a button without text is not shown.
    links: local.links.flatMap((item, i) => (buttons[i]?.text ? [{ ...item, text: buttons[i].text as string, href: buttons[i].href ?? '#' }] : [])),
  };
};

/** Overlay colours of the dummy page that are dark enough to carry white text without a background picture. */
const ROW_COLOURS = ['darkbluebg', 'purpalbg', 'fantasybg', 'squshybg', 'adanibg', 'cluedbg'];

/** A value that is safe to use as a CSS class (and in a `.class` filter selector). */
const cssName = (value: Maybe<string>) => (value ?? '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * Admin rich text ("<p>..</p><ul>..</ul>") → plain-text paragraphs, one per block element, HTML-escaped because the row
 * renders each paragraph as HTML.
 */
function paragraphsOf(value: Maybe<string>): string[] {
  return (value ?? '')
    .replace(/<\s*(?:br|\/p|\/div|\/li|\/h[1-6]|\/ul|\/ol|\/blockquote)\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .split(/\n+/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((part) => escape(part));
}

/** The category (service) of a project: a CSS class for the filter and the label of its tab. */
function serviceOf(service: { id: number; title?: Maybe<string>; slug?: Maybe<string>; icon?: Maybe<string> } | null | undefined): { key: string; title: string; icon?: string } | null {
  const title = pick(service?.title);
  const name = cssName(service?.slug) || cssName(title) || cssName(String(service?.id ?? ''));
  return title && name ? { key: `svc-${name}`, title, icon: pick(service?.icon) } : null;
}

const portfolioShowcase: Mapper<'portfolioShowcase'> = ({ portfolio: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.portfolios ?? []).filter((item) => item.status !== false && (pick(item.title) || pick(item.image)));
  if (list.length === 0) return null;

  // The button keeps the label and classes of the dummy "View Website" button.
  const button = local.items.flatMap((item) => item.links ?? []).find((link) => link.text && link.className);

  // Filter bar: "All" (a fixed label of the template) + one tab per service in order of appearance. A tab's icon is the
  // service's uploaded `icon` (an SVG is inlined so it takes the hover colours). A service the admin left without an
  // icon takes the (decorative) icon of dummy tab N, so its tab is not left bare.
  const all = local.filters[0] ?? { label: 'All', filter: '*', icon: '' };
  const icons = local.filters.slice(1);
  const services = new Map<string, { title: string; icon?: string }>();
  for (const item of list) {
    const service = serviceOf(item.service);
    if (!service) continue;
    const known = services.get(service.key);
    if (!known) services.set(service.key, { title: service.title, icon: service.icon });
    else if (!known.icon && service.icon) known.icon = service.icon;
  }
  const filters = [
    all,
    ...[...services].map(([key, service], i) => ({
      label: service.title,
      filter: `.${key}`,
      icon: service.icon ?? (icons[i % Math.max(icons.length, 1)] ?? all).icon,
    })),
  ];

  return {
    ...local,
    filters,
    items: list.map((item, i) => {
      const service = serviceOf(item.service);
      const href = pick(item.project_url);
      const paragraphs = paragraphsOf(item.short_description);
      return {
        id: pick(item.slug) ?? `project-${item.id}`,
        classes: [ROW_COLOURS[i % ROW_COLOURS.length], service?.key].filter(Boolean).join(' '),
        // Rows alternate sides, starting on the right like the dummy page.
        reverse: i % 2 === 0,
        // No API field for a logo or a row background: both slots stay empty.
        logo: { src: '', alt: '' },
        logoText: { name: str(item.title), tagline: str(item.tagline) },
        tags: service ? [service.title] : [],
        paragraphs: paragraphs.length > 0 ? paragraphs : paragraphsOf(item.description).slice(0, 2),
        // Only real web addresses become a button (never a `javascript:` link).
        links: href && /^https?:\/\//i.test(href) && button ? [{ href, text: button.text, className: button.className }] : [],
        // One picture, shown in the 430 x 560 box of the dummy device pictures (see portfolio-showcase.css).
        thumb: { layout: 'single' as const, images: pick(item.image) ? [item.image as string] : [], alt: str(item.image_alt, item.title) },
      };
    }),
  };
};

/**
 * "Featured in" strip: a row of pictures with an intro. The pictures keep the width / height of the bundled logos
 * (159 x 90) and shrink to fit, so an uploaded picture of any shape takes the same place.
 */
const featuredIn: Mapper<'featuredIn'> = ({ our_work: api }, local) => {
  if (!api || !isOn(api)) return null;
  const size = local.logos[0]?.image;
  const logos = (api.items ?? []).flatMap((item) =>
    pick(item.image) ? [{ image: { src: item.image as string, alt: str(item.alt), width: size?.width ?? '159', height: size?.height ?? '90' } }] : [],
  );
  if (logos.length === 0) return null;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    text2: str(api.description),
    imageClass: 'featured-in-logo',
    logos,
  };
};

/** The logo strip, callout, testimonials, the tabbed technologies block and blog are the home page's blocks, so they reuse the home mappers. */
const shared = (api: ApiPortfolioSections): ApiHomeSections => ({
  ...sharedHomeBlocks({ logos: api.banner, testimonials: api.testimonials, technologies: api.technologies, blogs: api.blogs }),
  callout: api.callout,
});

const brandLogos: Mapper<'brandLogos'> = (api, local) => SHARED_MAPPERS.brandLogos(shared(api), local);
const callout: Mapper<'callout'> = (api, local) => SHARED_MAPPERS.callout(shared(api), local);
const testimonials: Mapper<'testimonials'> = (api, local) => SHARED_MAPPERS.testimonials(shared(api), local);
const technologies: Mapper<'technologies'> = (api, local) => SHARED_MAPPERS.technologies(shared(api), local);
const blog: Mapper<'blog'> = (api, local) => SHARED_MAPPERS.blog(shared(api), local);

const MAPPERS: { [K in SectionType]?: Mapper<K> } = {
  categoryHero, brandLogos, portfolioShowcase, callout, testimonials, featuredIn, technologies, blog,
};

export function adaptPortfolio(api: ApiPortfolio, local: PageData): PageData {
  const sections = api.sections ?? {};
  const blocks = local.sections.flatMap((block): SectionBlock[] => {
    const mapper = MAPPERS[block.type] as Mapper<SectionType> | undefined;
    // A section type without a mapper has no API data: it is left out rather than shown with dummy content.
    if (!mapper) return [];
    const data = mapper(sections, block.data as never);
    return data ? [{ type: block.type, data } as SectionBlock] : [];
  });
  const seo = api.seo;
  return {
    ...local,
    seo: { title: pick(seo?.meta_title), description: pick(seo?.meta_description), ...toSeoMeta(seo) },
    sections: blocks,
  };
}
