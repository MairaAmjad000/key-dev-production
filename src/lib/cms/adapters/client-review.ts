/**
 * GET /pages/client-review → the Client Review page (/client-review) the components already render.
 *
 * Same rules as the home, Who we are and How we work adapters: content comes ONLY from the admin panel (no fallback to
 * the bundled files); content/pages/client-review is a template for what the API has no field for (CSS classes, the
 * breadcrumb, the "Rated By Client" label, the Clutch widget settings) and for the width / height of images. The order
 * of the sections is the one of that dummy page (page.json), not the API's. A section the API leaves out or switches
 * off, or one without items, is not rendered.
 *
 * | API block      | Section        |
 * |----------------|----------------|
 * | `hero`         | `categoryHero` |
 * | `banner`       | `brandLogos`   |
 * | `clutch`       | `clutchReviews`|
 * | `testimonials` | `clientReviews`|
 * | `technologies` | `technologies` |
 * | `blogs`        | `blog`         |
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiClientReview, ApiClientReviewSections, ApiHomeSections } from './api-types';
import { SHARED_MAPPERS } from './home';
import { html, isOn, pick, sharedHomeBlocks, str, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiClientReviewSections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const categoryHero: Mapper<'categoryHero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  const buttons = [
    { text: pick(api.button_1_text), href: pick(api.button_1_url) },
    { text: pick(api.button_2_text), href: pick(api.button_2_url) },
  ];
  return {
    ...local,
    // Width / height stay those of the bundled banner (1920 x 800).
    image: local.image ? { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) } : local.image,
    heading: str(api.title),
    headingHtml: undefined,
    text: html(str(api.description)),
    // The two buttons keep the classes of the dummy ones; a button without text is not shown.
    links: local.links.flatMap((item, i) => (buttons[i]?.text ? [{ ...item, text: buttons[i].text as string, href: buttons[i].href ?? '#' }] : [])),
  };
};

/**
 * Clutch block: the admin only supplies the texts. The Clutch.co widget itself (company id, widget type, ...) has no
 * API field, so it keeps the settings of the bundled page.
 */
const clutchReviews: Mapper<'clutchReviews'> = ({ clutch: api }, local) => {
  if (!api || !isOn(api)) return null;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    paragraph: str(api.description),
  };
};

/**
 * Testimonial cards: one card per testimonial. The API has no country, so the line after the name shows the
 * designation and the company; "Rated By Client" is the bundled label. The round photo is a fixed 120 x 120 box
 * (`.tideway-image`, object-fit: cover), so an uploaded picture of any shape sits in the same circle.
 */
const clientReviews: Mapper<'clientReviews'> = ({ testimonials: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.testimonials ?? []).filter((item) => item.status !== false);
  if (list.length === 0) return null;
  const template = local.items[0];
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    paragraph: str(api.description),
    items: list.map((item) => {
      const rating = Number(item.rating);
      return {
        image: { ...template?.image, src: str(item.image), alt: str(item.name) },
        name: str(item.name),
        country: [pick(item.designation), pick(item.company)].filter(Boolean).join(', '),
        ratedByText: template?.ratedByText ?? '',
        rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.round(rating))) : 0,
        text: html(str(item.review)),
      };
    }),
  };
};

/** Logo strip, technologies and blog are the home page's blocks, so they reuse the home mappers. */
const shared = (api: ApiClientReviewSections): ApiHomeSections =>
  sharedHomeBlocks({ logos: api.banner, technologies: api.technologies, blogs: api.blogs });

const brandLogos: Mapper<'brandLogos'> = (api, local) => SHARED_MAPPERS.brandLogos(shared(api), local);
const technologies: Mapper<'technologies'> = (api, local) => SHARED_MAPPERS.technologies(shared(api), local);
const blog: Mapper<'blog'> = (api, local) => SHARED_MAPPERS.blog(shared(api), local);

const MAPPERS: { [K in SectionType]?: Mapper<K> } = {
  categoryHero, brandLogos, clutchReviews, clientReviews, technologies, blog,
};

export function adaptClientReview(api: ApiClientReview, local: PageData): PageData {
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
