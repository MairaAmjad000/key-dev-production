/**
 * GET /service-categories/<slug> → a service category page (/service-category/<slug>) the components already render.
 *
 * Same rules as the other page adapters: every text, picture and icon comes ONLY from the admin panel (no fallback to
 * the bundled files). content/ is used as a template for what the API has no field for: CSS classes, the breadcrumb,
 * the enquiry form of the banner, the stand-in tab icons of the sticky bar and, above all, the width / height of every
 * picture and icon, so an uploaded picture sits in exactly the box of the dummy one it replaces (see
 * styles/base/api-image-fit.css for the pictures that need a box of their own).
 *
 * The page has ONE layout for every category; the order of its sections is the one chosen in
 * local-service-category.ts. A block the API leaves out or switches off, or one without items, is not rendered.
 *
 * | API block                          | Section            | Notes                                                        |
 * |------------------------------------|--------------------|--------------------------------------------------------------|
 * | `hero`                             | `categoryHero`     | `eyebrow` has no slot in the banner                          |
 * | `banners`                          | `brandLogos`       |                                                              |
 * | `introduction`                     | `introContent`     | `eyebrow` is the small line under the heading                |
 * | `offerings`                        | `serviceOfferings` | sticky tab bar + alternating picture rows                    |
 * | `services`                         | `offerGrid`        | icon cards with a button                                     |
 * | `features`                         | `advantageGrid`    | `points` are added to the text, the card has no button       |
 * | `process`                          | `process`          | `points` are the bullets of a step                           |
 * | `benefits`                         | `whyInvest`        | `subheading` + button fill the last cell                     |
 * | `frameworks`                       | `frameworkTabs`    |                                                              |
 * | `why_choose_us`                    | `whyChoose`        |                                                              |
 * | `callout`                          | `callout`          |                                                              |
 * | `portfolio`                        | `portfolio`        | shared with the home page                                    |
 * | `testimonials`                     | `testimonials`     | shared with the home page                                    |
 * | `technologies`                     | `technologies`     | shared with the home page                                    |
 * | `faq`                              | `faq`              |                                                              |
 * | top-level `blogs`                  | `blog`             | the API sends no heading for it: a neutral one is used       |
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiHomeSections, ApiServiceCategory, ApiServiceCategorySections, Maybe } from './api-types';
import { SHARED_MAPPERS } from './home';
import { escape, html, internalHref, isOn, paragraphsOf, pick, str, toSeoMeta } from './common';

interface Ctx { sections: ApiServiceCategorySections; blogs: ApiServiceCategory['blogs']; slug: string; name: string }
type Mapper<K extends SectionType> = (ctx: Ctx, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const pad = (n: number) => String(n).padStart(2, '0');
/** Link of an item: the admin's address (or "#" when it left it empty) and the label the button shows. */
const toLink = (text: Maybe<string>, href: Maybe<string>) => ({ href: internalHref(href) ?? '#', text: str(text) });

const categoryHero: Mapper<'categoryHero'> = ({ sections: { hero: api }, slug, name }, local) => {
  if (!api || !isOn(api)) return null;
  const buttons = [
    { text: pick(api.button_text_1), href: internalHref(api.button_url_1) },
    { text: pick(api.button_text_2), href: internalHref(api.button_url_2) },
  ];
  // The ids of the enquiry form are the bundled category's slug + a suffix: they follow this category's slug.
  const rename = (value: string) => value.replace(/^web-development/, slug);
  return {
    ...local,
    // Width / height stay those of the bundled banner (1920 x 800); without a picture the banner is plain.
    image: pick(api.image) && local.image ? { ...local.image, src: api.image as string, alt: str(api.image_alt, api.title) } : undefined,
    heading: str(api.title),
    headingHtml: undefined,
    text: html(str(api.description)),
    // A button keeps the classes of the dummy one; a button without text is not shown.
    links: local.links.flatMap((item, i) => (buttons[i]?.text ? [{ ...item, text: buttons[i].text as string, href: buttons[i].href ?? '#' }] : [])),
    form: local.form
      ? {
          ...local.form,
          id: rename(local.form.id),
          idPrefix: local.form.idPrefix ? rename(local.form.idPrefix) : undefined,
          errorId: rename(local.form.errorId),
          successId: rename(local.form.successId),
        }
      : undefined,
    breadcrumbs: local.breadcrumbs.map((crumb, i, all) => (i === all.length - 1 ? { ...crumb, text: str(api.title, name) } : crumb)),
  };
};

const brandLogos: Mapper<'brandLogos'> = ({ sections: { banners: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const blocks = (api.items ?? []).flatMap((item) => (pick(item.image) ? [{ image: { src: item.image as string, alt: str(item.alt) } }] : []));
  return blocks.length > 0 ? { ...local, blocks } : null;
};

const introContent: Mapper<'introContent'> = ({ sections: { introduction: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const paragraphs = paragraphsOf(api.description).map((text) => ({ html: html(text) }));
  if (!pick(api.title) && paragraphs.length === 0) return null;
  return {
    ...local,
    subheading: pick(api.eyebrow),
    heading: str(api.title),
    paragraphs,
    // A button without text is not shown.
    link: { ...local.link, ...toLink(api.button_text, api.button_url) },
    // Width / height stay those of the bundled picture (470 x 500).
    image: { ...local.image, src: str(api.image), alt: str(api.title) },
    // `category-intro-img` gives any uploaded picture that same box (styles/base/api-image-fit.css).
    imageClass: `${local.imageClass ?? 'rounded10 box-shadow'} category-intro-img`,
  };
};

/**
 * One tab + one picture row per offering. The API has no tab icon, so tab N takes the (decorative) icon of dummy row N;
 * the pictures keep the 511 x 478 box of the bundled ones, and the rows alternate sides like the bundled page does.
 */
const serviceOfferings: Mapper<'serviceOfferings'> = ({ sections: { offerings: api }, slug }, local) => {
  if (!api || !isOn(api) || local.items.length === 0) return null;
  const list = (api.items ?? []).filter((item) => pick(item.title) || pick(item.image));
  if (list.length === 0) return null;
  return {
    ...local,
    text: str(api.eyebrow),
    heading: str(api.title),
    text2: pick(api.description) ? html(str(api.description)) : undefined,
    items: list.map((item, i) => {
      const template = local.items[i % local.items.length];
      return {
        id: `${slug}-section${i + 1}`,
        navIcon: template.navIcon,
        navTitle: str(item.title),
        number: pad(i + 1),
        heading: str(item.title),
        bodyHtml: pick(item.description) ? `<div class="top-text-block"><p>${html(str(item.description))}</p></div>` : '',
        bullets: (item.points ?? []).filter((point) => pick(point)).map((point) => ({ html: escape(point) })),
        link: toLink(item.button_text, item.button_url),
        image: { ...template.image, src: str(item.image), alt: str(item.image_alt, item.title) },
        reverse: i % 2 === 0,
      };
    }),
  };
};

const offerGrid: Mapper<'offerGrid'> = ({ sections: { services: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).filter((item) => pick(item.title)).map((item) => ({
    icon: str(item.icon),
    title: str(item.title),
    text: str(item.description),
    link: toLink(item.button_text, item.button_url),
  }));
  if (items.length === 0) return null;
  return { ...local, text: str(api.eyebrow), heading: str(api.title), text2: str(api.description), items };
};

/** The card has no slot for the bullet points, so they follow the text as short sentences. */
const advantageGrid: Mapper<'advantageGrid'> = ({ sections: { features: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).filter((item) => pick(item.title)).map((item) => {
    const points = (item.points ?? []).map((point) => point.trim().replace(/[.\s]+$/, '')).filter(Boolean).map((point) => `${point}.`);
    return { icon: str(item.icon), title: str(item.title), text: escape([str(item.description), ...points].filter(Boolean).join(' ')) };
  });
  if (items.length === 0) return null;
  return { ...local, text: str(api.eyebrow), heading: str(api.title), text2: str(api.description), items };
};

/** Steps of the home page's "process" block: the title carries its number, the points are the bullets. */
const process: Mapper<'process'> = ({ sections: { process: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).filter((item) => pick(item.title)).map((item) => ({
    icon: item.icon, title: item.title, description: (item.points ?? []).join('\n'),
  }));
  if (items.length === 0) return null;
  return SHARED_MAPPERS.process({ process: { small_title: pick(api.eyebrow), title: api.title, description: api.description, items } }, local);
};

const whyInvest: Mapper<'whyInvest'> = ({ sections: { benefits: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).filter((item) => pick(item.title)).map((item) => ({ icon: str(item.icon), title: str(item.title), text: str(item.description) }));
  if (items.length === 0) return null;
  return {
    ...local,
    text: str(api.eyebrow),
    heading: str(api.title),
    text2: str(api.description),
    items,
    // The last cell: the sub heading with the button.
    ctaBox: pick(api.button_text) ? { title: str(api.subheading), link: toLink(api.button_text, api.button_url) } : undefined,
  };
};

/** The tab pictures keep the width of the bundled ones (150 px, see styles/base/api-image-fit.css). */
const frameworkTabs: Mapper<'frameworkTabs'> = ({ sections: { frameworks: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).filter((item) => pick(item.title)).map((item) => ({
    title: str(item.title),
    image: { src: str(item.image), alt: str(item.image_alt, item.title) },
    text: escape(item.description),
    link: toLink(item.button_text, item.button_url),
  }));
  if (items.length === 0) return null;
  return { ...local, text: str(api.eyebrow), heading: str(api.title), text2: str(api.description), items };
};

const whyChoose: Mapper<'whyChoose'> = ({ sections: { why_choose_us: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).filter((item) => pick(item.title)).map((item) => ({ icon: str(item.icon), title: str(item.title), text: str(item.description) }));
  if (items.length === 0) return null;
  return {
    ...local,
    text: str(api.eyebrow),
    heading: str(api.title),
    paragraphs: paragraphsOf(api.description).map((text) => ({ html: html(text) })),
    items,
  };
};

const faq: Mapper<'faq'> = ({ sections: { faq: api } }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).flatMap((item) => (pick(item.question) && pick(item.answer) ? [{ question: str(item.question), answer: html(str(item.answer)) }] : []));
  if (items.length === 0) return null;
  return { ...local, text: str(api.eyebrow), heading: str(api.title), text2: str(api.description), items };
};

/**
 * The call-out bar, work, reviews, technologies and blog are the home page's blocks: they reuse the home mappers (which
 * call the small label `small_title`). The API sends no heading for the blog block, so it gets a neutral one.
 */
const shared = ({ sections: s, blogs }: Ctx): ApiHomeSections => {
  const label = <T extends { eyebrow?: Maybe<string> }>(block: Maybe<T>) => (block ? { ...block, small_title: pick(block.eyebrow) } : block);
  return {
    callout: s.callout,
    testimonials: label(s.testimonials),
    portfolio: label(s.portfolio),
    technologies: label(s.technologies),
    blogs: { small_title: 'Blog', title: 'Latest articles', blogs },
  };
};

const callout: Mapper<'callout'> = (ctx, local) => SHARED_MAPPERS.callout(shared(ctx), local);
const portfolio: Mapper<'portfolio'> = (ctx, local) => SHARED_MAPPERS.portfolio(shared(ctx), local);
const testimonials: Mapper<'testimonials'> = (ctx, local) => SHARED_MAPPERS.testimonials(shared(ctx), local);
const technologies: Mapper<'technologies'> = (ctx, local) => SHARED_MAPPERS.technologies(shared(ctx), local);
const blog: Mapper<'blog'> = (ctx, local) => SHARED_MAPPERS.blog(shared(ctx), local);

const MAPPERS: { [K in SectionType]?: Mapper<K> } = {
  categoryHero, brandLogos, introContent, serviceOfferings, offerGrid, advantageGrid, process, whyInvest,
  frameworkTabs, whyChoose, callout, portfolio, testimonials, technologies, faq, blog,
};

/** `local` is the page template (local-service-category.ts); returns null when the API sent no category. */
export function adaptServiceCategory(api: ApiServiceCategory, local: PageData, slug: string): PageData | null {
  const category = api.category;
  if (!category) return null;
  const ctx: Ctx = { sections: category.sections ?? {}, blogs: api.blogs, slug, name: str(category.name) };
  const blocks = local.sections.flatMap((block): SectionBlock[] => {
    const mapper = MAPPERS[block.type] as Mapper<SectionType> | undefined;
    // A section type without a mapper has no API data: it is left out rather than shown with dummy content.
    if (!mapper) return [];
    const data = mapper(ctx, block.data as never);
    return data ? [{ type: block.type, data } as SectionBlock] : [];
  });
  const seo = category.seo;
  return {
    ...local,
    slug: `service-category/${slug}`,
    seo: { title: pick(seo?.meta_title), description: pick(seo?.meta_description), ...toSeoMeta(seo) },
    sections: blocks,
  };
}
