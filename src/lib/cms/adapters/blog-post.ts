/**
 * GET /pages/blog → one article page (/blog/<slug>) the components already render.
 *
 * The API has no single-article endpoint, but GET /pages/blog carries every article with its full text, so the page is
 * built from there. Same rules as the other adapters: content comes ONLY from the admin panel; content/pages/blog/
 * post-template.json is the template for what the API has no field for (breadcrumb words, labels, the banner's size)
 * and for the sidebar's call to action. The order of the sections is the dummy article page's: banner, article.
 * (The global sections are appended after them by the page, as on every page.)
 *
 * | API                                  | Block                                                       |
 * |--------------------------------------|-------------------------------------------------------------|
 * | article `title`                      | banner heading, breadcrumb, article title                   |
 * | blog page `hero.image`               | banner picture (articles have no banner of their own)       |
 * | article `image` / `image_alt`        | article picture (same 2:1 box as the dummy one)             |
 * | `author`, `author_image`             | author line (no photo = an initial in the same round frame) |
 * | `published_at` (or `updated_at`)     | date                                                        |
 * | `description`                        | body, rendered as one rich-text block                       |
 * | other articles                       | "Related Articles" (same category first)                    |
 * | `blog_categories`, `latest_tweets`   | sidebar                                                     |
 */
import type { BlogListContent, BlogPostTemplate, PageData } from '@/types';
import type { ApiBlog } from './api-types';
import { buildSidebar, formatDate, slugify } from './blog';
import { isOn, path, pick, str, toSeoMeta } from './common';
import { plain } from './home';
import template from '../../../../content/pages/blog/post-template.json';
import blogListTemplate from '../../../../content/pages/blog/sections/blog-list.json';

const postTemplate = template as unknown as BlogPostTemplate;
const localSidebar = (blogListTemplate as unknown as BlogListContent).sidebar;

/** About 200 words a minute, like the "7 min read" line of the dummy articles. */
const readTime = (text: string) => {
  const words = text.split(/\s+/).filter(Boolean).length;
  return words === 0 ? undefined : `${Math.max(1, Math.round(words / 200))} min read`;
};

export function adaptBlogPost(api: ApiBlog, slug: string): PageData | null {
  const sections = api.sections ?? {};
  const posts = (isOn(sections.blogs) ? (sections.blogs?.blogs ?? []) : []).filter((post) => post.status !== false);
  const post = posts.find((item) => item.slug === slug);
  if (!post) return null;

  const categories = sections.blog_categories && isOn(sections.blog_categories) ? (sections.blog_categories.blog_categories ?? []) : [];
  const categoryOf = (item: (typeof posts)[number]) => ({
    text: str(item.category?.title),
    href: path('/blog/category', pick(item.category?.slug) ?? categories.find((c) => c.id === item.category?.id)?.slug ?? slugify(str(item.category?.title))),
  });
  const category = categoryOf(post);
  const others = posts.filter((item) => item.slug !== post.slug);
  const related = [...others.filter((p) => p.category?.id === post.category?.id), ...others.filter((p) => p.category?.id !== post.category?.id)]
    .slice(0, postTemplate.relatedCount)
    .map((item) => ({
      title: str(item.title),
      href: path('/blog', item.slug),
      image: { src: str(item.image), alt: str(item.image_alt, item.title) },
      date: formatDate(item.published_at, item.updated_at),
      category: categoryOf(item),
    }));

  const seo = post.seo;
  return {
    slug: `blog/${post.slug}`,
    seo: { title: pick(seo?.meta_title, post.title) ?? '', description: pick(seo?.meta_description), ...toSeoMeta(seo) },
    sections: [
      {
        type: 'categoryHero',
        data: {
          sectionClass: postTemplate.heroSectionClass,
          textClass: 'text-center',
          // The banner keeps the dummy banner's size (1920 x 800); the picture is the blog page's hero.
          image: { ...postTemplate.heroImage, src: str(sections.hero?.image), alt: str(sections.hero?.image_alt, sections.hero?.title) },
          heading: str(post.title),
          text: '',
          links: [],
          breadcrumbs: [
            { text: postTemplate.breadcrumbs.home, href: '/' },
            { text: postTemplate.breadcrumbs.blog, href: '/blog' },
            { text: str(post.title) },
          ],
        },
      },
      {
        type: 'blogPost',
        data: {
          title: str(post.title),
          image: { src: str(post.image), alt: str(post.image_alt, post.title) },
          author: { name: str(post.author), href: '', image: { src: str(post.author_image), alt: str(post.author) } },
          date: formatDate(post.published_at, post.updated_at),
          category,
          readTime: readTime(plain(post.description)),
          body: [{ type: 'html', html: str(post.description) }],
          labels: postTemplate.labels,
          related,
          sidebar: (({ social, categories: cats, cta }) => ({ social, categories: cats, cta }))(buildSidebar(sections, localSidebar, post.category?.title ?? undefined)),
        },
      },
    ],
  };
}
