/**
 * Shapes of the admin-panel API responses (GET {CMS_API_URL}/layout, /form-options, /global-sections, /home).
 * Every field is optional or nullable on purpose: the admin panel may leave any of them empty. The adapters
 * render such a field as empty (no bundled content is borrowed, see adapters/*.ts for the few documented exceptions).
 */

export type Maybe<T> = T | null | undefined;

export interface ApiSeo {
  meta_title?: Maybe<string>;
  meta_description?: Maybe<string>;
  meta_keywords?: Maybe<string>;
  robots?: Maybe<string>;
  canonical_url?: Maybe<string>;
  og_title?: Maybe<string>;
  og_description?: Maybe<string>;
  og_type?: Maybe<string>;
  og_image?: Maybe<string>;
  og_url?: Maybe<string>;
  twitter_card?: Maybe<string>;
  twitter_title?: Maybe<string>;
  twitter_description?: Maybe<string>;
  twitter_image?: Maybe<string>;
  schema_data?: Maybe<string>;
}

export interface ApiMenuItem {
  id: number;
  title: string;
  type?: Maybe<string>;
  url?: Maybe<string>;
  icon?: Maybe<string>;
  is_fluid?: Maybe<boolean>;
  target?: Maybe<string>;
  children?: Maybe<ApiMenuItem[]>;
}

export interface ApiLayout {
  settings?: Maybe<{
    general?: Maybe<{ site_name?: Maybe<string>; tagline?: Maybe<string>; logo?: Maybe<string>; logo_dark?: Maybe<string>; favicon?: Maybe<string> }>;
    contact?: Maybe<{ email?: Maybe<string>; phone?: Maybe<string>; whatsapp?: Maybe<string>; address?: Maybe<string> }>;
    social?: Maybe<Record<string, Maybe<string>>>;
    seo?: Maybe<ApiSeo>;
    header_top_bar?: Maybe<{
      clutch_image?: Maybe<string>; consultant_image?: Maybe<string>; rating?: Maybe<number>; rating_text?: Maybe<string>; email_text?: Maybe<string>;
      phone_text?: Maybe<string>; callback_text?: Maybe<string>; text?: Maybe<string>; link?: Maybe<string>;
    }>;
    header_services_cta?: Maybe<ApiCta>;
    header_solutions_cta?: Maybe<ApiCta>;
    header_button?: Maybe<{ text?: Maybe<string>; link?: Maybe<string> }>;
    footer_expertise?: Maybe<{ title?: Maybe<string>; services?: Maybe<Array<{ title: string; url: string }>> }>;
    footer_solutions?: Maybe<{ title?: Maybe<string>; solutions?: Maybe<Array<{ title: string; url: string }>> }>;
    footer_experience?: Maybe<{ title?: Maybe<string>; years?: Maybe<string>; button_text?: Maybe<string>; button_link?: Maybe<string> }>;
    footer_awards?: Maybe<{
      text?: Maybe<string>; disclaimer?: Maybe<string>; items?: Maybe<Array<{ image?: Maybe<string>; link?: Maybe<string> }>>;
      button_text?: Maybe<string>; button_link?: Maybe<string>;
    }>;
    footer_bottom?: Maybe<{
      copyright?: Maybe<string>; contact_text?: Maybe<string>; contact_link?: Maybe<string>;
      privacy_text?: Maybe<string>; privacy_link?: Maybe<string>; registration_text?: Maybe<string>;
    }>;
    footer_clutch?: Maybe<{ text?: Maybe<string> }>;
    cookie?: Maybe<{ title?: Maybe<string>; text?: Maybe<string>; button_text?: Maybe<string>; button_link?: Maybe<string> }>;
  }>;
  menus?: Maybe<{ header?: Maybe<ApiMenuItem[]>; footer?: Maybe<ApiMenuItem[]> }>;
}

export interface ApiCta {
  title?: Maybe<string>;
  phone?: Maybe<string>;
  phone_link?: Maybe<string>;
  button_text?: Maybe<string>;
  button_url?: Maybe<string>;
}

export interface ApiFormOptions {
  services?: Maybe<Array<{ id: number; title: string }>>;
  budgets?: Maybe<string[]>;
  regions?: Maybe<string[]>;
  hear_about?: Maybe<string[]>;
}

/** Fields shared by every global section. */
interface ApiGlobalBase {
  section_title?: Maybe<string>;
  title?: Maybe<string>;
  description?: Maybe<string>;
  show_on?: Maybe<string[]>;
  enabled?: Maybe<boolean>;
  status?: Maybe<boolean>;
}

export interface ApiGlobalSections {
  connect?: Maybe<ApiGlobalBase & { items?: Maybe<Array<{ logo?: Maybe<string>; logo_alt?: Maybe<string>; rating?: Maybe<number>; review_count?: Maybe<string>; url?: Maybe<string>; link?: Maybe<string> }>> }>;
  schedule_meeting?: Maybe<ApiGlobalBase & { button_1_text?: Maybe<string>; button_2_text?: Maybe<string>; image?: Maybe<string>; alt?: Maybe<string> }>;
  engagement_models?: Maybe<ApiGlobalBase & {
    button_text?: Maybe<string>; image?: Maybe<string>; alt?: Maybe<string>; items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string> }>>;
  }>;
  locations?: Maybe<ApiGlobalBase & {
    subtitle?: Maybe<string>;
    locations?: Maybe<Array<{ id: number; country?: Maybe<string>; address?: Maybe<string>; contact_no?: Maybe<string>; email?: Maybe<string>; image?: Maybe<string> }>>;
  }>;
}

interface ApiHead { small_title?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string>; enabled?: Maybe<boolean>; status?: Maybe<boolean> }

export interface ApiHomeSections {
  hero?: Maybe<ApiHead & Record<string, Maybe<string>>>;
  banner?: Maybe<{ enabled?: Maybe<boolean>; status?: Maybe<boolean>; items?: Maybe<Array<{ image?: Maybe<string> }>> }>;
  about?: Maybe<ApiHead & { image?: Maybe<string>; image_alt?: Maybe<string>; side_image?: Maybe<string>; side_image_alt?: Maybe<string>; button_text?: Maybe<string>; button_url?: Maybe<string> }>;
  statistics?: Maybe<{ enabled?: Maybe<boolean>; status?: Maybe<boolean>; items?: Maybe<Array<{ number?: Maybe<string>; title?: Maybe<string>; icon?: Maybe<string> }>> }>;
  offerings?: Maybe<ApiHead & {
    items?: Maybe<Array<{
      tab_title?: Maybe<string>; icon?: Maybe<string>; image?: Maybe<string>; title?: Maybe<string>; subtitle?: Maybe<string>;
      description?: Maybe<string>; button_text?: Maybe<string>; button_link?: Maybe<string>;
    }>>;
  }>;
  industries?: Maybe<ApiHead & { items?: Maybe<Array<{ title?: Maybe<string>; description?: Maybe<string>; icon?: Maybe<string>; url?: Maybe<string>; link?: Maybe<string>; button_link?: Maybe<string> }>> }>;
  value?: Maybe<ApiHead & { items?: Maybe<Array<{ title?: Maybe<string>; description?: Maybe<string>; icon?: Maybe<string> }>> }>;
  callout?: Maybe<{
    text_before?: Maybe<string>; typed_words?: Maybe<Array<{ word: string }>>; text_after?: Maybe<string>;
    button_text?: Maybe<string>; button_url?: Maybe<string>; enabled?: Maybe<boolean>; status?: Maybe<boolean>;
  }>;
  process?: Maybe<ApiHead & { items?: Maybe<Array<{ number?: Maybe<string>; icon?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string> }>> }>;
  testimonials?: Maybe<ApiHead & {
    testimonials?: Maybe<Array<{ id: number; name?: Maybe<string>; designation?: Maybe<string>; company?: Maybe<string>; image?: Maybe<string>; review?: Maybe<string>; status?: Maybe<boolean> }>>;
  }>;
  portfolio?: Maybe<ApiHead & {
    portfolios?: Maybe<Array<{
      id: number; title?: Maybe<string>; slug?: Maybe<string>; tagline?: Maybe<string>; short_description?: Maybe<string>;
      image?: Maybe<string>; image_alt?: Maybe<string>; status?: Maybe<boolean>;
    }>>;
  }>;
  technologies?: Maybe<ApiHead & {
    technologies?: Maybe<Array<{ id: number; title?: Maybe<string>; slug?: Maybe<string>; images?: Maybe<Array<{ id: number; url?: Maybe<string>; alt?: Maybe<string> }>> }>>;
  }>;
  blogs?: Maybe<ApiHead & {
    blogs?: Maybe<Array<{
      id: number; title?: Maybe<string>; slug?: Maybe<string>; short_description?: Maybe<string>; image?: Maybe<string>;
      image_alt?: Maybe<string>; published_at?: Maybe<string>; updated_at?: Maybe<string>; status?: Maybe<boolean>;
    }>>;
  }>;
}

export interface ApiHome {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiHomeSections>;
}

/** Section toggles every admin block carries. */
interface ApiToggle { enabled?: Maybe<boolean>; status?: Maybe<boolean> }

/** GET /pages/about: the admin panel's "About" page, rendered by the Who we are page (/who-we-are). */
export interface ApiAboutSections {
  hero?: Maybe<ApiToggle & { title?: Maybe<string>; subtitle?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string> }>;
  featured_projects?: Maybe<ApiToggle & { items?: Maybe<Array<{ image?: Maybe<string> }>> }>;
  about?: Maybe<ApiToggle & {
    title?: Maybe<string>; description?: Maybe<string>; button_text?: Maybe<string>; button_url?: Maybe<string>;
    image?: Maybe<string>; image_alt?: Maybe<string>;
  }>;
  statistics?: Maybe<ApiToggle & { items?: Maybe<Array<{ number?: Maybe<string>; title?: Maybe<string>; icon?: Maybe<string> }>> }>;
  leadership?: Maybe<ApiHead & { items?: Maybe<Array<{ image?: Maybe<string>; name?: Maybe<string>; designation?: Maybe<string>; description?: Maybe<string> }>> }>;
  mission_vision?: Maybe<ApiHead & { items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string> }>> }>;
  values?: Maybe<ApiHead & { items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string> }>> }>;
  history?: Maybe<ApiHead & {
    icon?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>;
    items?: Maybe<Array<{ year?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string> }>>;
  }>;
  /** The callout bar (typed words + button) before the testimonials. */
  callout?: ApiHomeSections['callout'];
  /** About blocks name the small label `subtitle` where the home page calls it `small_title`. */
  testimonials?: Maybe<NonNullable<ApiHomeSections['testimonials']> & { subtitle?: Maybe<string> }>;
  portfolio?: Maybe<NonNullable<ApiHomeSections['portfolio']> & { subtitle?: Maybe<string> }>;
  technologies?: Maybe<NonNullable<ApiHomeSections['technologies']> & { subtitle?: Maybe<string> }>;
}

export interface ApiAbout {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiAboutSections>;
}

/** GET /pages/process: the admin panel's "Process" page, rendered by the How we work page (/how-we-work). */
export interface ApiProcessSections {
  hero?: Maybe<ApiToggle & {
    title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>;
    button_1_text?: Maybe<string>; button_1_url?: Maybe<string>; button_2_text?: Maybe<string>; button_2_url?: Maybe<string>;
  }>;
  banner?: Maybe<ApiToggle & { items?: Maybe<Array<{ image?: Maybe<string> }>> }>;
  how_it_works?: Maybe<ApiHead & { button_text?: Maybe<string>; button_url?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string> }>;
  process_steps?: Maybe<ApiHead & { items?: Maybe<Array<{ number?: Maybe<string>; icon?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string> }>> }>;
  /** The callout bar (typed words + button) before the testimonials. */
  callout?: ApiHomeSections['callout'];
  testimonials?: Maybe<NonNullable<ApiHomeSections['testimonials']>>;
  portfolio?: Maybe<NonNullable<ApiHomeSections['portfolio']>>;
  technologies?: Maybe<NonNullable<ApiHomeSections['technologies']>>;
  blogs?: Maybe<NonNullable<ApiHomeSections['blogs']>>;
}

export interface ApiProcess {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiProcessSections>;
}

/** GET /pages/client-review: the admin panel's "Client review" page, rendered by the Client Review page (/client-review). */
export interface ApiClientReviewSections {
  hero?: Maybe<ApiToggle & {
    title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>;
    button_1_text?: Maybe<string>; button_1_url?: Maybe<string>; button_2_text?: Maybe<string>; button_2_url?: Maybe<string>;
  }>;
  banner?: Maybe<ApiToggle & { items?: Maybe<Array<{ image?: Maybe<string> }>> }>;
  /** Texts above the Clutch.co widget (the widget itself has no API field). */
  clutch?: Maybe<ApiHead>;
  testimonials?: Maybe<ApiHead & {
    testimonials?: Maybe<Array<{
      id: number; name?: Maybe<string>; designation?: Maybe<string>; company?: Maybe<string>; image?: Maybe<string>;
      review?: Maybe<string>; rating?: Maybe<number>; status?: Maybe<boolean>;
    }>>;
  }>;
  technologies?: Maybe<NonNullable<ApiHomeSections['technologies']>>;
  blogs?: Maybe<NonNullable<ApiHomeSections['blogs']>>;
}

export interface ApiClientReview {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiClientReviewSections>;
}

/** GET /pages/technology: the admin panel's "Technology" page, rendered by the Technologies page (/technologies). */
export interface ApiTechnologySections {
  hero?: Maybe<ApiToggle & {
    title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>;
    button_text?: Maybe<string>; button_link?: Maybe<string>;
  }>;
  /** One logo group per technology (title + pictures); the block's own texts head the tabbed technologies block at the end. */
  technologies?: Maybe<NonNullable<ApiHomeSections['technologies']>>;
  /** The callout bar (typed words + button) between the logo groups and the testimonials. */
  callout?: ApiHomeSections['callout'];
  testimonials?: Maybe<NonNullable<ApiHomeSections['testimonials']>>;
  featured_in?: Maybe<ApiHead & { items?: Maybe<Array<{ image?: Maybe<string>; alt?: Maybe<string> }>> }>;
  blogs?: Maybe<NonNullable<ApiHomeSections['blogs']>>;
}

export interface ApiTechnology {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiTechnologySections>;
}


/** GET /pages/portfolio: the admin panel's "Portfolio" page, rendered by the Portfolio page (/portfolio). */
export interface ApiPortfolioSections {
  hero?: Maybe<ApiToggle & {
    title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>;
    button_1_text?: Maybe<string>; button_1_url?: Maybe<string>; button_2_text?: Maybe<string>; button_2_url?: Maybe<string>;
  }>;
  /** Logo strip under the hero (rendered as `brandLogos`). */
  banner?: Maybe<ApiToggle & { items?: Maybe<Array<{ image?: Maybe<string> }>> }>;
  /** The projects, one row each. `service` is the category the project is filed under (it drives the filter bar). */
  portfolio?: Maybe<ApiToggle & {
    portfolios?: Maybe<Array<{
      id: number; title?: Maybe<string>; slug?: Maybe<string>; tagline?: Maybe<string>; short_description?: Maybe<string>;
      description?: Maybe<string>; project_url?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>; status?: Maybe<boolean>;
      service?: Maybe<{ id: number; title?: Maybe<string>; slug?: Maybe<string>; icon?: Maybe<string> }>;
    }>>;
  }>;
  /** The callout bar (typed words + button) before the testimonials. */
  callout?: ApiHomeSections['callout'];
  testimonials?: Maybe<NonNullable<ApiHomeSections['testimonials']>>;
  /** Heading + a row of pictures: the "featured in" strip. */
  our_work?: Maybe<ApiHead & { items?: Maybe<Array<{ image?: Maybe<string>; alt?: Maybe<string> }>> }>;
  technologies?: Maybe<NonNullable<ApiHomeSections['technologies']>>;
  blogs?: Maybe<NonNullable<ApiHomeSections['blogs']>>;
}

export interface ApiPortfolio {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiPortfolioSections>;
}

/** GET /pages/blog: the admin panel's "Blog" page, rendered by the Blog page (/blog). */
export interface ApiBlogPost {
  id: number; title?: Maybe<string>; slug?: Maybe<string>; author?: Maybe<string>; author_image?: Maybe<string>;
  image?: Maybe<string>; image_alt?: Maybe<string>; short_description?: Maybe<string>; published_at?: Maybe<string>;
  updated_at?: Maybe<string>; status?: Maybe<boolean>; category?: Maybe<{ id: number; title?: Maybe<string>; slug?: Maybe<string> }>;
  /** Full article, rich text. */
  description?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
}

export interface ApiBlogSections {
  hero?: Maybe<ApiToggle & { title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string> }>;
  /** The articles (the list under the hero). */
  blogs?: Maybe<ApiHead & { blogs?: Maybe<ApiBlogPost[]> }>;
  /** The categories box of the sidebar. */
  blog_categories?: Maybe<ApiHead & { blog_categories?: Maybe<Array<{ id: number; title?: Maybe<string>; slug?: Maybe<string> }>> }>;
  /** The social links of the sidebar. */
  latest_tweets?: Maybe<ApiToggle & { title?: Maybe<string>; twitter_url?: Maybe<string>; facebook_url?: Maybe<string> }>;
  /** Only the texts above the testimonials; the reviews themselves come from GET /pages/client-review. */
  client_reviews?: Maybe<ApiHead>;
}

export interface ApiBlog {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiBlogSections>;
}

/** GET /pages/contact: the admin panel's "Contact" page, rendered by the Contact page (/contact). */
export interface ApiContactSections {
  hero?: Maybe<ApiToggle & { title?: Maybe<string>; sub_title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string> }>;
  /** The "schedule a meeting" card beside the form. */
  schedule?: Maybe<ApiToggle & {
    title?: Maybe<string>; sub_title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>;
    button_text?: Maybe<string>; button_url?: Maybe<string>;
  }>;
  /** The three boxes (email, phone, address ...): an uploaded icon, a title and a value. */
  contact_information?: Maybe<ApiToggle & { items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string>; value?: Maybe<string> }>> }>;
  /** The "follow us" bar: an uploaded icon per network and its link. */
  social_links?: Maybe<ApiToggle & { title?: Maybe<string>; items?: Maybe<Array<{ icon?: Maybe<string>; link?: Maybe<string> }>> }>;
  map?: Maybe<ApiToggle & { map_url?: Maybe<string> }>;
}

export interface ApiContact {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiContactSections>;
}

/** Block heads of GET /service-categories/<slug>: the small label is called `eyebrow` there. */
interface ApiCategoryHead { eyebrow?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string>; enabled?: Maybe<boolean>; status?: Maybe<boolean> }

/** GET /service-categories: every category with its services (also used for the page list and the service icons). */
export interface ApiServiceCategoryList {
  categories?: Maybe<Array<{ id: number; name?: Maybe<string>; slug?: Maybe<string>; icon?: Maybe<string>; services?: Maybe<Array<{ id: number; slug?: Maybe<string>; icon?: Maybe<string> }>> }>>;
}

export interface ApiServiceCategorySections {
  hero?: Maybe<ApiToggle & {
    eyebrow?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string>;
    button_text_1?: Maybe<string>; button_url_1?: Maybe<string>; button_text_2?: Maybe<string>; button_url_2?: Maybe<string>;
  }>;
  /** The client logo strip under the hero. */
  banners?: Maybe<ApiToggle & { items?: Maybe<Array<{ image?: Maybe<string>; alt?: Maybe<string> }>> }>;
  introduction?: Maybe<ApiCategoryHead & { button_text?: Maybe<string>; button_url?: Maybe<string>; image?: Maybe<string>; image_alt?: Maybe<string> }>;
  services?: Maybe<ApiCategoryHead & {
    items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string>; button_text?: Maybe<string>; button_url?: Maybe<string> }>>;
  }>;
  offerings?: Maybe<ApiCategoryHead & {
    items?: Maybe<Array<{
      image?: Maybe<string>; image_alt?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string>; points?: Maybe<string[]>;
      button_text?: Maybe<string>; button_url?: Maybe<string>;
    }>>;
  }>;
  features?: Maybe<ApiCategoryHead & {
    items?: Maybe<Array<{
      icon?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string>; points?: Maybe<string[]>; button_text?: Maybe<string>; button_url?: Maybe<string>;
    }>>;
  }>;
  benefits?: Maybe<ApiCategoryHead & {
    subheading?: Maybe<string>; button_text?: Maybe<string>; button_url?: Maybe<string>;
    items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string> }>>;
  }>;
  process?: Maybe<ApiCategoryHead & { items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string>; points?: Maybe<string[]> }>> }>;
  frameworks?: Maybe<ApiCategoryHead & {
    items?: Maybe<Array<{ image?: Maybe<string>; image_alt?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string>; button_text?: Maybe<string>; button_url?: Maybe<string> }>>;
  }>;
  callout?: ApiHomeSections['callout'];
  why_choose_us?: Maybe<ApiCategoryHead & { items?: Maybe<Array<{ icon?: Maybe<string>; title?: Maybe<string>; description?: Maybe<string> }>> }>;
  portfolio?: Maybe<ApiCategoryHead & { portfolios?: NonNullable<NonNullable<ApiHomeSections['portfolio']>['portfolios']> }>;
  testimonials?: Maybe<ApiCategoryHead & { testimonials?: NonNullable<NonNullable<ApiHomeSections['testimonials']>['testimonials']> }>;
  technologies?: Maybe<ApiCategoryHead & { technologies?: NonNullable<NonNullable<ApiHomeSections['technologies']>['technologies']> }>;
  faq?: Maybe<ApiCategoryHead & { items?: Maybe<Array<{ question?: Maybe<string>; answer?: Maybe<string> }>> }>;
}

/** GET /service-categories/<slug>: one category page. */
export interface ApiServiceCategory {
  category?: Maybe<{ id?: number; name?: Maybe<string>; slug?: Maybe<string>; seo?: Maybe<ApiSeo>; sections?: Maybe<ApiServiceCategorySections> }>;
  /** Latest articles; the `blog` section shows them under the head of the page's blog block. */
  blogs?: NonNullable<NonNullable<ApiHomeSections['blogs']>['blogs']>;
  /** Reviews of the category when the `testimonials` block does not carry its own. */
  testimonials?: NonNullable<NonNullable<ApiHomeSections['testimonials']>['testimonials']>;
}
