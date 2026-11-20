/**
 * GET /home → the home page the components already render.
 *
 * The order of the sections is the one of content/pages/home/page.json. A section the API leaves out (or
 * switches off) is not rendered; fields the API has no value for keep the bundled content/ value.
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiHome, ApiHomeSections } from './api-types';
import { cycle, isOn, path, pick, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiHomeSections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const digits = (value: string | null | undefined) => (value ?? '').replace(/[^\d.]/g, '');

const hero: Mapper<'hero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  const buttons = [
    { text: pick(api.button_1), href: pick(api.button_url1, api['button_url1 ']) },
    { text: pick(api.button_2), href: pick(api.button_url2) },
  ];
  return {
    ...local,
    image: { src: pick(api.image) ?? local.image.src, alt: '' },
    heading: pick(api.title) ?? local.heading,
    text: pick(api.subtitle) ?? local.text,
    links: local.links.map((item, i) => ({ ...item, text: buttons[i]?.text ?? item.text, href: buttons[i]?.href ?? item.href })),
  };
};

const brandLogos: Mapper<'brandLogos'> = ({ banner }, local) => {
  if (!banner || !isOn(banner)) return null;
  const blocks = (banner.items ?? []).flatMap((item) => (pick(item.image) ? [{ image: { src: pick(item.image) as string, alt: '' } }] : []));
  return blocks.length > 0 ? { blocks } : local;
};

const about: Mapper<'about'> = ({ about: api, statistics }, local) => {
  if (!api || !isOn(api)) return null;
  const stats = statistics?.items ?? [];
  return {
    ...local,
    image: { src: pick(api.image) ?? local.image.src },
    image2: { ...local.image2, src: pick(api.side_image) ?? local.image2.src, alt: '' },
    text: pick(api.small_title) ?? local.text,
    heading: pick(api.title) ?? local.heading,
    heading2: '',
    texts: pick(api.description) ? (api.description as string).split(/\n{2,}/).map((text) => ({ text: text.trim() })).filter((item) => item.text) : local.texts,
    items:
      stats.length > 0
        ? stats.map((stat, i) => {
            const template = cycle(local.items, i);
            const number = stat.number ?? '';
            const suffix = number.endsWith('%') ? 'fas fa-percent' : number.endsWith('+') ? 'fas fa-plus' : '';
            return {
              image: { src: pick(stat.icon) ?? template?.image.src ?? '', alt: '', width: template?.image.width ?? '50', height: template?.image.height ?? '50' },
              counter: { dataCount: digits(number) || template?.counter.dataCount || '0', text: digits(number) || template?.counter.text || '0' },
              icon: { className: suffix },
              text: pick(stat.title) ?? template?.text ?? '',
            };
          })
        : local.items,
  };
};

/** Offerings: the five tab panels are fixed markup, so API item N fills panel N and only the API's tabs are listed. */
const offerings: Mapper<'offerings'> = ({ offerings: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = api.items ?? [];
  const data = { ...local };
  data.text = pick(api.small_title) ?? local.text;
  data.heading = pick(api.title) ?? local.heading;
  data.text2 = pick(api.description) ?? local.text2;
  if (items.length === 0) return data;

  data.items = local.items.slice(0, items.length).map((tab, i) => ({
    link: { ...tab.link, text: pick(items[i]?.tab_title) ?? tab.link.text },
  }));
  const panels = [
    { image: 'image', link: 'link', sub: 'text3', texts: 'texts', button: 'link2' },
    { image: 'image2', link: 'link3', sub: 'text4', texts: 'texts2', button: 'link5' },
    { image: 'image3', link: 'link6', sub: 'text5', texts: 'texts3', button: 'link8' },
    { image: 'image4', link: 'link9', sub: 'text6', texts: 'texts4', button: 'link10' },
    { image: 'image5', link: 'link11', sub: 'text7', texts: 'texts5', button: 'link12' },
  ] as const;
  const out = data as unknown as Record<string, { src?: string; alt?: string; href?: string; text?: string } | string | Array<{ text: string }>>;
  panels.forEach((panel, i) => {
    const item = items[i];
    if (!item) return;
    const image = out[panel.image] as { src: string; alt: string } | undefined;
    if (image) out[panel.image] = { ...image, src: pick(item.image) ?? image.src, alt: '' };
    const link = out[panel.link] as { href: string; text: string } | undefined;
    if (link) out[panel.link] = { href: pick(item.button_link) ?? link.href, text: pick(item.title) ?? link.text };
    if (pick(item.subtitle)) out[panel.sub] = item.subtitle as string;
    if (pick(item.description)) out[panel.texts] = [{ text: item.description as string }];
    const button = out[panel.button] as { href: string; text: string } | undefined;
    if (button) out[panel.button] = { href: pick(item.button_link) ?? button.href, text: pick(item.button_text) ?? button.text };
  });
  return data;
};

const industries: Mapper<'industries'> = ({ industries: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = api.items ?? [];
  return {
    ...local,
    text: pick(api.small_title) ?? local.text,
    heading: pick(api.title) ?? local.heading,
    text2: pick(api.description) ?? local.text2,
    blocks: items.length > 0
      ? items.map((item, i) => {
          const template = cycle(local.blocks, i);
          return {
            icon: template?.icon ?? '',
            subheading: pick(item.title) ?? template?.subheading ?? '',
            text: pick(item.description) ?? template?.text ?? '',
            link: template?.link ?? { href: '/contact', text: 'Explore More' },
          };
        })
      : local.blocks,
  };
};

const values: Mapper<'values'> = ({ value: api }, local) => {
  if (!api || !isOn(api)) return null;
  const items = api.items ?? [];
  return {
    ...local,
    text: pick(api.small_title) ?? local.text,
    heading: pick(api.title) ?? local.heading,
    text2: pick(api.description) ?? local.text2,
    items: items.length > 0
      ? items.map((item, i) => ({
          icon: cycle(local.items, i)?.icon ?? '',
          subheading: pick(item.title) ?? cycle(local.items, i)?.subheading ?? '',
          text: pick(item.description) ?? cycle(local.items, i)?.text ?? '',
        }))
      : local.items,
  };
};

const callout: Mapper<'callout'> = ({ callout: api }, local) => {
  if (!api || !isOn(api)) return null;
  const words = (api.typed_words ?? []).map((item) => item.word).filter(Boolean);
  const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const typed = `<span id="callouts-type"${words.length > 0 ? ` data-strings="${esc(JSON.stringify(words))}"` : ''}></span>`;
  const hasText = pick(api.text_before) || pick(api.text_after) || words.length > 0;
  return {
    ...local,
    text: hasText ? `${esc(pick(api.text_before) ?? '')} ${typed} ${esc(pick(api.text_after) ?? '')}`.trim() : local.text,
    link: { href: pick(api.button_url) ?? local.link.href, text: pick(api.button_text) ?? local.link.text },
  };
};

/** Process: steps fill the bundled slots in reading order (4 in the first row, 1 + 2 in the second row, all in the mobile slider). */
const process: Mapper<'process'> = ({ process: api }, local) => {
  if (!api || !isOn(api)) return null;
  const steps = (api.items ?? []).map((step) => ({
    subheading: [pick(step.number), pick(step.title)].filter(Boolean).join(' '),
    items: pick(step.description) ? [{ html: `<i class="fas fa-chevron-right"></i>${(step.description as string).replace(/&/g, '&amp;').replace(/</g, '&lt;')}` }] : [],
  }));
  const data = { ...local, text: pick(api.small_title) ?? local.text, heading: pick(api.title) ?? local.heading, text2: pick(api.description) ?? local.text2 };
  if (steps.length === 0) return data;
  const first = local.processItemsList.length;
  data.processItemsList = local.processItemsList.slice(0, steps.length).map((slot, i) => ({ ...slot, ...steps[i] }));
  if (steps[first]) {
    data.subheading = steps[first].subheading;
    data.items = steps[first].items;
  }
  data.processItemsList2 = local.processItemsList2.slice(0, Math.max(0, steps.length - first - 1)).map((slot, i) => ({ ...slot, ...steps[first + 1 + i] }));
  data.items2 = steps.map((step, i) => ({ icon: cycle(local.items2, i)?.icon ?? '', ...step }));
  return data;
};

const testimonials: Mapper<'testimonials'> = ({ testimonials: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.testimonials ?? []).filter((item) => item.status !== false);
  if (list.length === 0) return null;
  const image = (src: string | null | undefined, i: number) => pick(src) ?? cycle(local.items, i)?.testImg.image.src ?? '';
  return {
    ...local,
    text: pick(api.small_title) ?? local.text,
    heading: pick(api.title) ?? local.heading,
    text2: pick(api.description) ?? local.text2,
    items: list.map((item, i) => {
      const template = cycle(local.items, i)?.testImg;
      return {
        testImg: {
          href: template?.href ?? 'javascript:;',
          title: item.name ?? '',
          dataSlide: String(i + 1),
          className: i === 0 ? 'active test-img' : 'test-img',
          image: { src: image(item.image, i), alt: '', width: template?.image.width ?? '71', height: template?.image.height ?? '71' },
        },
      };
    }),
    image: { src: image(list[0]?.image, 0) || local.image.src, alt: '' },
    testimonialTextSections: list.map((item, i) => ({
      dataIndex: String(i + 1),
      text: item.review ?? '',
      text2: [`<strong>${escape(item.name)}</strong>`, escape(item.designation), escape(item.company)].filter((part) => part && part !== '<strong></strong>').join(', '),
    })),
  };
};

function escape(value: string | null | undefined): string {
  return (value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const portfolio: Mapper<'portfolio'> = ({ portfolio: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.portfolios ?? []).filter((item) => item.status !== false);
  if (list.length === 0) return null;
  return {
    ...local,
    text: pick(api.small_title) ?? local.text,
    heading: pick(api.title) ?? local.heading,
    text2: pick(api.description) ?? local.text2,
    items: list.map((item, i) => {
      const template = cycle(local.items, i);
      const text = pick(item.tagline, item.short_description) ?? '';
      return {
        heading: item.title ?? '',
        text,
        image: { src: pick(item.image) ?? template?.image.src ?? '', alt: pick(item.image_alt) ?? '', width: template?.image.width, height: template?.image.height },
        heading2: item.title ?? '',
        text2: pick(item.short_description, item.tagline) ?? '',
        link: { href: path('/portfolio', item.slug), text: template?.link?.text ?? 'Explore More' },
      };
    }),
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
    link2: { ...local.link2, text: pick(api.small_title) ?? local.link2.text, heading: pick(api.title) ?? local.link2.heading },
    link6: { href: '#mobile-technologies', text: first.title ?? local.link6.text },
    items: rest.map((item) => ({ link: { id: `${slug(item)}-tab`, href: `#${slug(item)}`, ariaControls: slug(item), text: item.title ?? '' } })),
    blocks: list.map((item, i) => ({
      className: i === 0 ? 'tab-pane fade show active' : 'tab-pane fade',
      id: i === 0 ? 'mobile-technologies' : slug(item),
      ariaLabelledby: i === 0 ? 'mobile-technologies-tab' : `${slug(item)}-tab`,
      items: (item.images ?? []).flatMap((image) =>
        pick(image.url) ? [{ image: { src: image.url as string, title: '', alt: '', width: size?.width ?? '78', height: size?.height ?? '78' } }] : [],
      ),
    })),
  };
};

const blog: Mapper<'blog'> = ({ blogs: api }, local) => {
  if (!api || !isOn(api)) return null;
  const list = (api.blogs ?? []).filter((item) => item.status !== false);
  if (list.length === 0) return null;
  return {
    ...local,
    text: pick(api.small_title) ?? local.text,
    heading: pick(api.title) ?? local.heading,
    items: list.map((item, i) => {
      const template = cycle(local.items, i);
      const href = path('/blog', item.slug);
      return {
        blogPostFeatureLink: {
          href,
          title: item.title ?? '',
          image: { src: pick(item.image) ?? template?.blogPostFeatureLink.image.src ?? '', alt: pick(item.image_alt) ?? '', width: template?.blogPostFeatureLink.image.width ?? '370', height: template?.blogPostFeatureLink.image.height ?? '193' },
        },
        link: { href, text: item.title ?? '' },
        text: item.short_description ?? '',
        datePost: template?.datePost ?? 'Read More',
        link2: { href, title: template?.link2.title ?? 'Read More' },
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
    seo: {
      ...local.seo,
      title: pick(seo?.meta_title) ?? local.seo?.title,
      description: pick(seo?.meta_description) ?? local.seo?.description,
      ...toSeoMeta(seo),
    },
    sections: blocks,
  };
}

