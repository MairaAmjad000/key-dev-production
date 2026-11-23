/**
 * GET /pages/about → the Who we are page (/who-we-are) the components already render.
 *
 * Same rules as the home adapter: content comes ONLY from the admin panel (no fallback to the bundled files). The
 * bundled content/pages/who-we-are data is a template for what the API has no field for (CSS classes, fixed
 * markup, the breadcrumb, the history icon, which side each leader sits on) and for the width / height of
 * images, so an uploaded picture or icon takes the box of the dummy it replaces (see styles/base/api-image-fit.css
 * and styles/base/cms-icons.css for the pictures and icons that are sized by CSS).
 *
 * The order of the sections is the one of content/pages/who-we-are/page.json (the dummy page), not the API's.
 * A section the API leaves out or switches off, or one without items, is not rendered. The API's `callout` block
 * has no place in the Who we are design and is ignored.
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiAbout, ApiAboutSections, ApiHomeSections } from './api-types';
import { SHARED_MAPPERS } from './home';
import { escape, html, isOn, paragraphsOf, pick, sharedHomeBlocks, str, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiAboutSections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const digits = (value: string | null | undefined) => (value ?? '').replace(/[^\d.]/g, '');

const categoryHero: Mapper<'categoryHero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  const title = str(api.title);
  const subtitle = str(api.subtitle);
  return {
    ...local,
    image: local.image ? { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) } : local.image,
    heading: title,
    // The banner styles the <span> as the small teal label above the heading ("Who we are" over the title).
    headingHtml: subtitle ? `<span>${escape(subtitle)}</span> ${escape(title)}` : undefined,
    text: html(str(api.description)),
  };
};

const introContent: Mapper<'introContent'> = ({ about: api }, local) => {
  if (!api || !isOn(api)) return null;
  return {
    ...local,
    heading: str(api.title),
    paragraphs: paragraphsOf(api.description).map((text) => ({ html: escape(text).replace(/\r?\n/g, '<br/>') })),
    link: { ...local.link, href: str(api.button_url) || '#', text: str(api.button_text) },
    image: { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) },
  };
};

const statsCounters: Mapper<'statsCounters'> = ({ statistics: api }, local) => {
  if (!api || !isOn(api)) return null;
  const stats = (api.items ?? []).filter((stat) => pick(stat.number) || pick(stat.title));
  if (stats.length === 0) return null;
  return {
    ...local,
    items: stats.map((stat) => {
      const number = (stat.number ?? '').trim();
      return {
        // The counter icon is a 55px-wide picture (see about-page.css), so any uploaded SVG / image fits the same slot.
        image: { src: str(stat.icon), alt: '' },
        count: digits(number) || '0',
        // The sign after the number is a Font Awesome glyph: "120+" → plus, "90%" → percent.
        iconClass: number.endsWith('%') ? 'fas fa-percent' : number.endsWith('+') ? 'fas fa-plus' : '',
        text: escape(str(stat.title)),
      };
    }),
  };
};

/**
 * Leadership: portrait + bio per person. The design alternates the sides (text left / picture right, then the
 * other way round), so person N takes the placement classes of dummy person N mod 2. The API has no social links.
 */
const leadership: Mapper<'leadership'> = ({ leadership: api }, local) => {
  if (!api || !isOn(api)) return null;
  const people = (api.items ?? []).filter((person) => pick(person.name) || pick(person.image));
  if (people.length === 0 || local.people.length === 0) return null;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    paragraph: str(api.description),
    people: people.map((person, i) => {
      const slot = local.people[i % Math.min(local.people.length, 2)];
      const name = str(person.name);
      return {
        name,
        image: { ...slot.image, src: str(person.image), alt: name },
        rowClass: slot.rowClass,
        imageColClass: slot.imageColClass,
        contentColClass: slot.contentColClass,
        title: [pick(person.name), pick(person.designation)].filter(Boolean).join(', '),
        paragraphs: paragraphsOf(person.description).map((text) => escape(text).replace(/\r?\n/g, '<br/>')),
        social: [],
      };
    }),
  };
};

const missionVision: Mapper<'missionVision'> = ({ mission_vision: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = api.items ?? [];
  if (items.length === 0) return null;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    paragraph: str(api.description),
    items: items.map((item) => ({ icon: str(item.icon), title: str(item.title), text: str(item.description) })),
  };
};

const coreValues: Mapper<'coreValues'> = ({ values: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = api.items ?? [];
  if (items.length === 0) return null;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    paragraph: str(api.description),
    items: items.map((item) => ({ icon: str(item.icon), title: str(item.title), text: str(item.description) })),
  };
};

/** History: the year cards and the year strip are built from the same list. The corner glyph is fixed markup (one icon for every year). */
const historyTimeline: Mapper<'historyTimeline'> = ({ history: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).filter((item) => pick(item.year) || pick(item.title));
  if (items.length === 0) return null;
  const glyph = local.items[0]?.icon ?? '';
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    paragraph: str(api.description),
    image: { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) },
    items: items.map((item) => ({ year: str(item.year), title: str(item.title), icon: glyph, text: str(item.description) })),
  };
};

/** Testimonials, portfolio, technologies and the featured-projects logo strip are the home page's blocks, so they reuse the home mappers. */
const shared = (api: ApiAboutSections): ApiHomeSections =>
  sharedHomeBlocks({ logos: api.featured_projects, testimonials: api.testimonials, portfolio: api.portfolio, technologies: api.technologies });

const brandLogos: Mapper<'brandLogos'> = (api, local) => SHARED_MAPPERS.brandLogos(shared(api), local);
const testimonials: Mapper<'testimonials'> = (api, local) => SHARED_MAPPERS.testimonials(shared(api), local);
const portfolio: Mapper<'portfolio'> = (api, local) => SHARED_MAPPERS.portfolio(shared(api), local);
const technologies: Mapper<'technologies'> = (api, local) => SHARED_MAPPERS.technologies(shared(api), local);

const MAPPERS: { [K in SectionType]?: Mapper<K> } = {
  categoryHero, brandLogos, introContent, statsCounters, leadership, missionVision, coreValues, historyTimeline,
  testimonials, portfolio, technologies,
};

export function adaptAbout(api: ApiAbout, local: PageData): PageData {
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
