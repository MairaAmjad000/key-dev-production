/**
 * Template of the service category page (/service-category/<slug>): the section order of the page and, for every
 * section, a bundled block that supplies what the API has no field for (CSS classes, the width / height of images, the
 * stand-in tab icons). Which block is used where is documented in adapters/service-category.ts.
 *
 * Only the markup / size of these blocks is used: every text, picture and icon on the page comes from the API.
 */
import type { PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import hero from '../../../content/pages/service-category/web-development/sections/category-hero.json';
import brandLogos from '../../../content/pages/service-category/web-development/sections/brand-logos.json';
import introContent from '../../../content/pages/service-category/web-development/sections/intro-content.json';
import serviceOfferings from '../../../content/pages/service-category/web-development/sections/service-offerings.json';
import frameworkTabs from '../../../content/pages/service-category/web-development/sections/framework-tabs.json';
import whyChoose from '../../../content/pages/service-category/web-development/sections/why-choose.json';
import portfolio from '../../../content/pages/service-category/web-development/sections/portfolio.json';
import testimonials from '../../../content/pages/service-category/web-development/sections/testimonials.json';
import technologies from '../../../content/pages/service-category/web-development/sections/technologies.json';
import blog from '../../../content/pages/service-category/web-development/sections/blog.json';
import offerGrid from '../../../content/pages/service-category/mobile-app-development/sections/offer-grid.json';
import advantageGrid from '../../../content/pages/service-category/game-development/sections/advantage-grid.json';
import process from '../../../content/pages/service-category/game-development/sections/process.json';
import faq from '../../../content/pages/service-category/game-development/sections/faq.json';
import callout from '../../../content/pages/service-category/ui-ux-design/sections/callout.json';

/**
 * Order of the page. Section backgrounds alternate white / light down the page, so two neighbours never share one:
 * intro (white) > offerings (light) > services (white) > features (light) > process (white) > benefits (light) > (slot N of SLOT_MAPPERS in adapters/service-category.ts matches slot N here) >
 * frameworks (white) > why choose us (light) > call-out bar > work (white) > reviews (light) > stack (white) > FAQ > blog (light).
 */
export const SERVICE_CATEGORY_ORDER: SectionType[] = [
  'categoryHero',
  'brandLogos',
  'introContent',
  'serviceOfferings',
  'offerGrid',
  'whyChoose', // features: "What Makes us the Best" layout
  'process',
  'advantageGrid', // benefits: the "Advantages" grid layout
  'frameworkTabs',
  'whyChoose',
  'callout',
  'portfolio',
  'testimonials',
  'technologies',
  'faq',
  'blog',
];

const templates: Partial<SectionDataMap> = {
  categoryHero: hero,
  brandLogos,
  introContent,
  serviceOfferings,
  // The "What we deliver" cards sit between two light sections, so they are white.
  offerGrid: { ...offerGrid, sectionClass: 'padding-60 bg-white game-service-offer-main offer-grid-fit' },
  advantageGrid,
  process,
  frameworkTabs,
  whyChoose,
  callout,
  portfolio,
  testimonials,
  technologies,
  faq,
  blog,
};

export const serviceCategoryTemplate: PageData = {
  slug: 'service-category/web-development',
  sections: SERVICE_CATEGORY_ORDER.flatMap((type): SectionBlock[] =>
    templates[type] ? [{ type, data: templates[type] } as SectionBlock] : [],
  ),
};
