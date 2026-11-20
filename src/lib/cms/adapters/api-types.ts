/**
 * Shapes of the admin-panel API responses (GET {CMS_API_URL}/layout, /form-options, /global-sections, /home).
 * Every field is optional or nullable on purpose: the admin panel may leave any of them empty, and the
 * adapters fall back to the bundled content/ when a value is missing.
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
      image_alt?: Maybe<string>; published_at?: Maybe<string>; status?: Maybe<boolean>;
    }>>;
  }>;
}

export interface ApiHome {
  page?: Maybe<string>;
  seo?: Maybe<ApiSeo>;
  sections?: Maybe<ApiHomeSections>;
  global?: Maybe<ApiGlobalSections>;
}
