/**
 * Browser scripts. Everything is served from /scripts (no third-party CDN): fewer DNS lookups / connections, no
 * dependency on an outside host being up, and a strict Content-Security-Policy. The vendor files in /scripts/vendor
 * are the exact npm releases of jQuery 3.7.1, Bootstrap 4.6.2 (bundle), Slick 1.8.1 and SweetAlert2 11.4.0.
 */

/** Needed on every page, in the order they must run. */
export const CORE_SCRIPTS = [
  '/scripts/vendor/jquery-3.7.1.min.js',
  '/scripts/cookie-alert.js',
  '/scripts/vendor/bootstrap-4.6.2.bundle.min.js',
  '/scripts/jquery-cookie.js',
  '/scripts/vendor/slick-1.8.1.min.js',
  '/scripts/vendor-plugins.js',
  '/scripts/site.js',
  '/scripts/scroll-to-fixed.js',
  '/scripts/category-page.js',
  '/scripts/solution-page.js',
] as const;

/**
 * Scripts that only matter on some pages. Each is downloaded only when the rendered page contains an element matching
 * its CSS selector (every one of these files already does nothing without that markup), and they keep their order.
 */
export const PAGE_SCRIPTS: ReadonlyArray<{ src: string; when: string }> = [
  { src: '/scripts/portfolio-vendor.js', when: '.portfolio-preview-wrap' },
  { src: '/scripts/portfolio-page.js', when: '.portfolio-preview-wrap' },
  { src: '/scripts/blog-page.js', when: '#blog-list' },
  { src: '/scripts/contact-page.js', when: '#file, #file-trigger, .contact-map-main' },
  { src: '/scripts/about-page.js', when: '.our-history-progress-section' },
  { src: '/scripts/process-page.js', when: '.our-work-process-slider-section' },
  { src: '/scripts/client-review-page.js', when: '.clutch-widget' },
  { src: '/scripts/estimate-page.js', when: '#estimate-root' },
  { src: '/scripts/twentytwenty.js', when: '.twentytwenty-container' },
];

/** Runs after everything else (lazy images, history handling) and shows the success / error pop-ups. */
export const FINAL_SCRIPTS = ['/scripts/lazy-init.js', '/scripts/vendor/sweetalert2-11.4.0.min.js'] as const;

/** The scripts this page needs, in execution order. `has` says whether the DOM contains a selector. */
export function scriptsFor(has: (selector: string) => boolean): string[] {
  return [...CORE_SCRIPTS, ...PAGE_SCRIPTS.filter((item) => has(item.when)).map((item) => item.src), ...FINAL_SCRIPTS];
}

/** Bump this whenever a file in public/scripts changes. */
export const SCRIPT_VERSION = '2026-11-21-1';

export const withVersion = (src: string) => (src.startsWith('/') ? `${src}?v=${SCRIPT_VERSION}` : src);
