/**
 * GET /global-sections (or the `global` block of a page) → the four shared blocks, in the same order as
 * content/globals/global-sections.json: contactCta, scheduleCall, engagement, locations.
 *
 * Which API block feeds which bundled block:
 *   schedule_meeting  → contactCta     (headline, text, buttons, picture; phone / WhatsApp from GET /layout contact)
 *   connect           → scheduleCall   (headline + the "Reviewed on" rating boxes)
 *   engagement_models → engagement
 *   locations         → locations
 * A block the API leaves out, or switches off, is disabled. `show_on` limits it to those pages.
 *
 * No content is borrowed from the bundled files: they only provide markup, CSS classes, fixed labels and the
 * width / height attributes of images, so uploaded pictures keep the size of the placeholders they replace.
 */
import type { GlobalSectionBlock, GlobalSectionsContent, SectionDataMap } from '@/types';
import type { ApiGlobalSections, ApiLayout } from './api-types';
import { isOn, pick } from './common';

type Block<K extends GlobalSectionBlock['type']> = Extract<GlobalSectionBlock, { type: K }>;
const str = (...values: Array<string | null | undefined>) => pick(...values) ?? '';

function find<K extends GlobalSectionBlock['type']>(local: GlobalSectionsContent, type: K): Block<K> | undefined {
  return local.sections.find((section): section is Block<K> => section.type === type);
}

export function adaptGlobalSections(
  api: ApiGlobalSections | null | undefined,
  local: GlobalSectionsContent,
  contact?: NonNullable<ApiLayout['settings']>['contact'],
): GlobalSectionsContent {
  const sections: GlobalSectionBlock[] = [];

  const meeting = api?.schedule_meeting;
  const contactCta = find(local, 'contactCta');
  if (contactCta) {
    const base = contactCta.data;
    const phone = pick(contact?.phone);
    const whatsapp = pick(contact?.whatsapp, phone)?.replace(/[^\d]/g, '');
    const call = { href: whatsapp ? `https://wa.me/${whatsapp}` : '#', title: phone ?? '' };
    const data: SectionDataMap['contactCta'] = {
      ...base,
      image: { src: str(meeting?.image), alt: str(meeting?.alt) },
      subheading: str(meeting?.title),
      text: str(meeting?.description),
      headRequetBtn: { ...base.headRequetBtn, text: str(meeting?.button_1_text) },
      orangeText: pick(meeting?.button_2_text) ? base.orangeText : '',
      item: str(meeting?.button_2_text),
      link: { ...base.link, ...call },
      link2: call, link3: call, link4: call, link5: call, link6: call, link7: call, link8: call,
    };
    sections.push({ type: 'contactCta', enabled: !!meeting && isOn(meeting), showOn: meeting?.show_on ?? undefined, data });
  }

  const connect = api?.connect;
  const scheduleCall = find(local, 'scheduleCall');
  if (scheduleCall) {
    const items = connect?.items ?? [];
    const template = scheduleCall.data.blocks[0]?.link;
    const rowTemplate = scheduleCall.data.items[0]?.link;
    // Same layout as the bundled design: the first two API items fill the two "Reviewed On" cards (Clutch, GoodFirms);
    // every further item becomes a row of the list below them (Upwork, PeoplePerHour...: logo + "Rating x").
    // Only API data is used: with fewer items, fewer cards / no rows are shown.
    const CARD_SLOTS = scheduleCall.data.blocks.length;
    const cards = items.slice(0, CARD_SLOTS);
    const rows = items.slice(CARD_SLOTS);
    const data: SectionDataMap['scheduleCall'] = {
      ...scheduleCall.data,
      text: str(connect?.section_title),
      heading: str(connect?.title),
      blocks: cards.map((item) => ({
        link: {
          href: str(item.url, item.link) || '#',
          image: { src: str(item.logo), alt: str(item.logo_alt), width: template?.image.width ?? '172', height: template?.image.height ?? '68' },
          orangeText: template?.orangeText ?? '',
          strong: item.rating != null ? Number(item.rating).toFixed(1) : '',
          text: str(item.review_count),
        },
      })),
      items: rows.map((item) => ({
        link: {
          href: str(item.url, item.link) || '#',
          image: { src: str(item.logo), alt: str(item.logo_alt), width: rowTemplate?.image.width ?? '200', height: rowTemplate?.image.height ?? '75' },
          topRatingImg: { src: '', alt: '', width: '' },
          image2: { src: '', alt: '', width: '', height: '' },
          text: item.rating != null ? `Rating <strong>${Number(item.rating).toFixed(1)}</strong>` : str(item.review_count),
        },
      })),
      // Nothing is shown from the bundled "Hire us on" list any more (its ratings were dummy values).
      link: { ...scheduleCall.data.link, image: { ...scheduleCall.data.link.image, src: '' }, text: '' },
    };
    sections.push({ type: 'scheduleCall', enabled: !!connect && isOn(connect), showOn: connect?.show_on ?? undefined, data });
  }

  const engagementApi = api?.engagement_models;
  const engagement = find(local, 'engagement');
  if (engagement) {
    const items = engagementApi?.items ?? [];
    const template = engagement.data.blocks[0]?.image;
    const data: SectionDataMap['engagement'] = {
      ...engagement.data,
      text: str(engagementApi?.section_title),
      heading: str(engagementApi?.title),
      text2: str(engagementApi?.description),
      blocks: items.map((item) => ({
        image: { src: str(item.icon), alt: str(item.title), width: template?.width ?? '133', height: template?.height ?? '166' },
        text: str(item.title),
      })),
      headRequetBtn: { ...engagement.data.headRequetBtn, text: str(engagementApi?.button_text) },
      boxShadow: { ...engagement.data.boxShadow, src: str(engagementApi?.image), alt: str(engagementApi?.alt) },
    };
    sections.push({ type: 'engagement', enabled: !!engagementApi && isOn(engagementApi), showOn: engagementApi?.show_on ?? undefined, data });
  }

  const locationsApi = api?.locations;
  const locations = find(local, 'locations');
  if (locations) {
    const list = locationsApi?.locations ?? [];
    const contactItems = (office: (typeof list)[number], template: { items: Array<{ icon: string }> }) => [
      ...(pick(office.contact_no) ? [{ icon: template.items[0]?.icon ?? '', link: { href: `tel:${(office.contact_no as string).replace(/[^\d+]/g, '')}`, text: office.contact_no as string } }] : []),
      ...(pick(office.email) ? [{ icon: template.items[1]?.icon ?? '', link: { href: `mailto:${office.email as string}`, text: office.email as string } }] : []),
    ];
    const [first, ...rest] = list;
    const small = locations.data.blocks[0];
    const data: SectionDataMap['locations'] = {
      ...locations.data,
      text: str(locationsApi?.section_title),
      heading: str(locationsApi?.title),
      boxShadow: { ...locations.data.boxShadow, src: str(first?.image), alt: str(first?.country) },
      subheading: str(first?.country),
      text2: str(first?.address),
      items: first ? contactItems(first, locations.data) : [],
      blocks: rest.map((office) => ({
        className: small?.className ?? 'col-lg-4 col-md-4 col-12',
        boxShadow: { src: str(office.image), alt: str(office.country), width: small?.boxShadow.width ?? '360', height: small?.boxShadow.height ?? '227' },
        subheading: str(office.country),
        text: str(office.address),
        items: contactItems(office, small ?? locations.data),
      })),
    };
    sections.push({ type: 'locations', enabled: !!locationsApi && isOn(locationsApi) && !!first, showOn: locationsApi?.show_on ?? undefined, data });
  }

  return { sections };
}
