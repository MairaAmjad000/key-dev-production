import type { NextConfig } from 'next';

/** Origin of the admin panel (images, icons, form posts); empty in demo mode. */
const cmsOrigin = (() => {
  try {
    return process.env.CMS_API_URL ? new URL(process.env.CMS_API_URL).origin : '';
  } catch {
    return '';
  }
})();

/**
 * Content-Security-Policy. All scripts and styles are first-party (see components/scripts/script-list.ts); Next.js and
 * the legacy jQuery code need inline scripts / styles, so those stay allowed. What it blocks: plugins, foreign
 * <base>, framing by other sites, form posts to other sites, and scripts / frames from any host not listed here.
 * Images may come from any https host because the admin panel's uploads can live on its own storage (e.g. S3).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"} https://widget.clutch.co`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${cmsOrigin} https://*.clutch.co`.trim(),
  "frame-src https://www.google.com https://*.clutch.co",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${cmsOrigin}`.trim(),
  "frame-ancestors 'self'",
  ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Images keep readable (not hashed) names, so cache for a day then revalidate in the background.
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      // Fonts keep stable names, so no year-long "immutable" cache: a missing or replaced font file must be picked up quickly.
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      // Browser scripts keep stable names and hold page behaviour (portfolio filter, popups...), so always revalidate:
      // a day-long cache kept serving old, buggy copies after a fix. Unchanged files still answer with a quick 304.
      { source: '/scripts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
    ];
  },
};

export default nextConfig;
