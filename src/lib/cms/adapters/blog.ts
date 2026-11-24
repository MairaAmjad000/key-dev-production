/**
 * GET /pages/blog → the Blog page (/blog) the components already render.
 *
 * Same rules as the other inner-page adapters: content comes ONLY from the admin panel (no fallback to the bundled
 * files); content/pages/blog is a template for what the API has no field for (CSS classes, the breadcrumb, button
 * labels, the sidebar call to action) and for the size of images. The order of the sections is the one of that dummy
 * page (page.json), not the API's. A section the API leaves out or switches off, or one without items, is not rendered.
 *
 * | API block         | Section                                                              |
 * |-------------------|----------------------------------------------------------------------|
 * | `hero`            | `categoryHero`                                                       |
 * | `blogs`           | `blogList` (rows)                                                    |
 * | `blog_categories` | `blogList` sidebar "Categories" box                                  |
 * | `latest_tweets`   | `blogList` sidebar social icons (Twitter / Facebook links)           |
 * | `client_reviews`  | `testimonials` (texts; the reviews come from GET /pages/client-review) |
 */
import type { BlogListContent, PageData, SectionBlock, SectionDataMap, SectionType } from '@/types';
import type { ApiBlog, ApiBlogSections, ApiClientReviewSections, ApiHomeSections } from './api-types';
import { SHARED_MAPPERS, excerpt, plain } from './home';
import { formatDate, html, isOn, path, pick, str, toSeoMeta } from './common';

/** The reviews the testimonials block shows (the Blog endpoint only sends the texts above them). */
type Reviews = NonNullable<ApiClientReviewSections['testimonials']>;

type Mapper<K extends SectionType> = (api: ApiBlogSections, local: SectionDataMap[K], reviews?: Reviews) => SectionDataMap[K] | null;

const categoryHero: Mapper<'categoryHero'> = ({ hero: api }, local) => {
  if (!api || !isOn(api)) return null;
  return {
    ...local,
    // Width / height stay those of the bundled banner (1920 x 800).
    image: local.image ? { ...local.image, src: str(api.image), alt: str(api.image_alt, api.title) } : local.image,
    heading: str(api.title),
    headingHtml: undefined,
    text: html(str(api.description)),
    // The API has no buttons for this page.
    links: [],
  };
};

export { formatDate };

export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Sidebar boxes of the list and of the article page: social icons, categories (`active` = the article's category) and the bundled call to action. */
export function buildSidebar(
  { blog_categories: categories, latest_tweets: social }: Pick<ApiBlogSections, 'blog_categories' | 'latest_tweets'>,
  local: BlogListContent['sidebar'],
  activeCategory?: string,
): BlogListContent['sidebar'] {
  const categoryList = categories && isOn(categories) ? (categories.blog_categories ?? []) : [];
  const socials = [
    { url: pick(social?.twitter_url), iconClass: 'fab fa-twitter' },
    { url: pick(social?.facebook_url), iconClass: 'fab fa-facebook-f' },
  ];
  return {
    ...local,
    social: { ...local.social, items: socials.flatMap((item) => (item.url ? [{ href: item.url, iconClass: item.iconClass }] : [])) },
    categories: {
      title: pick(categories?.title) ?? local.categories.title,
      items: categoryList.map((c) => ({ text: str(c.title), href: path('/blog/category', c.slug), ...(activeCategory && c.title === activeCategory ? { active: true } : {}) })),
    },
    tweets: { ...local.tweets, href: pick(social?.twitter_url) ?? local.tweets.href },
  };
}

/**
 * Blog rows + sidebar. Every row has the bundled row's pieces (picture, author, date, category, title, teaser, button):
 * the picture sits in the same 2:1 box (see styles/sections/blog-list.css) and the author photo in the same round
 * 70 px frame; an author without a photo shows an initial in that frame. The API has no author page, so the name is
 * not a link. The social icons keep the bundled icon classes; an icon with no link in the API is not shown.
 */
const blogList: Mapper<'blogList'> = ({ blogs, blog_categories: categories, latest_tweets: social }, local) => {
  if (!blogs || !isOn(blogs)) return null;
  const posts = (blogs.blogs ?? []).filter((post) => post.status !== false);
  const categoryList = categories && isOn(categories) ? (categories.blog_categories ?? []) : [];
  const categorySlug = (post: (typeof posts)[number]) =>
    pick(post.category?.slug) ?? categoryList.find((c) => c.id === post.category?.id)?.slug ?? slugify(str(post.category?.title));
  const template = local.items[0];
  return {
    ...local,
    items: posts.map((post) => ({
      title: str(post.title),
      href: path('/blog', post.slug),
      image: { src: str(post.image), alt: str(post.image_alt, post.title) },
      author: {
        name: str(post.author),
        href: '',
        image: { src: str(post.author_image), alt: str(post.author) },
      },
      date: formatDate(post.published_at, post.updated_at),
      category: { text: str(post.category?.title), href: path('/blog/category', categorySlug(post)) },
      excerpt: excerpt(plain(post.short_description)),
      buttonText: template?.buttonText ?? '',
    })),
    sidebar: buildSidebar({ blog_categories: categories, latest_tweets: social }, local.sidebar),
  };
};

/** Same block as the home page's testimonials: the texts come from `client_reviews`, the people from the client-review page. */
const testimonials: Mapper<'testimonials'> = ({ client_reviews: head }, local, reviews) => {
  if (!head || !isOn(head) || !reviews) return null;
  const api: ApiHomeSections = { testimonials: { ...reviews, small_title: head.small_title, title: head.title, description: head.description } };
  return SHARED_MAPPERS.testimonials(api, local);
};

const MAPPERS: { [K in SectionType]?: Mapper<K> } = { categoryHero, blogList, testimonials };

export function adaptBlog(api: ApiBlog, local: PageData, reviews?: Reviews): PageData {
  const sections = api.sections ?? {};
  const blocks = local.sections.flatMap((block): SectionBlock[] => {
    const mapper = MAPPERS[block.type] as Mapper<SectionType> | undefined;
    // A section type without a mapper has no API data: it is left out rather than shown with dummy content.
    if (!mapper) return [];
    const data = mapper(sections, block.data as never, reviews);
    return data ? [{ type: block.type, data } as SectionBlock] : [];
  });
  const seo = api.seo;
  return {
    ...local,
    seo: { title: pick(seo?.meta_title), description: pick(seo?.meta_description), ...toSeoMeta(seo) },
    sections: blocks,
  };
}
