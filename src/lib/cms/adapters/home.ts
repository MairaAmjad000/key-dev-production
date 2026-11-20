/**
 * GET /home → the home page the components already render.
 *
 * Content comes ONLY from the admin panel: there is no fallback to the bundled content/ files. The bundled data
 * is used purely as a template for things the admin panel does not control: CSS classes, fixed markup, button
 * labels the API has no field for, and the width / height attributes of images, so an uploaded picture or icon
 * occupies exactly the box of the placeholder it replaces.
 *
 * The order of the sections is the one of content/pages/home/page.json. A section the API leaves out (or switches
 * off), or one without any items, is not rendered.
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiHome, ApiHomeSections } from './api-types';
import { cycle, isOn, path, pick, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiHomeSections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const digits = (value: string | null | undefined) => (value ?? '').replace(/[^\d.]/g, '');
/** API string or '' (never a bundled value). */
const str = (...values: Array<string | null | undefined>) => pick(...values) ?? '';
const escape = (value: string | null | undefined) => (value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const hero: Mapper<'hero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  const buttons = [
    { text: pick(api.button_1), href: pick(api.button_url1, api['button_url1 ']) },
    { text: pick(api.button_2), href: pick(api.button_url2) },
  ];
  return {
    ...local,
    image: { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) },
    heading: str(api.title),
    text: str(api.subtitle),
    links: local.links.flatMap((item, i) => (buttons[i]?.text ? [{ ...item, text: buttons[i].text as string, href: buttons[i].href ?? '#' }] : [])),
  };
};

const brandLogos: Mapper<'brandLogos'> = ({ banner }) => {
  if (!banner || !isOn(banner)) return null;
  const blocks = (banner.items ?? []).flatMap((item) => (pick(item.image) ? [{ image: { src: pick(item.image) as string, alt: '' } }] : []));
  return blocks.length > 0 ? { blocks } : null;
};

const about: Mapper<'about'> = ({ about: api, statistics }, local) => {
  if (!api || !isOn(api)) return null;
  const stats = statistics && isOn(statistics) ? statistics.items ?? [] : [];
  const size = local.items[0]?.image;
  return {
    ...local,
    image: { ...local.image, src: str(api.image) },
    image2: { ...local.image2, src: str(api.side_image), alt: str(api.side_image_alt, api.title) },
    text: str(api.small_title),
    heading: str(api.title),
    heading2: '',
    texts: pick(api.description) ? (api.description as string).split(/\n{2,}/).map((text) => ({ text: text.trim() })).filter((item) => item.text) : [],
    items: stats.map((stat, i) => {
      const number = stat.number ?? '';
      const suffix = number.endsWith('%') ? 'fas fa-percent' : number.endsWith('+') ? 'fas fa-plus' : '';
      return {
        image: { src: str(stat.icon), alt: str(stat.title), width: size?.width ?? '50', height: size?.height ?? '50' },
        counter: { dataCount: digits(number) || '0', text: digits(number) || '0' },
        icon: { className: suffix },
        text: str(stat.title),
      };
    }),
  };
};

/**
 * Offerings: the five tab panels are fixed markup, so API item N fills panel N (extra items are not shown, panels
 * without an item are not rendered). Sub-service icon links inside a panel have no API field and are left out.
 */
const offerings: Mapper<'offerings'> = ({ offerings: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = (api.items ?? []).slice(0, local.items.length);
  if (items.length === 0) return null;

  const data: SectionDataMap['offerings'] = {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    text2: str(api.description),
    items: local.items.slice(0, items.length).map((tab, i) => ({
      link: { ...tab.link, icon: str(items[i].icon), text: str(items[i].tab_title, items[i].title) },
    })),
    items2: [], items3: [], items4: [],
    or: '',
  };
  // Every tab image uses the box of the first (458 x 399) so all five panels keep the same size.
  const first = (data as unknown as { image?: { width?: string; height?: string } }).image;
  const panels = [
    { image: 'image', link: 'link', sub: 'text3', texts: 'texts', button: 'link2' },
    { image: 'image2', link: 'link3', sub: 'text4', texts: 'texts2', button: 'link5' },
    { image: 'image3', link: 'link6', sub: 'text5', texts: 'texts3', button: 'link8' },
    { image: 'image4', link: 'link9', sub: 'text6', texts: 'texts4', button: 'link10' },
    { image: 'image5', link: 'link11', sub: 'text7', texts: 'texts5', button: 'link12' },
  ] as const;
  const out = data as unknown as Record<string, { src?: string; alt?: string; href?: string; text?: string; width?: string; height?: string } | string | Array<{ text: string }>>;
  panels.forEach((panel, i) => {
    const item = items[i] ?? {};
    const image = out[panel.image] as { src: string; alt: string; width?: string; height?: string } | undefined;
    if (image) out[panel.image] = { ...image, width: first?.width, height: first?.height, src: str(item.image), alt: str(item.title) };
    out[panel.link] = { href: str(item.button_link), text: str(item.title) };
    out[panel.sub] = str(item.subtitle);
    out[panel.texts] = pick(item.description) ? (item.description as string).split(/\n{2,}/).map((text) => ({ text: text.trim() })).filter((part) => part.text) : [];
    out[panel.button] = { href: str(item.button_link), text: str(item.button_text) };
  });
  return data;
};

const industries: Mapper<'industries'> = ({ industries: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = api.items ?? [];
  if (items.length === 0) return null;
  const label = local.blocks[0]?.link.text ?? '';
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    text2: str(api.description),
    blocks: items.map((item) => ({
      icon: str(item.icon),
      subheading: str(item.title),
      text: str(item.description),
      link: { href: str(item.url, item.link, item.button_link) || '#', text: label },
    })),
  };
};

const values: Mapper<'values'> = ({ value: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = api.items ?? [];
  if (items.length === 0) return null;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    text2: str(api.description),
    items: items.map((item) => ({ icon: str(item.icon), subheading: str(item.title), text: str(item.description) })),
  };
};

const callout: Mapper<'callout'> = ({ callout: api }, local) => {
  if (!api || !isOn(api)) return null;
  const words = (api.typed_words ?? []).map((item) => item.word).filter(Boolean);
  const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const typed = `<span id="callouts-type"${words.length > 0 ? ` data-strings="${esc(JSON.stringify(words))}"` : ''}></span>`;
  return {
    ...local,
    text: `${esc(str(api.text_before))} ${typed} ${esc(str(api.text_after))}`.trim(),
    link: { href: str(api.button_url), text: str(api.button_text) },
  };
};

/** Process: steps fill the markup slots in reading order (4 in the first row, 1 + 2 in the second row, all in the mobile slider). */
const process: Mapper<'process'> = ({ process: api }, local) => {
  if (!api || !isOn(api)) return null;
  const steps = (api.items ?? []).map((step) => ({
    icon: str(step.icon),
    subheading: [pick(step.number), pick(step.title)].filter(Boolean).join(' '),
    items: pick(step.description) ? [{ html: `<i class="fas fa-chevron-right"></i>${escape(step.description)}` }] : [],
  }));
  if (steps.length === 0) return null;
  const first = local.processItemsList.length;
  const second = steps[first];
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    text2: str(api.description),
    processItemsList: local.processItemsList.slice(0, steps.length).map((slot, i) => ({ ...slot, icon2: steps[i].icon, subheading: steps[i].subheading, items: steps[i].items })),
    icon: second?.icon ?? '',
    subheading: second?.subheading ?? '',
    items: second?.items ?? [],
    processItemsList2: local.processItemsList2.slice(0, Math.max(0, steps.length - first - 1)).map((slot, i) => {
      const step = steps[first + 1 + i];
      return { ...slot, icon: step.icon, subheading: step.subheading, items: step.items };
    }),
    items2: steps,
  };
};

const testimonials: Mapper<'testimonials'> = ({ testimonials: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.testimonials ?? []).filter((item) => item.status !== false);
  if (list.length === 0) return null;
  const size = local.items[0]?.testImg;
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    text2: str(api.description),
    items: list.map((item, i) => ({
      testImg: {
        href: size?.href ?? 'javascript:;',
        title: str(item.name),
        dataSlide: String(i + 1),
        className: i === 0 ? 'active test-img' : 'test-img',
        image: { src: str(item.image), alt: str(item.name), width: size?.image.width ?? '71', height: size?.image.height ?? '71' },
      },
    })),
    image: { ...local.image, src: str(list[0]?.image), alt: str(list[0]?.name) },
    testimonialTextSections: list.map((item, i) => ({
      dataIndex: String(i + 1),
      text: str(item.review),
      text2: [`<strong>${escape(item.name)}</strong>`, escape(item.designation), escape(item.company)].filter((part) => part && part !== '<strong></strong>').join(', '),
    })),
  };
};

const portfolio: Mapper<'portfolio'> = ({ portfolio: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.portfolios ?? []).filter((item) => item.status !== false);
  if (list.length === 0) return null;
  const size = local.items[0]?.image;
  const label = local.items[0]?.link?.text ?? '';
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    text2: str(api.description),
    items: list.map((item) => ({
      heading: str(item.title),
      text: str(item.tagline, item.short_description),
      image: { src: str(item.image), alt: str(item.image_alt, item.title), width: size?.width, height: size?.height },
      heading2: str(item.title),
      text2: str(item.short_description, item.tagline),
      link: { href: path('/portfolio', item.slug), text: label },
    })),
  };
};

const technologies: Mapper<'technologies'> = ({ technologies: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = api.technologies ?? [];
  if (list.length === 0) return null;
  const slug = (item: (typeof list)[number]) => item.slug || `technology-${item.id}`;
  const [first, ...rest] = list;
  const size = local.blocks[0]?.items[0]?.image;
  return {
    ...local,
    link2: { ...local.link2, text: str(api.small_title), heading: str(api.title) },
    link6: { href: '#mobile-technologies', text: str(first.title) },
    items: rest.map((item) => ({ link: { id: `${slug(item)}-tab`, href: `#${slug(item)}`, ariaControls: slug(item), text: str(item.title) } })),
    blocks: list.map((item, i) => ({
      className: i === 0 ? 'tab-pane fade show active' : 'tab-pane fade',
      id: i === 0 ? 'mobile-technologies' : slug(item),
      ariaLabelledby: i === 0 ? 'mobile-technologies-tab' : `${slug(item)}-tab`,
      items: (item.images ?? []).flatMap((image) =>
        pick(image.url) ? [{ image: { src: image.url as string, title: str(image.alt), alt: str(image.alt), width: size?.width ?? '78', height: size?.height ?? '78' } }] : [],
      ),
    })),
  };
};

const blog: Mapper<'blog'> = ({ blogs: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.blogs ?? []).filter((item) => item.status !== false);
  if (list.length === 0) return null;
  const template = local.items[0];
  return {
    ...local,
    text: str(api.small_title),
    heading: str(api.title),
    items: list.map((item) => {
      const href = path('/blog', item.slug);
      return {
        blogPostFeatureLink: {
          href,
          title: str(item.title),
          image: { src: str(item.image), alt: str(item.image_alt, item.title), width: template?.blogPostFeatureLink.image.width ?? '370', height: template?.blogPostFeatureLink.image.height ?? '193' },
        },
        link: { href, text: str(item.title) },
        text: str(item.short_description),
        datePost: template?.datePost ?? '',
        link2: { href, title: template?.link2.title ?? '' },
      };
    }),
  };
};

/** Home section type → mapper. `whatsAppAnchor` has no API section and always stays. */
const MAPPERS: { [K in SectionType]?: Mapper<K> } = {
  hero, brandLogos, about, offerings, industries, values, callout, process, testimonials, portfolio, technologies, blog,
};

export function adaptHome(api: ApiHome, local: PageData): PageData {
  const sections = api.sections ?? {};
  const blocks = local.sections.flatMap((block): SectionBlock[] => {
    const mapper = MAPPERS[block.type] as Mapper<SectionType> | undefined;
    if (!mapper) return [block];
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
