/**
 * GET /pages/contact → the Contact page (/contact) the components already render.
 *
 * Same rules as the other inner-page adapters: content comes ONLY from the admin panel (no fallback to the bundled
 * files); content/pages/contact is a template for what the API has no field for (CSS classes, the breadcrumb, the
 * enquiry form and its labels, the "Follow us on" icon classes) and for the size of images. The order of the sections
 * is the one of that dummy page (page.json), not the API's. A section the API leaves out or switches off, or one
 * without items, is not rendered. The page hides the global sections, as the dummy page does.
 *
 * | API block             | Section                                                       |
 * |-----------------------|---------------------------------------------------------------|
 * | `hero`                | `categoryHero`                                                |
 * | `schedule`            | `contactForm` (the card beside the form; the form is fixed)   |
 * | `contact_information` | `contactInfo` (the boxes)                                     |
 * | `social_links`        | `contactInfo` ("Follow us on" bar)                            |
 * | `map`                 | `contactMap` (one map; the dummy's office photo tabs have no field) |
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiContact, ApiContactSections } from './api-types';
import { html, isOn, paragraphsOf, pick, str, toSeoMeta } from './common';

type Mapper<K extends SectionType> = (api: ApiContactSections, local: SectionDataMap[K]) => SectionDataMap[K] | null;

const categoryHero: Mapper<'categoryHero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  return {
    ...local,
    // Width / height stay those of the bundled banner (1920 x 780).
    image: local.image ? { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) } : local.image,
    heading: str(api.title),
    headingHtml: undefined,
    subheading: str(api.sub_title),
    text: html(str(api.description)),
    links: [],
  };
};

/**
 * The schedule card: round 252 px picture (any shape is cropped to the circle), headings, text and a button. The
 * button keeps opening the meeting popup like the dummy one (its link is the popup trigger, not an address).
 */
const contactForm: Mapper<'contactForm'> = ({ schedule: api }, local) => {
  if (!api || !isOn(api)) return null;
  return {
    ...local,
    meeting: {
      ...local.meeting,
      image: { ...local.meeting.image, src: str(api.image), alt: str(api.image_alt, api.title) },
      heading: str(api.title),
      subheading: str(api.sub_title),
      paragraphs: paragraphsOf(api.description),
      button: { ...local.meeting.button, text: str(api.button_text) },
    },
  };
};

/** The box value → the link a visitor expects: an e-mail address mails, a phone number calls, anything else (an address) is plain text. */
function hrefOf(value: string): string {
  const text = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `mailto:${text}`;
  if (/^\+?[\d\s().-]{7,}$/.test(text)) return `tel:${text.replace(/[^\d+]/g, '')}`;
  if (/^https?:\/\//i.test(text)) return text;
  return '';
}

/** Name of a network from its link (https://www.linkedin.com/... → "Linkedin"), used as the icon's accessible label. */
function networkOf(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch {
    return '';
  }
}

/**
 * Contact boxes + "Follow us on" bar. Box icons are the uploaded pictures in the same 100 px round frame (icon 50 px);
 * social icons are uploaded pictures in the same 62 px box (icon 30 px). Both blocks are optional on their own.
 */
const contactInfo: Mapper<'contactInfo'> = ({ contact_information: boxes, social_links: social }, local) => {
  const items = boxes && isOn(boxes) ? (boxes.items ?? []).filter((item) => pick(item.title) || pick(item.value)) : [];
  const links = social && isOn(social) ? (social.items ?? []).filter((item) => pick(item.link)) : [];
  if (items.length === 0 && links.length === 0) return null;
  return {
    ...local,
    items: items.map((item) => {
      const value = str(item.value);
      return { icon: str(item.icon), tool: str(item.title), link: { href: hrefOf(value), text: value, title: value } };
    }),
    follow: {
      heading: str(social?.title),
      items: links.map((item) => ({ href: str(item.link), iconClass: '', label: networkOf(str(item.link)), iconSrc: str(item.icon) })),
    },
  };
};

/**
 * The dummy page has one tab per office (photo + city + map). The API has a single map and no office photos, so the
 * page shows that one map across the full width, at a fixed height (see styles/sections/contact-page.css).
 */
const contactMap: Mapper<'contactMap'> = ({ map: api }, local) => {
  const url = pick(api?.map_url);
  if (!api || !isOn(api) || !url) return null;
  return { ...local, tabs: [{ id: 'tab-1', title: '', image: { src: '', alt: '' }, mapUrl: url }] };
};

const MAPPERS: { [K in SectionType]?: Mapper<K> } = { categoryHero, contactForm, contactInfo, contactMap };

export function adaptContact(api: ApiContact, local: PageData): PageData {
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
