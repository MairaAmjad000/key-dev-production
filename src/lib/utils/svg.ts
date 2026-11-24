type DOMPurifyLike = typeof import('isomorphic-dompurify').default;

/**
 * Loaded on first use, not at startup: isomorphic-dompurify pulls in jsdom, which can fail to load in serverless
 * environments such as Vercel. A failure here must only cost one icon (it falls back to a plain <img>), never the page.
 */
let purifier: Promise<DOMPurifyLike> | null = null;
const getPurifier = () => (purifier ??= import('isomorphic-dompurify').then((module) => module.default));

/** Largest SVG (in bytes) that is inlined; anything bigger stays a normal <img>. */
export const MAX_SVG_BYTES = 150_000;

/** True when an icon address points at an .svg file (query string ignored). */
export const isSvgUrl = (value: string) => /\.svg(\?.*)?$/i.test(value.trim());

// Inline `style="fill:..."` would beat the stylesheet and block the hover colours, so those declarations are dropped.
// They are not lost though: fill / stroke are moved to presentation attributes (fill="none", stroke="#000"), which the
// stylesheet overrides but which keep the icon's own look as the default (a stroke-only icon stays a stroke-only icon).
// `inlinePaint` remembers which elements had an inline value, because that beats a class rule from the SVG's <style>.
const PAINT_PROPS = ['fill', 'stroke'] as const;
const inlinePaint = new WeakSet<Element>();
// Properties read from the SVG's own <style> classes: the two colours plus what keeps an outline looking the same.
const CLASS_PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'fill-rule', 'clip-rule'];
let hooked = false;
function ensureHook(DOMPurify: DOMPurifyLike) {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const style = node.getAttribute?.('style');
    if (style === null || style === undefined) return;
    const kept: string[] = [];
    for (const rule of style.split(';')) {
      const [prop, ...rest] = rule.split(':');
      const name = prop?.trim().toLowerCase();
      if (!name || !rest.length) continue;
      const value = rest.join(':').replace(/!important/i, '').trim();
      if ((PAINT_PROPS as readonly string[]).includes(name)) {
        if (value && !/url\(/i.test(value)) {
          node.setAttribute(name, value);
          inlinePaint.add(node);
        }
      } else if (!/^(fill|stroke)-opacity$/.test(name)) {
        kept.push(rule.trim());
      }
    }
    if (kept.length) node.setAttribute('style', kept.join(';'));
    else node.removeAttribute('style');
  });
}

/**
 * Editors such as Illustrator write colours as classes in a <style> block (`.st0{fill:none;stroke:#000}`). <style> is
 * stripped for safety, which would turn every such icon into a black blob, so the simple `.class { fill / stroke }`
 * rules are read from the raw text here and applied as presentation attributes after sanitizing.
 */
function readClassPaints(raw: string): Map<string, Record<string, string>> {
  const map = new Map<string, Record<string, string>>();
  for (const block of raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = block[1].replace(/\/\*[\s\S]*?\*\/|<!\[CDATA\[|\]\]>/g, '');
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const paints: Record<string, string> = {};
      for (const decl of rule[2].split(';')) {
        const [prop, ...rest] = decl.split(':');
        const name = prop?.trim().toLowerCase();
        const value = rest.join(':').replace(/!important/i, '').trim();
        if (name && CLASS_PROPS.includes(name) && value && !/url\(/i.test(value)) paints[name] = value;
      }
      if (!Object.keys(paints).length) continue;
      for (const selector of rule[1].split(',')) {
        const match = selector.trim().match(/^(?:[a-z]+)?\.([\w-]+)$/i);
        if (match) map.set(match[1], { ...map.get(match[1]), ...paints });
      }
    }
  }
  return map;
}

/** Value of fill / stroke for an element, inherited from the nearest ancestor that sets it. */
function paintOf(el: Element, name: 'fill' | 'stroke'): string | undefined {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const value = node.getAttribute(name)?.trim();
    if (value) return value.toLowerCase();
  }
  return undefined;
}

const SHAPES = new Set(['path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect']);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turns SVG text uploaded in the admin panel into markup that is safe to put in the page and styleable with CSS:
 *  - scripts, event handlers, <style>, <foreignObject>, remote <image>s and unsafe URLs are removed (DOMPurify);
 *  - width / height are dropped (the slot's CSS sizes the icon) after making sure a viewBox exists;
 *  - ids are prefixed with `uid`, so gradients / clip paths of two icons on one page can never clash.
 * Returns null when the text is not a usable SVG.
 */
export async function sanitizeSvg(raw: string, uid: string): Promise<string | null> {
  if (!raw || raw.length > MAX_SVG_BYTES) return null;
  const DOMPurify = await getPurifier();
  ensureHook(DOMPurify);
  const body = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['style', 'script', 'foreignObject', 'image', 'a', 'animate', 'set', 'animateTransform', 'animateMotion'],
    FORBID_ATTR: ['onload', 'onclick', 'onerror'],
    RETURN_DOM: true,
  }) as HTMLElement;
  const svg = body?.querySelector?.('svg');
  if (!svg) return null;

  // Colours the SVG kept in its <style> block (see readClassPaints), unless an inline style on the element wins.
  const classPaints = readClassPaints(raw);
  if (classPaints.size) {
    for (const el of Array.from(svg.querySelectorAll('[class]'))) {
      if (inlinePaint.has(el)) continue;
      for (const name of (el.getAttribute('class') ?? '').split(/\s+/)) {
        for (const [prop, value] of Object.entries(classPaints.get(name) ?? {})) el.setAttribute(prop, value);
      }
    }
  }

  // Stroke-only shapes (outline icons) get `cms-stroke`: the stylesheet colours them through `stroke` on hover and
  // keeps them unfilled, instead of the `fill` rules turning the outline into a solid blob.
  for (const el of Array.from(svg.querySelectorAll('*'))) {
    if (!SHAPES.has(el.tagName.toLowerCase())) continue;
    const stroke = paintOf(el, 'stroke');
    if (stroke && stroke !== 'none' && paintOf(el, 'fill') === 'none') el.classList.add('cms-stroke');
  }

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