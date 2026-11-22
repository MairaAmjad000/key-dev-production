/**
 * Public address of this site (e.g. https://www.example.com, no trailing slash), from SITE_URL. Used for the sitemap,
 * robots.txt, canonical links and social-share URLs. Empty when not configured: those features are then skipped
 * instead of guessing a wrong domain.
 */
export const siteUrl = (process.env.SITE_URL ?? '').replace(/\/+$/, '');
