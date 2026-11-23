/**
 * GET /pages/process → the How we work page (/how-we-work) the components already render.
 *
 * Same rules as the home and Who we are adapters: content comes ONLY from the admin panel (no fallback to the bundled
 * files); content/pages/how-we-work is a template for what the API has no field for (CSS classes, the breadcrumb, the
 * navigator icons, which side each step sits on) and for the width / height of images. The order of the sections is the
 * one of that dummy page (page.json), not the API's. A section the API leaves out or switches off, or one without
 * items, is not rendered.
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiHomeSections, ApiProcess, ApiProcessSections } from './api-types';
import { SHARED_MAPPERS } from './home';
import { escape, html, isOn, paragraphsOf, pick, sharedHomeBlocks, str, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiProcessSections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const categoryHero: Mapper<'categoryHero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  const buttons = [
    { text: pick(api.button_1_text), href: pick(api.button_1_url) },
    { text: pick(api.button_2_text), href: pick(api.button_2_url) },
  ];
  return {
    ...local,
    image: local.image ? { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) } : local.image,
    heading: str(api.title),
    headingHtml: undefined,
    text: html(str(api.description)),
    // The two buttons keep the classes of the dummy ones; a button without text is not shown.
    links: local.links.flatMap((item, i) => (buttons[i]?.text ? [{ ...item, text: buttons[i].text as string, href: buttons[i].href ?? '#' }] : [])),
  };
};

/**
 * "How it works": the heading is the API `title`. The design has no line for the small label (`small_title`), so it is
 * not shown.
 */
const introContent: Mapper<'introContent'> = ({ how_it_works: api }, local) => {
  if (!api || !isOn(api)) return null;
  return {
    ...local,
    heading: str(api.title),
    paragraphs: paragraphsOf(api.description).map((text) => ({ html: escape(text).replace(/\r?\n/g, '<br/>') })),
    link: { ...local.link, href: str(api.button_url) || '#', text: str(api.button_text) },
    // `process-intro-image` fixes the picture box (see styles/base/api-image-fit.css).
    imageClass: 'rounded10 box-shadow process-intro-image',
    image: { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) },
  };
};

/**
 * Process steps: numbered rows that alternate text / picture, with a sticky navigator of icons above them. The API has
 * no navigator icon, so step N takes the (decorative) icon of dummy step N; the navigator label is the step title and
 * the anchor ids are generated (`step-1`, `step-2`, ...). The section's `description` has no line in the design.
 */
const processSteps: Mapper<'processSteps'> = ({ process_steps: api }, local) => {
  if (!api || !isOn(api)) return null;
  const steps = (api.items ?? []).filter((step) => pick(step.title) || pick(step.description) || pick(step.image));
  if (steps.length === 0 || local.steps.length === 0) return null;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    steps: steps.map((step, i) => {
      const title = str(step.title);
      const slot = local.steps[i % local.steps.length];
      return {
        id: `step-${i + 1}`,
        number: str(step.number),
        title,
        icon: slot.icon,
        navLabel: title,
        text: str(step.description),
        // Placement alternates like the dummy rows (text left / picture right, then the other way round).
        reverse: local.steps[i % Math.min(local.steps.length, 2)].reverse ?? false,
        image: { ...slot.image, src: str(step.image), alt: str(step.image_alt, step.title) },
      };
    }),
  };
};

/** Logo strip, testimonials, portfolio, technologies and blog are the home page's blocks, so they reuse the home mappers. */
const shared = (api: ApiProcessSections): ApiHomeSections =>
  sharedHomeBlocks({ logos: api.banner, testimonials: api.testimonials, portfolio: api.portfolio, technologies: api.technologies, blogs: api.blogs });

const callout: Mapper<'callout'> = (api, local) => SHARED_MAPPERS.callout({ callout: api.callout }, local);
const brandLogos: Mapper<'brandLogos'> = (api, local) => SHARED_MAPPERS.brandLogos(shared(api), local);
const testimonials: Mapper<'testimonials'> = (api, local) => SHARED_MAPPERS.testimonials(shared(api), local);
const portfolio: Mapper<'portfolio'> = (api, local) => SHARED_MAPPERS.portfolio(shared(api), local);
const technologies: Mapper<'technologies'> = (api, local) => SHARED_MAPPERS.technologies(shared(api), local);
const blog: Mapper<'blog'> = (api, local) => SHARED_MAPPERS.blog(shared(api), local);

const MAPPERS: { [K in SectionType]?: Mapper<K> } = {
  categoryHero, brandLogos, introContent, processSteps, callout, testimonials, portfolio, technologies, blog,
};

export function adaptProcess(api: ApiProcess, local: PageData): PageData {
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
