import DOMPurify from 'isomorphic-dompurify';

/** Largest SVG (in bytes) that is inlined; anything bigger stays a normal <img>. */
export const MAX_SVG_BYTES = 150_000;

/** True when an icon address points at an .svg file (query string ignored). */
export const isSvgUrl = (value: string) => /\.svg(\?.*)?$/i.test(value.trim());

// Inline `style="fill:..."` would beat the stylesheet and block the hover colours, so those declarations are dropped.
// Presentation attributes (fill="#000") are kept: the stylesheet overrides them, they only act as the default look.
let hooked = false;
function ensureHook() {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const style = node.getAttribute?.('style');
    if (style === null || style === undefined) return;
    const kept = style
      .split(';')
      .filter((rule) => rule.trim() && !/^\s*(fill|stroke)(-opacity)?\s*:/i.test(rule))
      .join(';');
    if (kept) node.setAttribute('style', kept);
    else node.removeAttribute('style');
  });
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turns SVG text uploaded in the admin panel into markup that is safe to put in the page and styleable with CSS:
 *  - scripts, event handlers, <style>, <foreignObject>, remote <image>s and unsafe URLs are removed (DOMPurify);
 *  - width / height are dropped (the slot's CSS sizes the icon) after making sure a viewBox exists;
 *  - ids are prefixed with `uid`, so gradients / clip paths of two icons on one page can never clash.
 * Returns null when the text is not a usable SVG.
 */
export function sanitizeSvg(raw: string, uid: string): string | null {
  if (!raw || raw.length > MAX_SVG_BYTES) return null;
  ensureHook();
  const body = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['style', 'script', 'foreignObject', 'image', 'a', 'animate', 'set', 'animateTransform', 'animateMotion'],
    FORBID_ATTR: ['onload', 'onclick', 'onerror'],
    RETURN_DOM: true,
  }) as HTMLElement;
  const svg = body?.querySelector?.('svg');
  if (!svg) return null;

  const width = parseFloat(svg.getAttribute('width') ?? '');
  const height = parseFloat(svg.getAttribute('height') ?? '');
  if (!svg.getAttribute('viewBox') && width > 0 && height > 0) svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.removeAttribute('x');
  svg.removeAttribute('y');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const ids = [svg, ...Array.from(svg.querySelectorAll('[id]'))].flatMap((el) => (el.getAttribute('id') ? [el.getAttribute('id') as string] : []));
  let html = svg.outerHTML;
  for (const id of ids) {
    const safe = escapeRegExp(id);
    html = html
      .replace(new RegExp(`\\bid="${safe}"`, 'g'), `id="${uid}-${id}"`)
      .replace(new RegExp(`url\\(#${safe}\\)`, 'g'), `url(#${uid}-${id})`)
      .replace(new RegExp(`href="#${safe}"`, 'g'), `href="#${uid}-${id}"`);
  }
  return html;
}
