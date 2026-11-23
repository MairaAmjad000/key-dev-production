/**
 * GET /pages/technology → the Technologies page (/technologies) the components already render.
 *
 * Same rules as the other page adapters: content comes ONLY from the admin panel (no fallback to the bundled files);
 * content/pages/technologies is a template for what the API has no field for (CSS classes, the breadcrumb, the
 * navigator icons) and for the width / height of images. The order of the sections is the one of that dummy page
 * (page.json), not the API's. A section the API leaves out or switches off, or one without items, is not rendered.
 *
 * | API block      | Section            |
 * |----------------|--------------------|
 * | `hero`         | `categoryHero`     |
 * | `technologies` | `technologyGroups` |
 * | `callout`      | `callout`          |
 * | `testimonials` | `testimonials`     |
 * | `featured_in`  | `featuredIn`       |
 * | `blogs`        | `blog`             |
 * | `technologies` | `technologies`     |
 *
 * The API has a single `technologies` block, and it feeds two sections: the logo groups under the tab bar (one group
 * per technology) and the tabbed "Technologies we Use" block at the end of the page (one tab per technology, headed by
 * the block's own small title / title).
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiHomeSections, ApiTechnology, ApiTechnologySections } from './api-types';
import { SHARED_MAPPERS } from './home';
import { html, internalHref, isOn, pick, sharedHomeBlocks, str, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiTechnologySections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const categoryHero: Mapper<'categoryHero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  const buttons = [{ text: pick(api.button_text), href: internalHref(api.button_link) }];
  return {
    ...local,
    // Width / height stay those of the bundled banner (1920 x 800).
    image: local.image ? { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) } : local.image,
    heading: str(api.title),
    headingHtml: undefined,
    text: html(str(api.description)),
    // The button keeps the classes of the dummy one; a button without text is not shown.
    links: local.links.flatMap((item, i) => (buttons[i]?.text ? [{ ...item, text: buttons[i].text as string, href: buttons[i].href ?? '#' }] : [])),
  };
};

/**
 * Logo groups under the sticky tab bar: technology N of the API fills group N. The tab and the heading are the
 * technology's title; the API has no intro line per technology, so none is shown. The API has no tab icon, so tab N
 * takes the (decorative) icon of dummy group N. Uploaded logos sit in the same square box as the bundled ones
 * (`technology-logo`, see styles/base/api-image-fit.css).
 */
const technologyGroups: Mapper<'technologyGroups'> = ({ technologies: api }, local) => {
  if (!api || !isOn(api) || local.groups.length === 0) return null;
  const list = (api.technologies ?? []).filter((item) => pick(item.title) || (item.images ?? []).length > 0);
  if (list.length === 0) return null;
  return {
    ...local,
    groups: list.map((item, i) => ({
      id: `section${i + 1}`,
      navIcon: local.groups[i % local.groups.length].navIcon,
      navTitle: str(item.title),
      heading: str(item.title),
      text: '',
      imageClass: 'technology-logo',
      logos: (item.images ?? []).flatMap((image) => (pick(image.url) ? [{ src: image.url as string, alt: str(image.alt, item.title) }] : [])),
    })),
  };
};

/**
 * "Featured in" strip: a row of logos with an intro. The logos keep the width / height of the bundled ones (159 x 90)
 * and shrink to fit, so an uploaded logo of any shape takes the same place.
 */
const featuredIn: Mapper<'featuredIn'> = ({ featured_in: api }, local) => {
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

/** Callout, testimonials, the tabbed technologies block and blog are the home page's blocks, so they reuse the home mappers. */
const shared = (api: ApiTechnologySections): ApiHomeSections => ({
  ...sharedHomeBlocks({ testimonials: api.testimonials, technologies: api.technologies, blogs: api.blogs }),
  callout: api.callout,
});

const callout: Mapper<'callout'> = (api, local) => SHARED_MAPPERS.callout(shared(api), local);
const technologies: Mapper<'technologies'> = (api, local) => SHARED_MAPPERS.technologies(shared(api), local);
const testimonials: Mapper<'testimonials'> = (api, local) => SHARED_MAPPERS.testimonials(shared(api), local);
const blog: Mapper<'blog'> = (api, local) => SHARED_MAPPERS.blog(shared(api), local);

const MAPPERS: { [K in SectionType]?: Mapper<K> } = {
  categoryHero, technologyGroups, callout, testimonials, featuredIn, technologies, blog,
};

export function adaptTechnology(api: ApiTechnology, local: PageData): PageData {
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
