// Global settings managed in the admin panel (content/settings).

/** Optional SEO fields (meta, Open Graph, Twitter, canonical, structured data) sent by the admin panel. */
export interface SeoMeta {
  keywords?: string;
  robots?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  /** schema.org JSON-LD, already serialised. */
  schemaData?: string;
}

export interface SiteSettings {
  language: string;
  themeColor: string;
  seo: {
    title: string;
    description: string;
    siteName: string;
    favicon: string;
  } & SeoMeta;
  notFound: {
    heading: string;
    text: string;
    linkText: string;
    linkHref: string;
  };
}

export interface FormOption {
  value?: string;
  label: string;
}


export interface FormsContent {
  service: FormOption[];
  region: FormOption[];
  budget: FormOption[];
  reference: FormOption[];
}
