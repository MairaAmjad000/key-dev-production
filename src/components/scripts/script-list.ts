/** Browser scripts, in the order they must run. Shared by the loader (client) and the preloader (server). */
export const SCRIPTS = [
  'https://code.jquery.com/jquery-3.7.1.min.js',
  '/scripts/cookie-alert.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js',
  '/scripts/jquery-cookie.js',
  'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js',
  '/scripts/vendor-plugins.js',
  '/scripts/site.js',
  '/scripts/scroll-to-fixed.js',
  '/scripts/category-page.js',
  '/scripts/solution-page.js',
  '/scripts/portfolio-vendor.js',
  '/scripts/portfolio-page.js',
  '/scripts/blog-page.js',
  '/scripts/contact-page.js',
  '/scripts/about-page.js',
  '/scripts/process-page.js',
  '/scripts/client-review-page.js',
  '/scripts/estimate-page.js',
  '/scripts/twentytwenty.js',
  '/scripts/lazy-init.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11.4.0/dist/sweetalert2.min.js',
] as const;

/** Bump this whenever a file in public/scripts changes. */
export const SCRIPT_VERSION = '2026-11-20-1';

export const withVersion = (src: string) => (src.startsWith('/') ? `${src}?v=${SCRIPT_VERSION}` : src);
