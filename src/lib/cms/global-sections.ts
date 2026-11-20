import { GLOBAL_SECTION_ORDER } from '@/types';
import type { GlobalSectionsContent, PageData, SectionBlock } from '@/types';

/**
 * The blocks to render for a page: its own sections, then the enabled global sections (Connect With Us,
 * Schedule Meeting, Engagement Models, Locations) in that fixed order, unless the page hides them.
 *
 * A global section type that also appears in a page's own list (e.g. from an older admin export) is dropped
 * there, so it is never shown twice.
 */
/** The `show_on` key the admin panel uses for a page slug; undefined when the slug has no key (shown everywhere). */
function pageKey(slug: string): string | undefined {
  const keys: Array<[RegExp, string]> = [
    [/^home$/, 'home'], [/^service-category\//, 'service_category'], [/^service\//, 'service'], [/^solutions?\//, 'solution'],
    [/^(about|who-we-are)$/, 'about'], [/^(process|how-we-work)$/, 'process'], [/^client-review$/, 'client_review'],
    [/^(technology|technologies)$/, 'technology'], [/^portfolio/, 'portfolio'], [/^blog/, 'blog'], [/^contact$/, 'contact'],
  ];
  return keys.find(([pattern]) => pattern.test(slug))?.[1];
}

export function withGlobalSections(page: PageData, globals: GlobalSectionsContent | undefined): SectionBlock[] {
  const own = page.sections.filter((s) => !(GLOBAL_SECTION_ORDER as readonly string[]).includes(s.type));
  if (!globals) return own;
  const hidden = new Set<string>(page.hideGlobalSections ?? []);
  const key = pageKey(page.slug);
  const shared = GLOBAL_SECTION_ORDER.flatMap((type) => {
    const block = globals.sections.find((s) => s.type === type);
    if (!block || block.enabled === false || hidden.has(type)) return [];
    if (key && block.showOn && !block.showOn.includes(key)) return [];
    return [{ type: block.type, data: block.data } as SectionBlock];
  });
  return [...own, ...shared];
}
