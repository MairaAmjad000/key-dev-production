/**
 * GET /global-sections (or the `global` block of a page) → the four shared blocks, in the same order as
 * content/globals/global-sections.json: contactCta, scheduleCall, engagement, locations.
 *
 * Which API block feeds which bundled block:
 *   schedule_meeting  → contactCta     (headline, text, button, picture)
 *   connect           → scheduleCall   (headline + the "Reviewed on" rating boxes)
 *   engagement_models → engagement
 *   locations         → locations
 * A block the API leaves out, or switches off, is disabled. `show_on` limits it to those pages.
 */
import type { GlobalSectionBlock, GlobalSectionsContent, SectionDataMap } from '@/types';
import type { ApiGlobalSections } from './api-types';
import { cycle, isOn, pick } from './common';

type Block<K extends GlobalSectionBlock['type']> = Extract<GlobalSectionBlock, { type: K }>;

function find<K extends GlobalSectionBlock['type']>(local: GlobalSectionsContent, type: K): Block<K> | undefined {
  return local.sections.find((section): section is Block<K> => section.type === type);
}

export function adaptGlobalSections(api: ApiGlobalSections | null | undefined, local: GlobalSectionsContent): GlobalSectionsContent {
  if (!api) return local;
  const sections: GlobalSectionBlock[] = [];

  const meeting = api.schedule_meeting;
  const contactCta = find(local, 'contactCta');
  if (contactCta) {
    const data: SectionDataMap['contactCta'] = {
      ...contactCta.data,
      image: { src: pick(meeting?.image) ?? contactCta.data.image.src, alt: pick(meeting?.alt) ?? '' },
      subheading: pick(meeting?.title) ?? contactCta.data.subheading,
      text: pick(meeting?.description) ?? contactCta.data.text,
      headRequetBtn: { ...contactCta.data.headRequetBtn, text: pick(meeting?.button_1_text) ?? contactCta.data.headRequetBtn.text },
    };
    sections.push({ type: 'contactCta', enabled: !!meeting && isOn(meeting), showOn: meeting?.show_on ?? undefined, data });
  }

  const connect = api.connect;
  const scheduleCall = find(local, 'scheduleCall');
  if (scheduleCall) {
    const items = connect?.items ?? [];
    const data: SectionDataMap['scheduleCall'] = {
      ...scheduleCall.data,
      text: pick(connect?.section_title) ?? scheduleCall.data.text,
      heading: pick(connect?.title) ?? scheduleCall.data.heading,
      blocks:
        items.length > 0
          ? items.map((item, i) => {
              const template = cycle(scheduleCall.data.blocks, i)?.link;
              return {
                link: {
                  href: template?.href ?? '#',
                  image: { src: pick(item.logo) ?? template?.image.src ?? '', alt: '', width: template?.image.width ?? '172', height: template?.image.height ?? '68' },
                  orangeText: template?.orangeText ?? '',
                  strong: item.rating != null ? Number(item.rating).toFixed(1) : template?.strong ?? '',
                  text: pick(item.review_count) ?? template?.text ?? '',
                },
              };
            })
          : scheduleCall.data.blocks,
    };
    sections.push({ type: 'scheduleCall', enabled: !!connect && isOn(connect), showOn: connect?.show_on ?? undefined, data });
  }

  const engagementApi = api.engagement_models;
  const engagement = find(local, 'engagement');
  if (engagement) {
    const items = engagementApi?.items ?? [];
    const data: SectionDataMap['engagement'] = {
      ...engagement.data,
      text: pick(engagementApi?.section_title) ?? engagement.data.text,
      heading: pick(engagementApi?.title) ?? engagement.data.heading,
      text2: pick(engagementApi?.description) ?? engagement.data.text2,
      blocks:
        items.length > 0
          ? items.map((item, i) => {
              const template = cycle(engagement.data.blocks, i);
              return {
                image: { src: pick(item.icon) ?? template?.image.src ?? '', alt: '', width: template?.image.width ?? '133', height: template?.image.height ?? '166' },
                text: pick(item.title) ?? template?.text ?? '',
              };
            })
          : engagement.data.blocks,
      headRequetBtn: { ...engagement.data.headRequetBtn, text: pick(engagementApi?.button_text) ?? engagement.data.headRequetBtn.text },
      boxShadow: { ...engagement.data.boxShadow, src: pick(engagementApi?.image) ?? engagement.data.boxShadow.src, alt: pick(engagementApi?.alt) ?? '' },
    };
    sections.push({ type: 'engagement', enabled: !!engagementApi && isOn(engagementApi), showOn: engagementApi?.show_on ?? undefined, data });
  }

  const locationsApi = api.locations;
  const locations = find(local, 'locations');
  if (locations) {
    const list = locationsApi?.locations ?? [];
    const contactItems = (offices: typeof list[number], template: { items: Array<{ icon: string }> }) => [
      ...(pick(offices.contact_no) ? [{ icon: template.items[0]?.icon ?? '', link: { href: `tel:${(offices.contact_no as string).replace(/[^\d+]/g, '')}`, text: offices.contact_no as string } }] : []),
      ...(pick(offices.email) ? [{ icon: template.items[1]?.icon ?? '', link: { href: `mailto:${offices.email as string}`, text: offices.email as string } }] : []),
    ];
    const [first, ...rest] = list;
    const data: SectionDataMap['locations'] = {
      ...locations.data,
      text: pick(locationsApi?.section_title) ?? locations.data.text,
      heading: pick(locationsApi?.title) ?? locations.data.heading,
      ...(first
        ? {
            boxShadow: { ...locations.data.boxShadow, src: pick(first.image) ?? locations.data.boxShadow.src, alt: '' },
            subheading: pick(first.country) ?? locations.data.subheading,
            text2: pick(first.address) ?? locations.data.text2,
            items: contactItems(first, locations.data),
          }
        : {}),
      blocks: first
        ? rest.map((office, i) => {
            const template = cycle(locations.data.blocks, i);
            return {
              className: template?.className ?? 'col-lg-4 col-md-4 col-12',
              boxShadow: { src: pick(office.image) ?? template?.boxShadow.src ?? '', alt: '', width: template?.boxShadow.width ?? '360', height: template?.boxShadow.height ?? '227' },
              subheading: pick(office.country) ?? template?.subheading ?? '',
              text: pick(office.address) ?? template?.text ?? '',
              items: contactItems(office, template ?? locations.data),
            };
          })
        : locations.data.blocks,
    };
    sections.push({ type: 'locations', enabled: !!locationsApi && isOn(locationsApi), showOn: locationsApi?.show_on ?? undefined, data });
  }

  return { sections };
}
