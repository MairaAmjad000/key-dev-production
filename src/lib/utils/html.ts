type DOMPurifyLike = typeof import('isomorphic-dompurify').default;

/** Loaded on first use (jsdom is heavy and can fail to load in some serverless runtimes), see utils/svg.ts. */
let purifier: Promise<DOMPurifyLike | null> | null = null;
const getPurifier = () =>
  (purifier ??= import('isomorphic-dompurify')
    .then((module) => module.default)
    .catch((error) => {
      console.error('[html] DOMPurify could not be loaded; HTML from the API will be stripped to plain text', error);
      return null;
    }));

/** Tags and attributes the admin panel's rich text may use; scripts, handlers, iframes, forms and `javascript:` URLs never. (`style` attributes stay: editors use them for alignment.) */
const CONFIG: Parameters<DOMPurifyLike['sanitize']>[1] = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'base', 'meta', 'link'],
};

/** Strings without "<" cannot create elements, so they pass unchanged (this also keeps plain text like "A & B" intact). */
const hasMarkup = (value: string) => value.includes('<');

function withSafeLinks(html: string): string {
  // Links that open a new tab must not hand the opener window to the target page.
  return html.replace(/<a\b([^>]*?)\btarget="_blank"([^>]*)>/gi, (match, before: string, after: string) =>
    /\brel=/i.test(before + after) ? match : `<a${before}target="_blank" rel="noopener noreferrer"${after}>`,
  );
}

/** One HTML string made safe. Without DOMPurify it fails closed: every tag is removed. */
export async function sanitizeHtml(html: string): Promise<string> {
  if (!hasMarkup(html)) return html;
  const DOMPurify = await getPurifier();
  if (!DOMPurify) return html.replace(/<[^>]*>/g, '');
  return withSafeLinks(DOMPurify.sanitize(html, CONFIG));
}

/**
 * Walks content returned by the adapters and sanitizes every string that contains markup. Everything the admin
 * panel sends ends up in such strings (headings with <br>, descriptions, FAQ answers, footer text ...), and many
 * components render them with dangerouslySetInnerHTML, so this is the single place that keeps stored XSS out.
 */
export async function sanitizeDeep<T>(value: T): Promise<T> {
  if (typeof value === 'string') return (await sanitizeHtml(value)) as T;
  if (Array.isArray(value)) return (await Promise.all(value.map((item) => sanitizeDeep(item)))) as T;
  if (value && typeof value === 'object') {
    const entries = await Promise.all(Object.entries(value).map(async ([key, item]) => [key, await sanitizeDeep(item)] as const));
    return Object.fromEntries(entries) as T;
  }
  return value;
}
